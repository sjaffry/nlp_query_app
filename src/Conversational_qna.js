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
  const businessName = user.signInUserSession.idToken.payload['cognito:groups']
  const user_name = user.signInUserSession.idToken.payload.given_name
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };  
  
  const getUnixTime = () => {
    const now = new Date(); 
    return Math.floor(now.getTime() / 1000);
  }

  useEffect(() => {
    try {
      const res = axios.put('https://9vq4uvv8i3.execute-api.us-west-2.amazonaws.com/Prod',  {}, {
        params: {
          user_name: user_name,
          usage_timestamp: getUnixTime(),
          page_name: "Conversational_QA",
          keep_warm: "false",
          business_name: "FTSC"
        },           
        headers: {
          Authorization: user.signInUserSession.idToken.jwtToken,
          'Content-Type': 'application/json'
        },
      });
      console.log(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Unexpected error. Please report it to front office');        
    }
  }, []);

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
        <Sidepanel isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} business_name={businessName} />
        <Box sx={{ width: isMobile ? '80%' : '50%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
            <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Typography variant="h5" gutterBottom>Page under maintenance</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Conversational_qna);

