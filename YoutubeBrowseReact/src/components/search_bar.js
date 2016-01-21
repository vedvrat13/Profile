import React, { Component } from "react";

class SearchBar extends Component {
    constructor(props){
        super(props);

        this.state = { searchTerm:"" };
    };

    render(){
        return (
            <div className="searchBar">
                <input
                value={this.state.searchTerm}
                onChange={ event => this.onInputChange(event.target.value) }/>
            </div>
        );
    };


    onInputChange(searchTerm){
        this.setState({searchTerm});
        this.props.onSearchChange(searchTerm);
    };

};

export default SearchBar;
