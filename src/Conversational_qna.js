import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import Sidepanel from './components/Sidepanel';
Amplify.configure(awsExports);


const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
});

const Conversational_qna = ({ signOut, user }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sources, setSources] = useState(null);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups']
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };  
  
  useEffect(() => {}, []);

// Call LLM Q&A API
  const handleSubmit = async (event) => {
      event.preventDefault();
      setSubmitLoading(true);
      setResponse(null);
      setSources(null);
      setSubmittedQuery(query);

      try {
        const response = await axios.get('https://yyea5arxea.execute-api.us-west-2.amazonaws.com/Prod', {
            params: {
              query: query
            },
            headers: {
              Authorization: user.signInUserSession.idToken.jwtToken
            },
          });
          //setSources('Sources: '+ response.data['sources']);
          setSources(response.data['sources']);
          setResponse(response.data['answer']);
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
        {!isMobile && (
          <Button variant="contained" sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#1d2636'}} onClick={signOut}>
            Logout
          </Button>
        )}
        {isMobile && (
          <Button sx={{ color: 'white', backgroundColor: '#1d2636'}} onClick={toggleSidebar}> Menu >> </Button>
        )}
        <Sidepanel isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} business_name={business_name} />
        <Box sx={{ width: isMobile ? '80%' : '50%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
            <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Typography variant="h5" gutterBottom>Ask questions against all data</Typography>
            <Box sx={{ mb: 3 }}>
              <form onSubmit={(e) => {
                handleSubmit(e);
                setQuery('');
              }}>
                <TextField
                  label="Enter a specific question about any event or any survey"
                  variant="outlined"
                  rows={isMobile ? 2 : 3} 
                  fullWidth
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button type="submit" sx={{ color: 'white', backgroundColor: '#1d2636'}} variant="contained">Submit</Button>
              </form>
            </Box>
            {submitLoading && <CircularProgress color="inherit"/>}
            <Typography variant="h6">{submittedQuery}</Typography>
            <TextField 
              sx={{ mb: 2}}
              multiline
              variant="outlined" 
              InputProps={{
                readOnly: true,
              }}
              rows={isMobile ? 10 : 12} 
              fullWidth 
              value={response || ''}
            />
            {sources && sources.length > 0 && (
              <>
                <Typography variant="button">Sources:</Typography>
                {sources.map((title, index) => (
                  <div key={index}>{title}</div>
                ))}
              </>
            )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Conversational_qna);

