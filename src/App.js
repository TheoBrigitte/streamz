import React from 'react';
import axios from 'axios'
import Search from './Search';


class App extends React.Component {
    // Initialize value when component is created.
    constructor(props) {
        super(props)
        this.state = {
            status: 'off',
            metadata: null,
            squares: Array(1).fill({Status: "initialize", Width: 100}),
            subtitleID: null,
            subtitles: [],
        };
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

    // Handles changes when a value is entered in the input field.
    handleHashChange(event) {
        console.log("handleHashChange", event.target.value)

        // Query metadata.
        this.setState({
            status: "fetching metadata",
            metadata: null,
            squares: Array(1).fill({Status: "initialize", Width: 100}),
            subtitleID: null,
            subtitles: [],
            hash: event.target.value,
        })
        fetch(this.props.api_http+"/metadata?query="+event.target.value)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.setState({
                    status: "fetched metadata",
                    metadata: res,
                    hash: res.hash,
                })


                axios.get(this.props.api_http+"/subtitles?ih="+res.hash+"&path="+res.file)
                    .then(({ data }) => {
                        this.setState({
                            subtitles: data
                        })
                    })

                // Poll information on download progression.
                this.ws = new WebSocket(this.props.api_ws+"/progress?ih="+res.hash)

                this.ws.onopen = () => {
                    this.setState({ status: "websocket connected" });
                    console.log("ws connected")
                }
                this.ws.onmessage = evt => {
                    // when receiving an event update the progress bar.
                    console.log("websocket event")
                    const bars = JSON.parse(evt.data)
                    this.setState({ squares: bars })
                }
                this.ws.onclose = () => {
                    // automatically try to reconnect on connection loss
                    this.setState({ status: "websocket disconnected" });
                    console.log('ws disconnected')
                    this.setState({
                        ws: new WebSocket(this.props.api_ws+"/progress?ih="+res.hash),
                    })
                }
            })
            .catch(error => {
                this.setState({ status: "metadata failed" })
                console.log('request failed', error)
            });
    }

    // Render a fragment of the progress bar.
    renderSquare(item,key) {
        return (
            <div key={key} className={"bar " + item.Status} style={{width: item.Width+'%'}} />
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
        return (
            <div>
                <div className="info">
                    <div className="connection"><div className="label">Connection</div><div>{this.state.status}</div></div>
                    <div className="name"><div className="label">Name</div><div>{this.state.metadata ? this.state.metadata.name : ''}</div></div>
                </div>
                <div className="input">
                    <div className="hash"><input type="text" placeholder="Magnet or Hash" ref="hash" name="hash" value={this.state.hash} onChange={this.handleHashChange.bind(this)} /></div>
                    <Search handleClick={this.handleSearchClick} api_http={this.props.api_http} api_ws={this.props.api_ws} />
                </div>
                <div className="player">
                    <div className="container">
                        {this.state.metadata ?
                        <div className="player-container">
                            <video autoPlay controls src={this.state.metadata ? this.props.api_http+"/data?ih=" + this.state.metadata.hash + "&path="+this.state.metadata.file: ''} type="video/mp4">
                                <track default kind="captions"
                                    srcLang="en"
                                    ref="subtitle"
                                    src={this.state.subtitleID ? this.props.api_http+"/subtitle?id="+this.state.subtitleID: ''} />
                            </video>
                            <div className="progress">{this.state.squares.map((item,key) => this.renderSquare(item,key))}</div>
                        </div>
                        : '' }
                        {this.state.subtitles.length > 0  ?
                        <div className="subtitles">
                            <div className="title label">Subtitles</div>
                            {this.state.subtitles.map((item,key) => this.renderSubtitle(item,key))}
                        </div>
                        : '' }
                    </div>
                </div>
            </div>
        );
    }
}

export default App
