import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, TextField, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard = ({
  summaryLoading,
  summary,
  recommendations,
  query,
  setQuery,
  setResponse,
  response,
  handleSubmit,
  submitLoading,
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
    </Box>
  );
};

export default Dashboard;
