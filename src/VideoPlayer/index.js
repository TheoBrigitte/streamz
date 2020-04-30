import React from 'react';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default class VideoPlayer extends React.Component {
    componentDidMount() {
        // instantiate Video.js
        var tracksFunc = this.props.tracksFunc
        var onProgress = this.props.onProgress

        this.player = videojs(this.videoNode, this.props.options, function onPlayerReady() {
            console.log('player ready', this)

            if (onProgress)
                this.on('progress', onProgress)

            if (tracksFunc)
                tracksFunc(this)
        })
    }

    // destroy player on unmount
    componentWillUnmount() {
        if (this.player) {
            this.player.dispose()
        }
    }

    // wrap the player in a div with a `data-vjs-player` attribute
    // so videojs won't create additional wrapper in the DOM
    // see https://github.com/videojs/video.js/pull/3856
    render() {
        return (
            <div data-vjs-player>
                <video ref={ node => this.videoNode = node } className="video-js vjs-big-play-centered"></video>
            </div>
        )
    }
}
