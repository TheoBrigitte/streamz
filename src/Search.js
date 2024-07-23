import React from 'react'
import VideoDetail from './VideoDetail'

class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searching: false,
            suggestions: [],
        }
    }

    onKeyDown = (event) => {
        if (event.key === 'Enter') {
            console.log('onKeyDown', event.target.value)
            this.setState({
                suggestions: []
            })
            this.fetchRequested({value: event.target.value})
        }
    }

    fetchRequested = ({ value }) => {
        this.setState({
            searching: true
        })
        fetch(this.props.api.confluence+"/search?query="+value)
            .then(res => {
                if (res.ok)
                    return res.json()
                else
                    throw res
            })
            .then(data => {
                if (data.length > 0) {
                    this.setState({
                        suggestions: data
                    })
                }
            })
            .catch(error => {
                console.log('suggestion request failed', error)
            })
            .finally(() => {
                this.setState({
                    searching: false
                })
            })
    }

    onSuggestionSelected = ( e, s ) => {
        this.props.handleClick(s.torrent.hash)
    }

    // Render suggestion items
    renderSuggestion = suggestion => (
        <VideoDetail data={suggestion} api={this.props.api} key={suggestion.id} onClick={this.onSuggestionSelected} />
    )

    render() {
        return (
            <div className="search">
                <div className="input">
                    <input placeholder='Movie title' onKeyDown={this.onKeyDown} />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" aria-hidden="true" className="search-icon"><path d="M18 13c0-3.859-3.141-7-7-7s-7 3.141-7 7 3.141 7 7 7 7-3.141 7-7zm8 13c0 1.094-.906 2-2 2a1.96 1.96 0 01-1.406-.594l-5.359-5.344a10.971 10.971 0 01-6.234 1.937c-6.078 0-11-4.922-11-11s4.922-11 11-11 11 4.922 11 11c0 2.219-.672 4.406-1.937 6.234l5.359 5.359c.359.359.578.875.578 1.406z"></path></svg>
                      <div className={`loadingspinner ${this.state.searching?"":"hide"}`}></div>
                </div>

            {this.state.suggestions.length ? (
                <div className="result">
                    {this.state.suggestions.map(item => this.renderSuggestion(item))}
                </div>
            ) : (
                <div>
                    <h3>{this.state.searching ? 'Searching': 'No result'}</h3>
                </div>
            )}
            </div>
        );
    }
}

export default Search
