import React from 'react';
import default_poster from './images/default_poster.png';

class VideoDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: props.data
        }
        this.onClick = (e) => {
            props.onClick(e, this.state.data)
        }
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className="movie" onClick={this.onClick}>
                <img src={default_poster} alt={this.state.data.title} />
                <div className="title">{this.state.data.title}</div>
                <div className="title">{this.state.data.year}</div>
            </div>
        )
    }
}

export default VideoDetail
