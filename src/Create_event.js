import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { 
  ThemeProvider, 
  Box, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField, 
  Checkbox,
  useMediaQuery, 
  useTheme,
  CircularProgress,
  IconButton,
  Paper } from '@mui/material';
import Sidepanel from './components/Sidepanel';
import { useNavigate } from "react-router-dom";
Amplify.configure(awsExports);

const Create_event = ({ signOut, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups']
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const eventSummaryPage = `/Events_summary`;
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [newEventName, setNewEventName] = useState('');  
  const [events, setEvents] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const eventSummary = async (event) => {
    navigate(eventSummaryPage);
  }

   //  Populate event list by getting events from the database
  useEffect(() => {
    setPageLoading(true);
    const fetchEvents = async () => {
      try {
        const res = await axios.get('https://ozzxo9l5r1.execute-api.us-west-2.amazonaws.com/Prod', {         
          headers: {
            Authorization: jwtToken
          },
        });
        const activeEvent = res.data.find(event => event.active === 'Y');
        setSelectedEvent(activeEvent);
        setEvents(res.data);
        setErrorMsg(null);
        setPageLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setErrorMsg(error.message);
      }
    };

    fetchEvents();

  }, []); 
  
  const saveEventToBackend = async (event) => {
    console.log("Saving event to backend:", event.friendly_name);
    try {
      const res = await axios.put('https://ozzxo9l5r1.execute-api.us-west-2.amazonaws.com/Prod', 
      {
        event_name: event.friendly_name,
        active: event.active,
        auth_token: jwtToken
      },           
      {
        headers: {
          Authorization: jwtToken
        },
      }
    );    
    const responseObj = JSON.parse(res.data.body);
    event.event_url = responseObj.event_url;

    setErrorMsg(null);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message);
    }

    return event;
  };

  const handleSaveNewEvent = async () => {
    if (newEventName.trim() === '') {
      alert('Event name cannot be empty.');
      return;
    }

    const newEvent = {friendly_name: newEventName, active: 'N'};

    // Save the new event to the backend
    const savedEvent = await saveEventToBackend(newEvent);

  // Update the local state to include the new event
    setEvents([...events, savedEvent]);
    // Clear the input field
    setNewEventName('');
};

const handleNewEventNameChange = (event) => {
  setNewEventName(event.target.value);
};

const handleSetActive = (eventName) => {
  const activatedEvent = (events.find(event => event.friendly_name === eventName));
  activatedEvent.active = 'Y'
  setSelectedEvent(activatedEvent);
  saveEventToBackend(activatedEvent);
};

const handleDeleteEvent = (eventName) => {
  // Delete the event from the backend
  deleteEventFromBackend(eventName);
  // Update the local state to remove the deleted event
  setEvents(events.filter(event => event.friendly_name !== eventName));
};

const deleteEventFromBackend = async (eventName) => {
  console.log("Deleting event from backend:", eventName);
  try {
    const res = await axios.delete('https://ozzxo9l5r1.execute-api.us-west-2.amazonaws.com/Prod', {
      headers: {
        Authorization: jwtToken
      },
      params: {
        event_name: eventName
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const handleCopyUrl = async (friendly_name) => {
  try {
    const event = events.find(event => event.friendly_name === friendly_name);
    await navigator.clipboard.writeText(event.event_url.replace(/['"]+/g, ''));
    alert('URL copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy URL: ', err);
    alert('Failed to copy URL');
  }
};

return (
  <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
      <Button
        variant="contained"
        sx={{ position: 'absolute', top: 2, right: 102, backgroundColor: '#1d2636'}}
        onClick={eventSummary}
      >
        Back to Events
      </Button>
      <Button
        variant="contained"
        sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#1d2636'}}
        onClick={signOut}
      >
        Logout
      </Button>
      <Sidepanel isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} business_name={business_name} />
      <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
        <Typography sx={{ mb: 5 }} variant="h5" gutterBottom>Create or Update Event</Typography>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, width: '50%' }}>
          {pageLoading && <CircularProgress color="inherit"/>}
          <TextField
            label="New Event Name"
            variant="outlined"
            value={newEventName}
            onChange={handleNewEventNameChange}
            sx={{ flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#1d2636'}}
            onClick={handleSaveNewEvent}>
            Save
          </Button>
        </Box>        
        <TableContainer component={Paper} sx={{ width: '50%' }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="right">Active?</TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="right">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events && events.map((event) => (
                  <TableRow
                    key={event.friendly_name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {event.friendly_name}
                    </TableCell>
                    <TableCell align="right">
                      <Checkbox
                        sx={{
                          color: '#1d2636',
                          '&.Mui-checked': {
                            color: '#1d2636',
                          },
                        }}
                        checked={selectedEvent && selectedEvent.friendly_name === event.friendly_name}
                        onChange={() => handleSetActive(event.friendly_name)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                          sx={{ color: '#1d2636' }}
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyUrl(event.friendly_name)}
                        >
                          Copy URL
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDeleteEvent(event.friendly_name)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Box>
    </Box>
  </ThemeProvider>
);
}

export default withAuthenticator(Create_event);

