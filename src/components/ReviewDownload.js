import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress } from '@mui/material';

const handleDownloadClick = async (jwtToken, reviewDate, eventName) => {
    
    var file_prefix = 'transcribe-output/FTSC/';
    var reviewsFileName = 'original-reviews-';

    if (eventName == '') {
       file_prefix += reviewDate+'/combinedreviews.txt';
       reviewsFileName += reviewDate+'.txt'
     } else {
       file_prefix += 'events/'+eventName+'/'+reviewDate+'/combinedreviews.txt';
       reviewsFileName += eventName+'-'+reviewDate+'.txt'
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
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
        });
}

export default handleDownloadClick;

