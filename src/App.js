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
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Call page load API
      try {
        const res = await axios.get('https://pdqcm4sps2.execute-api.us-east-1.amazonaws.com/Prod', {
            headers: {
              Authorization: user.signInUserSession.idToken.jwtToken
            },
          });
        setExternalData(res.data);
        setErrorMsg(null);
      } catch (error) {
        console.error('Error:', error);
        setErrorMsg(error.message);
      }
    };

    fetchInitialData();
  }, []);
  
  const handleButtonClick = async (index, date_range) => {
    setSummary(null);
    setSelectedButton(index);
    setDateRange(date_range);
    setSummaryLoading(true)
    
    // Call LLM Summary API
    try {
      const response = await axios.get('https://zmgz9j814l.execute-api.us-east-1.amazonaws.com/prod', {
          params: {
            date_range: date_range
          },
          headers: {
            Authorization: user.signInUserSession.idToken.jwtToken
          },
        });
        setSummary(response.data);
        setErrorMsg(null);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message);
      setSummary(null);
    }

    setSummaryLoading(false);
  }
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!query.trim() || !dateRange) {
      alert('Select a week and enter a question before submitting.');
      return;
    }
    setQueryLoading(true);
    setResponse(null);

    // Call LLM Q&A API
    try {
      const response = await axios.get('https://293d8oapa8.execute-api.us-east-1.amazonaws.com/prod', {
          params: {
            date_range: dateRange,
            query: query
          },
          headers: {
            Authorization: user.signInUserSession.idToken.jwtToken
          },
        });
        setResponse(response.data);
        setErrorMsg(null);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message);
      setResponse(null);
    }

    setQueryLoading(false);
  };

  return (
    <div>
      <div className="shift-right Page half">
        <h3>Hello {user.username}</h3>
        {errorMsg && (
          <p style={{ color: 'red' }}>{errorMsg}</p>
        )}
        <button class="signout-button" onClick={signOut} >Sign out</button>
        {externalData && (
          <h1>{externalData["Business name"]}</h1>
          )}
      {externalData && (
          <div>
          <h3>Analyze customer reviews  for week ending: </h3>
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
      <div className="container">
      <div className="App Page half">
      <div  >
        {summaryLoading && <Spinner />} 
        <h3>Summary </h3>
        <textarea
        rows="20" 
        cols="50"
        value={summary ? JSON.stringify(summary, null, 2) : ''}
        />
      </div>
      </div>
      <div className="App half">
      <div>
      <h3>Ask a specific question </h3>
      <div>
      <form onSubmit={handleFormSubmit}>
        <div>
        <textarea
          rows="8" 
          cols="50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Question.."
        />
        </div>
        <div>
        <button type="submit">Submit</button>
        </div>
      </form>
      </div>
      {queryLoading && <Spinner />}      
      <div>
        <textarea
        rows="8" 
        cols="50"
        value={response ? JSON.stringify(response, null, 2) : ''}
        placeholder="Answer.."
        />
      </div>
      <button onClick={() => { setQuery(''); setResponse(null); }}>Clear</button>
      </div>
      </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
