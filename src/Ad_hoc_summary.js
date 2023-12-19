import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress } from '@mui/material';
import { Link } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Sidepanel from './components/Sidepanel';
Amplify.configure(awsExports);


const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
});

const Ad_hoc_summary = ({ signOut, user }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showFilename, setShowFilename] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups']

  useEffect(() => {}, []);


  const splitLLMResult = (text) => {
    const summaryMatch = text.match(/Summary:(.*?)(?=Top 5 recommendations:|$)/s);
    const recommendationsMatch = text.match(/Top 5 recommendations:(.*)/s);  

    // Extract the Summary and Recommendations sections
    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "";

    return {
      "Summary": summary,
      "Recommendations": recommendations
    };

  }  
// Call LLM Summary API
  const GenerateSummary = async (fileName) => {
    setSummaryLoading(true);
    setSummary(null);
    setRecommendations(null);

    // Call LLM Summary API
    const url1 = 'https://nvo134vi7a.execute-api.us-east-1.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        file_name: fileName
      },
      headers: {
        Authorization: user.signInUserSession.idToken.jwtToken
      }
    })
    .then(response => {
      const llmText = splitLLMResult(response.data);
      setSummary(llmText.Summary);
      setRecommendations(llmText.Recommendations);
      setErrorMsg(null);
      setSummaryLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      setSummary(null);
    });
  }

// S3 Upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  setFile(file);
  const fileType = file.type;
  const fileName = file.name;
  //PROD URL
  const url = "https://t8q9viy6bb.execute-api.us-east-1.amazonaws.com/Prod?"
  const signUrl = url.concat("business_name="+business_name+"&file_name="+fileName+"&upload_dir=document");
  axios.get(signUrl)
  .then(response => {
    var signedRequest = response.data.uploadURL;
    var options = {
      headers: {
        'Content-Type': fileType,
      }
    };
    setShowSpinner(true);
    axios.put(signedRequest,file,options)
    .then(
      result => { 
        setShowSpinner(false);
        setShowFilename(true);
        GenerateSummary(file.name)
      })
    .catch(error => {
      alert("ERROR " + JSON.stringify(error));
    })
  })
  .catch(error => {
    alert(JSON.stringify(error));
  })
};  

// Call LLM Q&A API
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Form validation
    if (!query.trim() || !reviewDate) {
        alert('Select a week and enter a question before submitting.');
        return;
      }
      setSubmitLoading(true);
      setResponse(null);
  
      try {
        const response = await axios.get('https://1tf94b2vo8.execute-api.us-east-1.amazonaws.com/prod', {
            params: {
              date_range: reviewDate,
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

      setSubmitLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        <Button variant="contained" sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#1d2636'}} onClick={signOut}>
          Logout
        </Button>
        <Sidepanel
          business_name={business_name}
        />
        <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
          <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Typography variant="h5" gutterBottom>Analyze reviews ad-hoc</Typography>
          <Box sx={{ display: 'flex', mb: 3 }}>
            <Button
              variant="contained"
              component="label"
              sx={{ width: '30%', p: 2, mr: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
              {showSpinner && <CircularProgress />}
              {showFilename && <Typography variant="subtitle1">{file.name}</Typography>}
          </Box>
          <Dashboard
            summaryLoading={summaryLoading}
            summary={summary}
            recommendations={recommendations}
            query={query}
            setQuery={setQuery}
            setResponse={setResponse}
            response={response}
            handleSubmit={handleSubmit}
            submitLoading={submitLoading}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Ad_hoc_summary);

