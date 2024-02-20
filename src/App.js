import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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

const App = ({ signOut, user }) => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups'];
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Call page load API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get('https://xd65osve7l.execute-api.us-west-2.amazonaws.com/Prod', {
          params: {
            get_events: 'False'
          },           
          headers: {
            Authorization: jwtToken
          },
        });
        setExternalData(res.data);
        setErrorMsg(null);
      } catch (error) {
        console.error('Error:', error);
        setErrorMsg(error.message);
        alert('Session expired! Please refresh the page and try again.');
      }
    };

    fetchInitialData();

  }, []);


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

// Call LLM Summary API and get embedded QuickSight dashboard
  const handleTileClick = async (index, asAtDate) => {
    setSummaryLoading(true);
    setSummary(null);
    setRecommendations(null);
    setSelectedTile(index);
    setReviewDate(asAtDate);
    const dateString = asAtDate.substring(0,4)+'/'+asAtDate.substring(4,6)+'/'+asAtDate.substring(6,8);
    const encodedDateFrom = encodeURIComponent(dateString);
    const encodedDateTo = encodeURIComponent(dateString);

    // Call LLM Summary API
    const url1 = 'https://foy4lujjik.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        date_range: asAtDate,
        event_name: ''
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const llmResponse = response.data;
      const llmText = splitLLMResult(llmResponse.llm_text);
      setReviewCount(llmResponse.review_count);
      setSummary(llmText.Summary);
      setRecommendations(llmText.Recommendations);
      setErrorMsg(null);
      setSummaryLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      setSummary(null);
      alert('Session expired! Please refresh the page and try again.');
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
        const response = await axios.get('https://yyea5arxea.execute-api.us-west-2.amazonaws.com/Prod', {
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
        alert('Session expired! Please refresh the page and try again.');
      }

      setSubmitLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        {!isMobile && (
          <Button variant="contained" 
            sx={{ 
              position: 'absolute', 
              top: 2, 
              right: 2, 
              backgroundColor: '#1d2636',
              '&:hover': {
                backgroundColor: '#1d2636',
            }}} onClick={signOut}>
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
          <Typography variant="h5" gutterBottom>Analyze periodic reviews</Typography>
          {externalData && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
            {externalData["Subfolders"].map((subfolder, index) => {
                const date = new Date(subfolder.substring(0, 4), subfolder.substring(4, 6) - 1, subfolder.substring(6, 8));
                const options = { year: 'numeric', month: 'short' };
                const formattedDate = date.toLocaleDateString(undefined, options);                

                // Function to check if the date is valid
                const isValidDate = (date) => !isNaN(date.getTime());

                // Check if the date is valid before rendering the button
                if (isValidDate(date)) {
                    return (
                        <Button
                            key={index}
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
                } else {
                    // Return null or another component if the date is invalid
                    return null;
                }
            })}
          </Box>
          )}
          <Dashboard
            summaryLoading={summaryLoading}
            summary={summary}
            recommendations={recommendations}
            reviewDate={reviewDate}
            jwtToken={jwtToken}
            eventName=''
            reviewCount={reviewCount}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);