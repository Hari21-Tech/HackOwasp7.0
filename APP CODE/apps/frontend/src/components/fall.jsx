import { Button, Container, Typography } from '@mui/material';
import { useState } from 'react';

const FallPage = () => {
  const [fallAlert, setFallAlert] = useState(false);
  return (
    <>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Fall Detection
        </Typography>
        {fallAlert ? (
          <Typography variant="h6" gutterBottom>
            FALL LOCATION
          </Typography>
        ) : (
          <Typography variant="h6" gutterBottom>
            No Alerts Right Now
          </Typography>
        )}
      </Container>
    </>
  );
};

export default FallPage;
