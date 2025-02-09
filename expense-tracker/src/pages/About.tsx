// src/pages/About.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const themeColors = {
  primary: '#006400', // Dark Green
  text: '#2F4F4F',    // Dark Slate Gray
};

const About: React.FC = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" sx={{ color: themeColors.primary, mb: 4 }}>
        About Us
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: themeColors.text }}>
          Welcome to KAZI CHAP CHAP. We are dedicated to providing an all-in-one platform for managing your finances.
          Our mission is to simplify expense tracking, budget management, and financial analytics for everyone.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
