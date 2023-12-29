import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, TextField, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';

const Sidepanel = ({
    business_name
  }) => {
    return (
        <Box component={Paper} sx={{ width: '20%', p: 2, height: '100%', bgcolor: '#1d2636', color: 'white' }}>
        <Typography variant="h4" gutterBottom color='#6366F1'>{business_name}</Typography>
        <List>
            <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><HomeIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Periodic
            </Link>
            </ListItem>
            <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><BarChartIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Events_summary" style={{ color: 'white', textDecoration: 'none' }}>
                Events
            </Link>
            </ListItem>
            <ListItem sx={{ mb: 2 }}>
            <ListItemIcon><BarChartIcon sx={{ color: 'white' }}/></ListItemIcon>
            <Link to="/Ad_hoc_summary" style={{ color: 'white', textDecoration: 'none' }}>
                Ad-hoc
            </Link>
            </ListItem>
        </List>
        </Box>
    );};

    export default Sidepanel;