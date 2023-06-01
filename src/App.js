import React, { useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';

function App() {
  const [dateRange, setDateRange] = useState('');
  const [query, setQuery] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [response, setResponse] = useState(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const params = queryString.stringify({
      date_range: dateRange,
      query,
      business_name: businessName,
    });

    try {
      const response = await axios.get(`https://1tf94b2vo8.execute-api.us-east-1.amazonaws.com/prod?${params}`);
      setResponse(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse(null);
    }
  };

  return (
    <div>
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

export default App;
