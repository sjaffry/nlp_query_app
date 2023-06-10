import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App({ signOut, user }) {
  const Spinner = () => (
    <div className="spinner">
      <div className="spinner-dot spinner-dot1"></div>
      <div className="spinner-dot spinner-dot2"></div>
      <div className="spinner-dot spinner-dot3"></div>
      <div className="spinner-dot spinner-dot4"></div>
    </div>
  );
  
  const [dateRange, setDateRange] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(' https://pdqcm4sps2.execute-api.us-east-1.amazonaws.com/Prod', {
            headers: {
              Authorization: user.signInUserSession.idToken.jwtToken
            },
          });
        // Do something with the response
        setExternalData(res.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchInitialData();
  }, []);
  
  const handleButtonClick = (index, date_range) => {
    setSelectedButton(index);
    setDateRange(date_range);
    console.log(date_range);
  }
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const response = await axios.get('https://1tf94b2vo8.execute-api.us-east-1.amazonaws.com/prod', {
          params: {
            date_range: dateRange,
            query: query
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

    setLoading(false);
  };

  return (
    <div>
      <div>
        <h3>Hello {user.username}</h3>
        <button class="signout-button" onClick={signOut} >Sign out</button>
        {externalData && (
          <h1>{externalData["Business name"]}</h1>
          )}
      </div>
      <div className="app">
      <div>
      {externalData && (
          <div>
          <h3>Week ending </h3>
          {externalData["Subfolders"].map((subfolder, index) => {
            const date = new Date(subfolder.substring(0,4), subfolder.substring(4,6) - 1, subfolder.substring(6,8));
            const formattedDate = date.toDateString()
            return (
              <button 
                key={index} 
                onClick={() => handleButtonClick(index, subfolder)}
                style={{backgroundColor: selectedButton === index ? 'lightblue' : 'initial'}}
              >
                {formattedDate}
              </button>
            );
          })}         
          </div>
      )}
      </div>
      <div>
      <form onSubmit={handleFormSubmit}>
        <div>
        <textarea
          rows="5" 
          cols="40"
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
      {loading && <Spinner />}
      <div>
      {response && (
          <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
      )}
      </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
