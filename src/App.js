import React from 'react'
import Search from './Search'
import VideoPlayer from './VideoPlayer'

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
        }
        this.ws = false

        this.videoPlayer = <VideoPlayer
            options={{
                autoplay: true,
                controls: true,
                sources: [],
                fluid: true,
            }}
            tracksFunc={this.tracksFunc}
            onProgress={this.progress}
        />
    }

    tracksFunc = (player) => {
        if (this.state && this.state.subtitles) {
            this.state.subtitles.forEach(item => {
                console.log('track', item.language)
                player.addRemoteTextTrack({
                    kind: 'subtitles',
                    label: item.language + ' (' + item.downloads + ')',
                    srclang: 'en',
                    src: this.props.api_http+"/subtitle?id="+item.id
                })
            })
        }
    }

    componentDidMount() {
        // Load hash from url anchor.
        if (window.location.hash.length > 0) {
            var value = window.location.hash.substr(1)

            var fakeEvent = { target: { value: value } }
            this.handleHashChange(fakeEvent)
        }
    }

    handleSearchClick = (value) => {
        console.log("search click", value)
        var fakeEvent = { target: { value: value } }
        this.handleHashChange(fakeEvent)
    }

    handleSubtitleChange(id) {
        console.log("handleSubtitleChange", id)

        this.setState({ subtitleID: id })
    }

    progress = (event) => {
        if (!this.ws) {
            this.ws = true
            this.wsConnect(this.state.hash)
        }
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

            this.setState({ status: "websocket disconnected" })
            this.ws = false
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
            .then(res => {
                if (res.ok)
                    return res.json()
                else
                    throw res
            })
            .then(res => {
                console.log("fetched metadata", res)
                this.setState({
                    status: "fetched metadata",
                    metadata: res,
                    hash: res.hash,
                })

                this.videoPlayer.props.options.sources[0] = {
                    src: this.props.api_http+"/data?ih=" + res.hash + "&path="+res.file,
                    type: 'video/mp4',
                }

                console.log("fetching subtitles")
                fetch(this.props.api_http+"/subtitles?ih="+res.hash+"&path="+res.file)
                    .then(res => {
                        if (res.ok)
                            return res.json()
                        else
                            throw res
                    })
                    .then(data => {
                        this.setState({
                            subtitles: data
                        })
                    })
                    .catch(error => {
                        console.log('subtitles request failed', error)
                    })
                    .finally(() => {
                        console.log("fetched subtitles")
                        this.setState({
                            loaded: true
                        })
                    })
            })
            .catch(error => {
                console.log('metadata request failed', error)

                this.setState({ status: "metadata failed" })
            })
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
        //<div className="hash"><input type="text" placeholder="Magnet or Hash" ref="hash" name="hash" value={this.state.hash} onChange={this.handleHashChange.bind(this)} /></div>
        return (
            <div>
                <div className="info">
                    <div className="connection"><div className="label">Connection</div><div>{this.state.status}</div></div>
                    <div className="name"><div className="label">Name</div><div>{this.state.metadata ? this.state.metadata.name : ''}</div></div>
                </div>
                <div className="search">
                    <Search handleClick={this.handleSearchClick} api_http={this.props.api_http} api_ws={this.props.api_ws} />
                </div>
                <div className="player">
                    <div className="container">
                        {this.state.loaded ?
                        <div className="player-container">
                            {this.videoPlayer}
                            <div className="progress">{this.state.squares.map((item,key) => this.renderSquare(item,key))}</div>
                        </div>
                        : '' }
                    </div>
                </div>
            </div>
        )
    }
}

export default App
