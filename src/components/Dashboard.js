import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, TextField, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import handleDownloadClick from './ReviewDownload';

const Dashboard = ({
  summaryLoading,
  summary,
  recommendations,
  reviewDate,
  jwtToken,
  eventName
}) => {
  return (
    <Box>    
      <Box sx={{ display: 'flex', mb: 6, justifyContent: 'space-between' }}>
        <Paper sx={{ width: '50%', p: 2, borderColor: 'black', border: 0.3, mr: 3 }}>
          <Typography variant="h5" gutterBottom>Summary</Typography>
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
          disabled={summary == null || jwtToken == ''}
          onClick= {() => handleDownloadClick(jwtToken, reviewDate, eventName)}
          sx={
            {width: '30%', p: 2, 
            color: summary ? 'white' : '#1d2636', 
            backgroundColor: summary ? '#1d2636' : 'white',
            }}> 
            Download original responses
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
