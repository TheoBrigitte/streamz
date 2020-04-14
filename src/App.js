import React from 'react';
import axios from 'axios'
import Search from './Search';
import PlyrComponent from './PlyrComponent';

class App extends React.Component {
    // Initialize value when component is created.
    constructor(props) {
        super(props)
        this.state = {
            status: 'off',
            loaded: false,
            metadata: null,
            squares: Array(1).fill({Status: "initialize", Width: 100}),
            subtitleID: null,
            subtitles: [],
        };
        this.plyr = <PlyrComponent
            sources={{
                type: 'video',
                sources: [],
            }}
            options={{
                controls: [
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'captions',
                    'settings',
                    'fullscreen',
                ],
            }}
            />
    }


    componentDidMount() {
        // Load hash from url anchor.
        if (window.location.hash.length > 0) {
            var value = window.location.hash.substr(1)
            //this.setState({ hash: window.location.hash.substr(1) })

            //var event = new Event('change', { bubbles: true });
            //console.log(this.refs.hash);
            //console.log(event);
            //this.refs.hash.dispatchEvent(event, { value: value });
            this.refs.hash.value = value

            var fakeEvent = { target: { value: value } }
            this.handleHashChange(fakeEvent)
        }
    }

    handleSearchClick = (value) => {
        console.log("search click", value); // value is 42
        var fakeEvent = { target: { value: value } }
        this.handleHashChange(fakeEvent)
    };

    handleSubtitleChange(id) {
        console.log("handleSubtitleChange", id)
        //this.refs.hash.value = value
        this.setState({ subtitleID: id });
    }

    wsConnect = (hash) => {
        // Poll information on download progression.
        var ws = new WebSocket(this.props.api_ws+"/progress?ih="+hash)

        ws.onopen = () => {
            console.log("ws connected")

            this.setState({ status: "websocket connected" })
        }
        ws.onmessage = evt => {
            console.log("ws event")

            // when receiving an event update the progress bar.
            const bars = JSON.parse(evt.data)
            this.setState({ squares: bars })
        }
        ws.onclose = () => {
            console.log('ws disconnected')

            // automatically try to reconnect on connection loss
            this.setState({ status: "websocket disconnected" })
            setTimeout(this.wsConnect(hash), 1000)
        }
    }

    // Handles changes when a value is entered in the input field.
    handleHashChange(event) {
        console.log("fetching metadata", event.target.value)

        // Query metadata.
        this.setState({
            status: "fetching metadata",
            loaded: false,
            metadata: null,
            squares: Array(1).fill({Status: "initialize", Width: 100}),
            subtitleID: null,
            subtitles: [],
            hash: event.target.value,
        })
        fetch(this.props.api_http+"/metadata?query="+event.target.value)
            .then(res => res.json())
            .then(res => {
                console.log("fetched metadata", res)
                this.setState({
                    status: "fetched metadata",
                    metadata: res,
                    hash: res.hash,
                })

                this.plyr.props.sources.sources[0] = {
                    src: this.props.api_http+"/data?ih=" + res.hash + "&path="+res.file,
                    type: 'video/mp4',
                }

                console.log("fetching subtitles")
                axios.get(this.props.api_http+"/subtitles?ih="+res.hash+"&path="+res.file)
                    .then(({ data }) => {
                        this.setState({
                            subtitles: data
                        })

                        this.plyr.props.sources.tracks = data.map((item,key) => this.renderSubtitlePlyr(this.props.api_http,item))
                    })
                    .finally(() => {
                        console.log("fetched subtitles")
                        this.setState({
                            loaded: true
                        })
                    })

                this.wsConnect(res.hash)
            })
            .catch(error => {
                console.log('request failed', error)

                this.setState({ status: "metadata failed" })
            });
    }

    // Render a fragment of the progress bar.
    renderSquare(item,key) {
        return (
            <div key={key} className={"bar " + item.Status} style={{width: item.Width+'%'}} />
        )
    }

    renderSubtitlePlyr(baseURL,item) {
        return (
            {
                kind: 'captions',
                label: item.language + ' (' + item.downloads + ')',
                srclang: 'en',
                src: baseURL+"/subtitle?id="+item.id,
            }
        )
    }

    renderSubtitleTrack(item,key) {
        return (
            <track
                kind="captions"
                srcLang="en"
                ref="subtitle"
                src={this.props.api_http+"/subtitle?id="+item.id} />
        )
    }

    renderSubtitle(item,key) {
        return (
            <div key={item.id} className={"subtitle label"} onClick={this.handleSubtitleChange.bind(this,item.id)} >
                <div>Name: {item.name}</div>
                <div>Language: {item.language}</div>
                <div>Downloads: {item.downloads}</div>
            </div>
        )
    }

    render() {
        //<div className="progress-bar">{React.Children.map(this.state.squares,(item) => this.renderSquare(item))}</div>
        //<div className="hash"><input type="text" placeholder="Magnet or Hash" ref="hash" name="hash" value={this.state.hash} onChange={this.handleHashChange.bind(this)} /></div>
        return (
            <div>
                <div className="info">
                    <div className="connection"><div className="label">Connection</div><div>{this.state.status}</div></div>
                    <div className="name"><div className="label">Name</div><div>{this.state.metadata ? this.state.metadata.name : ''}</div></div>
                </div>
                <div className="input">
                    <Search handleClick={this.handleSearchClick} api_http={this.props.api_http} api_ws={this.props.api_ws} />
                </div>
                <div className="player">
                    <div className="container">
                        {this.state.loaded ?
                        <div className="player-container">
                            {this.plyr}
                            <div className="progress">{this.state.squares.map((item,key) => this.renderSquare(item,key))}</div>
                        </div>
                        : '' }
                    </div>
                </div>
            </div>
        );
    }
}

export default App
