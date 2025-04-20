import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import QueueIcon from '@mui/icons-material/Queue';
import UndoIcon from '@mui/icons-material/Undo';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import FireplaceIcon from '@mui/icons-material/Fireplace';
import ElderlyIcon from '@mui/icons-material/Elderly';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    name: 'Queueing',
    path: '/queueing',
    icon: <QueueIcon />,
    description: 'Manage and monitor queues efficiently',
  },
  {
    name: 'Reverse Backtracking',
    path: '/backtracking',
    icon: <UndoIcon />,
    description: 'Find lost items ',
  },
  {
    name: 'Parking Helper',
    path: '/parking',
    icon: <LocalParkingIcon />,
    description: 'Find and manage parking spaces',
  },
  {
    name: 'Fire Detection',
    path: '/fire',
    icon: <FireplaceIcon />,
    description: 'Monitor and detect fire incidents',
  },
  {
    name: 'Fall Detection',
    path: '/fall',
    icon: <ElderlyIcon />,
    description: 'Detect and alert for falls',
  },
];

const ServicesPanel = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'background.paper',
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Services
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {services.map((service, index) => (
          <ListItem
            onClick={() => {
              // console.log(service.path);
              navigate(service.path);
            }}
            key={index}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer',
              },
              py: 2,
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {service.icon}
            </ListItemIcon>
            <ListItemText
              primary={service.name}
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              }
              TypographyProps={{
                fontWeight: 'medium',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ServicesPanel;
