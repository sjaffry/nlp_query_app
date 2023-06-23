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

const ItemizedAnalytics = ({ signOut, user }) => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);

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
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(ItemizedAnalytics);