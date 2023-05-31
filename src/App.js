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
      const response = await axios.get(`https://293d8oapa8.execute-api.us-east-1.amazonaws.com/prod?${params}`);
      setResponse(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          placeholder="Date range"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query"
        />
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name"
        />
        <button type="submit">Submit</button>
      </form>
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
