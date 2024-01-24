import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, TextField, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard = ({
  summaryLoading,
  summary,
  recommendations,
  reviewDate,
  jwtToken,
  eventName,
  reviewCount
}) => {

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async (jwtToken, reviewDate, eventName) => {
    
    setIsDownloading(true);
    var file_prefix = 'transcribe-output/FTSC/';
    var reviewsFileName = 'original-reviews-';

    if (eventName == '') {
       file_prefix += reviewDate+'/combinedreviews.txt';
       reviewsFileName += reviewDate+'.csv'
     } else {
       file_prefix += 'events/'+eventName+'/'+reviewDate+'/combinedreviews.txt';
       reviewsFileName += eventName+'-'+reviewDate+'.csv'
     }

    fetch('https://ctxzkwvz2a.execute-api.us-east-1.amazonaws.com/Prod/?file_prefix='+file_prefix, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          // Create a temporary URL for the blob
          const url = window.URL.createObjectURL(blob);
  
          // Create a hidden anchor element to trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = reviewsFileName;
          document.body.appendChild(a);
  
          // Trigger the click event on the anchor element to start the download
          a.click();
  
          // Clean up the temporary URL and anchor element
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setIsDownloading(false);
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
        });
  } 
  return (
    <Box>    
      <Box sx={{ display: 'flex', mb: 6, justifyContent: 'space-between' }}>
        <Paper sx={{ width: '50%', p: 2, borderColor: 'black', border: 0.3, mr: 3 }}>
          <Typography variant="h5" gutterBottom>Summary of {reviewCount} reviews</Typography>
          {summaryLoading && <CircularProgress />}
          <TextField 
            multiline
            variant="outlined" 
            InputProps={{
              readOnly: true,
            }}
            rows={12} 
            fullWidth 
            value={summary ? summary : ''}
          />
        </Paper>
        <Paper sx={{ width: '50%', p: 2, borderColor: 'black', border: 0.3, mr: 3 }}>
          <Typography variant="h5" gutterBottom>Top 5 recommendations</Typography>
          {summaryLoading && <CircularProgress />}
          <TextField 
            multiline
            variant="outlined" 
            InputProps={{
              readOnly: true,
            }}
            rows={12} 
            fullWidth 
            value={recommendations ? recommendations : ''}
          />
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', mb: 6 }}>
        <Button 
          variant="contained" 
          disabled={summary == null || jwtToken == '' || isDownloading}
          onClick= {() => handleDownloadClick(jwtToken, reviewDate, eventName)}
          sx={
            {width: '30%', p: 2, 
            color: summary ? 'white' : '#1d2636', 
            backgroundColor: summary ? '#1d2636' : 'white',
            }}> 
            Download original responses
        </Button>
        {isDownloading && <CircularProgress />}
      </Box>
    </Box>
  );
};

export default Dashboard;
