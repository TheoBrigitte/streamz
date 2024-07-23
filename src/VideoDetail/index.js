import React from 'react';
import default_poster from './images/default_poster.png';

class VideoDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: props.data.id,
            title: props.data.title,
            torrent: props.data.torrent,
            date: props.data.year,
            imdb_id: props.data.external_id.imdb,
            image: default_poster,
        }
        this.onClick = (e) => {
            props.onClick(e, this.state)
        }
    }

    componentDidMount() {
        console.log('video detail fetch', this.state.imdb_id)
        fetch(this.props.api.tmdb+'/3/find/'+this.state.imdb_id+'?external_source=imdb_id')
            .then(res => {
                if (res.ok)
                    return res.json()
                else
                    throw res
            })
            .then(data => {
                if (data.movie_results.length > 0) {
                    console.log('video detail done', this.state.imdb_id)
                    this.setState({
                        title: data.movie_results[0].title,
                        date: data.movie_results[0].release_date,
                        image: this.props.api.tmdb_image+'/w342'+data.movie_results[0].poster_path,
                    })
                }
            })
            .catch(error => {
                console.log('video detail error', error)
            })
    }

    render() {
        return (
            <div className="movie" onClick={this.onClick}>
                <img src={this.state.image} alt={this.state.title} />
                <div className="title">{this.state.title}</div>
                <div className="title">{this.state.date}</div>
            </div>
        )
    }
}

export default VideoDetail
