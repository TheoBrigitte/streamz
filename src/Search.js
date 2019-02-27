import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest';
import axios from 'axios'
//import Suggestions from './Suggestions'

const getSuggestionValue = suggestion => suggestion.title;

const renderSuggestion = suggestion => (
    <span>{suggestion.title}</span>
);

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

    onSuggestionsFetchRequested = ({ value }) => {
        axios.get(this.props.api_http+"/search?query="+value)
	    .then(({ data }) => {
                if (data.length > 0) {
                    this.setState({
                        suggestions: data
                    })
                }
	    })
    };

    onSuggestionsClearRequested = () => {
	this.setState({
	    suggestions: []
	});
    };

    onSuggestionSelected = ( e, s ) => {
	this.props.handleClick(s.suggestion.torrent.hash)
    };

    render() {
	const { value, suggestions } = this.state;

	const inputProps = {
	    placeholder: 'Movie title',
	    value,
	    onChange: this.onChange
	};


	return (
	    <Autosuggest
		suggestions={suggestions}
		onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
		onSuggestionsClearRequested={this.onSuggestionsClearRequested}
		onSuggestionSelected={this.onSuggestionSelected}
		getSuggestionValue={getSuggestionValue}
		renderSuggestion={renderSuggestion}
		inputProps={inputProps}
	    />
	);
    }
}

export default Search

