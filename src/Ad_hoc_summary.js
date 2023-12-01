import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link } from "react-router-dom";
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
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showFilename, setShowFilename] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups']

  useEffect(() => {}, []);

// Call LLM Summary API
  const GenerateSummary = async (fileName) => {
    setSummaryLoading(true);
    setSummary(null);

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
      const llmText = response.data.replace(/\n/g, '');
      setSummary(llmText);
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
  const url = "https://mvqwikiek9.execute-api.us-east-1.amazonaws.com/prod?"
  const signUrl = url.concat("business_name="+business_name+"&file_name="+fileName+"&upload_type=document");
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
        <Box component={Paper} sx={{ width: '20%', p: 2, height: '100%', bgcolor: '#1d2636', color: 'white' }}>
        <Typography variant="h4" gutterBottom color='#6366F1'>{business_name}</Typography>
          <List>
            <ListItem sx={{ mb: 2 }}>
              <ListItemIcon><HomeIcon sx={{ color: 'white' }}/></ListItemIcon>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Weekly summaries
              </Link>
            </ListItem>
            <ListItem sx={{ mb: 2 }}>
              <ListItemIcon><BarChartIcon sx={{ color: 'white' }}/></ListItemIcon>
              <Link to="/itemized_analytics" style={{ color: 'white', textDecoration: 'none' }}>
                Ad-hoc summary
              </Link>
            </ListItem>
          </List>
        </Box>
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
          <Box sx={{ display: 'flex', mb: 6, justifyContent: 'space-between' }}>
            <Paper sx={{ width: '50%', p: 2, borderColor: 'black', border: 0.3, mr: 3 }}>
              <Typography variant="h5" gutterBottom>Summary</Typography>
              {summaryLoading && <CircularProgress />}
              <TextField multiline variant="outlined" rows={8} fullWidth value={summary ? JSON.stringify(summary, null, 2) : ''}/>
            </Paper>
            <Paper sx={{ width: '42%', display: 'flex',flexDirection: 'column', justifyContent: 'space-between', p: 2, borderColor: 'black', border: 0.3 }}>
              <Typography variant="h5" gutterBottom>Q&A</Typography>
              <TextField 
                multiline 
                variant="outlined" 
                rows={3} 
                sx={{ mb: 2 }} 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Write your question here.." />
              <TextField multiline 
                variant="outlined" 
                rows={5} 
                value={response ? JSON.stringify(response, null, 2) : ''} 
                placeholder="Answer.." />
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button variant="outlined" sx={{ mr: 1, borderColor: 'black' }} onClick={handleSubmit}>Submit</Button>
                <Button variant="outlined" sx={{ borderColor: 'black' }} onClick={() => { setQuery(''); setResponse(null); }}>Clear</Button>
              </Box>
              {submitLoading && <CircularProgress />}
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Ad_hoc_summary);

