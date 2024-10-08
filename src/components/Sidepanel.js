import React from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PulseLogo from '../images/PulseLogo.png';

const Sidepanel = ({ business_name, isOpen, toggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box component={Paper} 
         sx={{ 
           display: 'flex', 
           flexDirection: 'column',
           justifyContent: 'space-between',
           width: isMobile ? '100%' : '20%',
           p: 2, 
           height: '100%', 
           bgcolor: '#1d2636', 
           color: 'white',
           position: isMobile ? 'absolute' : 'relative',
           zIndex: isMobile ? 'modal' : 'inherit',
           transform: isMobile ? `translateX(${isOpen ? '0' : '-100%'})` : 'none', // Slide in/out on mobile
           transition: 'transform 0.3s ease-in-out',
         }}
    >
      <div>
        <Typography variant="h4" gutterBottom color='#6366F1'>{business_name}</Typography>
        <List>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><ThumbUpIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Suggestion Box
            </Link>
          </ListItem>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><LocalActivityIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Events_summary" style={{ color: 'white', textDecoration: 'none' }}>
              Events Feedback
            </Link>
          </ListItem>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><AssignmentIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Ad_hoc_summary" style={{ color: 'white', textDecoration: 'none' }}>
              Ad-hoc Summary
            </Link>
          </ListItem>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><ChatIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Conversational_qna" style={{ color: 'white', textDecoration: 'none' }}>
              Chat with AI
            </Link>
          </ListItem>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><SportsTennisIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Court_checkins" style={{ color: 'white', textDecoration: 'none' }}>
              Court Check-ins
            </Link>
          </ListItem>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><HowToVoteIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Ballots" style={{ color: 'white', textDecoration: 'none' }}>
              Voting
            </Link>
          </ListItem>
        </List>
      </div>
      <div>
        <img src={PulseLogo} alt="Logo" style={{ alignSelf: 'center', maxWidth: '100%', height: 'auto' }} />
      </div>
      {isMobile && (
        <Button onClick={toggleSidebar} sx={{ color: 'white', position: 'absolute', top: 0, right: 0 }}>Close</Button>
      )}
    </Box>
  );
};

export default Sidepanel;
