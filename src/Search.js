import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest';

class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            suggestions: [],

            query: '',
            results: [],
        }
    }

    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        })
    };

    onKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.onSuggestionsFetchRequested({value: this.state.value, reason: 'suggestion-revealed'})
        }
    };

    onSuggestionsFetchRequested = ({ value, reason }) => {
        if (reason === 'suggestion-revealed') {
            fetch(this.props.api_http+"/search?query="+value)
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
        }
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = ( e, s ) => {
        this.props.handleClick(s.suggestion.torrent.hash)
    };

    // Select which value fills input
    getSuggestionValue = suggestion => suggestion.title

    // Render suggestion items
    renderSuggestion = suggestion => (
        <span key={suggestion.id}>{suggestion.title}</span>
    )

    render() {
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: 'Movie title',
            value,
            onChange: this.onChange,
            onKeyDown: this.onKeyDown
        };


        return (
            <div>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    onSuggestionSelected={this.onSuggestionSelected}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>
        );
    }
}

export default Search
