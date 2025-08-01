import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { MapComponent } from '../components/Maps';

const MapTestPage: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ height: '100vh', p: 0 }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <Typography variant='h4' component='h1' gutterBottom>
            High Seas VTT - Map System
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Interactive 20x20 grid with Konva.js rendering. Click cells to
            select, use controls to add features.
          </Typography>
        </Paper>

        {/* Map Component */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <MapComponent isGameMaster={true} readOnly={false} />
        </Box>
      </Box>
    </Container>
  );
};

export default MapTestPage;
