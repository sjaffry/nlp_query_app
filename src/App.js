import React, { useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [dateRange, setDateRange] = useState('');
  const [query, setQuery] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [response, setResponse] = useState(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'JWT fefege...'
    }

    try {
      const response = await axios.get('https://293d8oapa8.execute-api.us-east-1.amazonaws.com/prod', {
          params: {
            date_range: dateRange,
            query: query,
            business_name: businessName
          },
          headers: {
            Authorization: user.signInUserSession.idToken.jwtToken
          },
        });
        setResponse(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse(null);
    }
  };

  return (
    <div>
      <div>
        <h1>Hello {user.username}</h1>
        <button class="signout-button" onClick={signOut} >Sign out</button>
      </div>
      <div>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          placeholder="Date range"
        />
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name"
        />
        <div>
        <textarea
          rows="10" 
          cols="30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query"
        />
        </div>
        <div>
        <button type="submit">Submit</button>
        </div>
      </form>
      </div>
      <div>
      {response && (
          <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
      )}
      </div>
    </div>
  );
}

export default withAuthenticator(App);
