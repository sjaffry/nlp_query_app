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

const App = ({ signOut, user }) => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [dashboardUrl, setDashboardUrl] = useState(null);


// Call page load API
  useEffect(() => {
    const fetchInitialData = async () => {
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


// Call LLM Summary API and get embedded QuickSight dashboard
  const handleTileClick = async (index, asAtDate) => {
    setSummaryLoading(true);
    setSummary(null);
    setSelectedTile(index);
    setReviewDate(asAtDate);
    const dateString = asAtDate.substring(0,4)+'/'+asAtDate.substring(4,6)+'/'+asAtDate.substring(6,8);
    const encodedDateFrom = encodeURIComponent(dateString);
    const encodedDateTo = encodeURIComponent(dateString);

    // Call LLM Summary API
    const url1 = 'https://zmgz9j814l.execute-api.us-east-1.amazonaws.com/prod';

    axios.get(url1, {
      params: {
        date_range: asAtDate
      },
      headers: {
        Authorization: user.signInUserSession.idToken.jwtToken
      }
    })
    .then(response => {
      const htmlText = response.data.replace(/\n/g, '');
      setSummary(htmlText);
      setErrorMsg(null);
      setSummaryLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      setSummary(null);
    });


    // Call Get Embedded Dashboard API
    const url2 = 'https://dh9lkmru1d.execute-api.us-east-1.amazonaws.com/prod';

    axios.get(url2, {
      headers: {
        Authorization: user.signInUserSession.idToken.jwtToken
      }
    })
    .then(response => {
      console.log('URL:'+response.data);
      const baseUrl = response.data;
      setDashboardUrl(`${baseUrl}#p.dateFrom=${encodedDateFrom}&p.dateTo=${encodedDateTo}`);
    })
    .catch(error => {
      console.error('Error fetching embedded dashboard url', error);
    });
  }

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
        const response = await axios.get('https://293d8oapa8.execute-api.us-east-1.amazonaws.com/prod', {
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
        <Typography variant="h4" gutterBottom color='#6366F1'>{user.signInUserSession.idToken.payload['cognito:groups']}</Typography>
          <List>
            <ListItem sx={{ mb: 2 }}>
              <ListItemIcon><HomeIcon sx={{ color: 'white' }}/></ListItemIcon>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Summary & Q&A
              </Link>
            </ListItem>
            <ListItem sx={{ mb: 2 }}>
              <ListItemIcon><BarChartIcon sx={{ color: 'white' }}/></ListItemIcon>
              <Link to="/itemized_analytics" style={{ color: 'white', textDecoration: 'none' }}>
                Itemized Analytics
              </Link>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
          <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Typography variant="h5" gutterBottom>Analyze weekly reviews</Typography>
          {externalData && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
                {externalData["Subfolders"].map((subfolder, index) => {
                    const date = new Date(subfolder.substring(0,4), subfolder.substring(4,6) - 1, subfolder.substring(6,8));
                    const formattedDate = date.toDateString()
                    return (
                    <Button
                        variant="contained"
                        sx={{
                        width: '30%',
                        p: 2,
                        backgroundColor: selectedTile === index ? '#1d2636' : 'white',
                        color: selectedTile === index ? 'white' : '#1d2636',
                        '&:hover': {
                            backgroundColor: selectedTile === index ? '#1d2636' : 'white',
                        },
                        }}
                        onClick={() => handleTileClick(index, subfolder)}
                    >
                        {formattedDate}
                    </Button>
                    );
                })}
          </Box>
          )}
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
          {dashboardUrl && (
          <Box sx={{ width: '100%', height: '500px' }}>
            <iframe
              src= {dashboardUrl}
              width="100%"
              height="100%"
              title="Embedded Content"
            ></iframe>
          </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);