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
            searching: false,
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
            this.setState({
                searching: true
            })
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
                .finally(() => {
                    this.setState({
                        searching: false
                    })
                })
        }
    };

    onSuggestionsClearRequested = () => {
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

    renderInputComponent = inputProps => (
        <div className="input">
            <input {...inputProps} />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" aria-hidden="true" className="search-icon"><path d="M18 13c0-3.859-3.141-7-7-7s-7 3.141-7 7 3.141 7 7 7 7-3.141 7-7zm8 13c0 1.094-.906 2-2 2a1.96 1.96 0 01-1.406-.594l-5.359-5.344a10.971 10.971 0 01-6.234 1.937c-6.078 0-11-4.922-11-11s4.922-11 11-11 11 4.922 11 11c0 2.219-.672 4.406-1.937 6.234l5.359 5.359c.359.359.578.875.578 1.406z"></path></svg>
              <div className={`loadingspinner ${this.state.searching?"":"hide"}`}></div>
        </div>
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
            <div className="search">
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    onSuggestionSelected={this.onSuggestionSelected}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    renderInputComponent={this.renderInputComponent}
                    inputProps={inputProps}
                />

                <div className="result">
                    {this.state.suggestions.length ? (
                        this.state.suggestions.map(item => this.renderSuggestion(item))
                    ) : (
                        this.state.searching ? 'Searching': 'No result'
                    )}
                </div>
            </div>
        );
    }
}

export default Search
