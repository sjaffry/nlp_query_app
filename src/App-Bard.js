import React, { Component } from "react";
import ReactDOM from "react-dom";

class App extends Component {
  state = {
    date_range: "",
    query: "",
    business_name: "",
    data: []
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const url = `https://1tf94b2vo8.execute-api.us-east-1.amazonaws.com/prod/?date_range=${this.state.date_range}&query=${this.state.query}&business_name=${this.state.business_name}`;

    fetch(url)
      .then(response => response.json())
      .then(data => this.setState({ data }));
  };

  render() {
    return (
      <div>
        <h1>React App</h1>
        <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="date_range">Date Range</label>
            <input type="text" id="date_range" name="date_range" value={this.state.date_range} onChange={this.handleChange} />
          </div>
          <div>
            <label htmlFor="query">Query</label>
            <input type="text" id="query" name="query" value={this.state.query} onChange={this.handleChange} />
          </div>
          <div>
            <label htmlFor="business_name">Business Name</label>
            <input type="text" id="business_name" name="business_name" value={this.state.business_name} onChange={this.handleChange} />
          </div>
          <button type="submit">Submit</button>
        </form>
        </div>
        <p>
        <div>
          <h3>Response:</h3>
          {this.state.data}
        </div>
        </p>
      </div>
    );
  }
}

export default App;