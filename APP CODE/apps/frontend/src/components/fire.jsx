import { Button, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const FirePage = () => {
  const { socket } = useSocket();
  const [fire, setFire] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('fire', () => {
      setFire(true);
    });

    return () => {
      socket.off('fire');
    };
  }, [socket]);

  return (
    <Container sx={{ mt: 4, backgroundColor: fire ? '#ff0000' : '' }}>
      <Typography variant="h4" gutterBottom>
        Fire Detection
      </Typography>
      <Typography variant="h6" gutterBottom>
        {fire ? 'Fire Alert! Evacuate Immediately!' : 'No Alerts Right Now'}
      </Typography>
      <Button variant="contained" color="primary">
        Start a fire drill
      </Button>
    </Container>
  );
};

export default FirePage;
