import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CircularProgress, Box, Button, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from '@mui/material';
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

const Court_checkins = ({ signOut, user }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [tennisCheckins, setTennisCheckins] = useState(null);
  const [pickleballCheckins, setPickleballCheckins] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setCheckinsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showFilename, setShowFilename] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups']
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };  
  
  useEffect(() => {
    const initialData = '[{"business_name": "", "checkin_timestamp": "", "player_name": "", "court_number": ""}]'
    setTennisCheckins(JSON.parse(initialData));

    // Call list court checkins API
    const getAllCheckins = async () => {
      setCheckinsLoading(true);
      setTennisCheckins(null);
      setPickleballCheckins(null);

      const url1 = 'https://hdv5dh94pi.execute-api.us-west-2.amazonaws.com/Prod';

      axios.get(url1, {
        params: {
        },
        headers: {
          Authorization: user.signInUserSession.idToken.jwtToken
        }
      })
      .then(response => {
        setTennisCheckins(response.data.tennis);
        setPickleballCheckins(response.data.pickleball);
        setErrorMsg(null);
        setCheckinsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMsg(error.message);
        setTennisCheckins(null);
      });
    };

    getAllCheckins();

  }, []);


  const formatDate = (timestamp) => {
    if (timestamp == '') {
      return '';
    }
    const date = new Date(parseInt(timestamp) * 1000);  // Convert Unix timestamp to milliseconds
    return date.toLocaleString();  // Converts to local date string
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
        <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
          <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Typography variant="h5" gutterBottom>Court Check-ins</Typography>
          <Box sx={{ display: 'flex', mb: 3 }}>
          <Grid container spacing={isMobile ? 1 : 3} mb={6}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
                <Typography variant="h5" gutterBottom>
                  Tennis
                </Typography>
                {summaryLoading && <CircularProgress color="inherit" />}
                {tennisCheckins && (
                  <TableContainer>
                    <Table aria-label="checkin table">
                      <TableHead>
                        <TableRow>
                          {tennisCheckins.length > 0 && Object.keys(tennisCheckins[0]).map((key) => (
                            <TableCell key={key}>{key.replace('_', ' ').toUpperCase()}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tennisCheckins.map((item, index) => (
                          <TableRow key={index}>
                            {Object.entries(item).map(([key, val], i) => (
                              <TableCell key={i}>
                                {key === 'checkin_timestamp' ? formatDate(val) : val}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
                <Typography variant="h5" gutterBottom>
                  Pickleball
                </Typography>
                {summaryLoading && <CircularProgress color="inherit" />}
                {pickleballCheckins && (
                  <TableContainer>
                    <Table aria-label="checkin table">
                      <TableHead>
                        <TableRow>
                          {pickleballCheckins.length > 0 && Object.keys(pickleballCheckins[0]).map((key) => (
                            <TableCell key={key}>{key.replace('_', ' ').toUpperCase()}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pickleballCheckins.map((item, index) => (
                          <TableRow key={index}>
                            {Object.entries(item).map(([key, val], i) => (
                              <TableCell key={i}>
                                {key === 'checkin_timestamp' ? formatDate(val) : val}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Court_checkins);

