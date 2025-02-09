// src/pages/About.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Link, Button } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import HeroImage from '../assets/boygirl.jpeg';

const themeColors = {
  primary: '#006400',    // Dark Green
  secondary: '#8B4513',  // Saddle Brown (optional)
  background: '#F5F5DC', // Beige
  text: '#2F4F4F',       // Dark Slate Gray
};


const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
    
    <Container 
      maxWidth={false}
      sx={{ 
      
      marginBottom: '1rem',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      
      }}
    >
      <Paper 
        elevation={400} 
        sx={{ 
          backgroundColor: themeColors.background, 
          p: 4, 
          borderRadius: 2,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {/* Header */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: themeColors.primary, 
            mb: 4, 
            fontWeight: 'bold' 
          }}
        >
          About Us
        </Typography>

        {/* About Content */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: themeColors.text, 
              fontSize: '1.1rem', 
              lineHeight: 1.6, 
              mb: 2 
            }}
          >
            Welcome to KAZI CHAP CHAP. We are dedicated to providing an all-in-one platform for managing your finances.
            Our mission is to simplify expense tracking, budget management, and financial analytics for everyone.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: themeColors.text, 
              fontSize: '1.1rem', 
              lineHeight: 1.6 
            }}
          >
            Our journey began with a vision to empower individuals to take control of their financial future.
            Through innovation, commitment, and customer-focused design, we strive to build a platform that not only meets your financial management needs but also provides insights and tools for smarter decision-making.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: themeColors.primary,
              color: '#fff',
              mt: 4,
              px: 3,
              py: 1.5,
            }}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>

        {/* Image Section */}
        <Box sx={{ mb: 4 }}>
          <img 
            src={HeroImage} 
            alt="Our Team" 
            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }} 
          />
        </Box>

        {/* Contact Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: themeColors.text }}>
            Email: info@kazichapchap.com
          </Typography>
          <Typography variant="body1" sx={{ color: themeColors.text }}>
            Phone: +1 (555) 123-4567
          </Typography>
          <Typography variant="body1" sx={{ color: themeColors.text }}>
            Address: 123 Finance Street, Money City, Country
          </Typography>
        </Box>

        {/* Social Media Icons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3, 
            mt: 2 
          }}
        >
          <Link href="https://www.facebook.com" target="_blank" rel="noopener" color="inherit">
            <FacebookIcon sx={{ fontSize: 32, color: themeColors.primary }} />
          </Link>
          <Link href="https://www.twitter.com" target="_blank" rel="noopener" color="inherit">
            <TwitterIcon sx={{ fontSize: 32, color: themeColors.primary }} />
          </Link>
          <Link href="https://www.linkedin.com" target="_blank" rel="noopener" color="inherit">
            <LinkedInIcon sx={{ fontSize: 32, color: themeColors.primary }} />
          </Link>
          <Link href="https://www.instagram.com" target="_blank" rel="noopener" color="inherit">
            <InstagramIcon sx={{ fontSize: 32, color: themeColors.primary }} />
          </Link>
        </Box>
      </Paper>
    </Container>
  </>  
  );
};
export default About;


