// src/components/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import heroImage from '../assets/boygirl.jpeg'; 
import Expenseimage from '../assets/expenselogging.png';
import Budgetimage from '../assets/budgetmanage.png';
import Analyticsimage from '../assets/Visuanalytics.png';
import Authenticationimage from '../assets/userauth.png';
import DataExportimage from '../assets/csv.png';

// Define your theme colors (adjust as needed)
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

const features = [
  {
    title: 'Expense Logging',
    description:
      'Easily add, edit, and delete expenses. Keep track of every transaction and analyze your spending.',
    image: Expenseimage, // Replace with your image or asset
    buttonText: 'Learn More',
    buttonLink: '/expenses',
  },
  {
    title: 'Budget Management',
    description:
      'Set monthly budgets and get alerts when you exceed them. Stay on top of your finances.',
    image: Budgetimage, // Replace with your image or asset
    buttonText: 'Get Started',
    buttonLink: '/budget',
  },
  {
    title: 'Visual Analytics',
    description:
      'View your expenses in modern charts and graphs to understand your spending patterns.',
    image: Analyticsimage, // Replace with your image or asset
    buttonText: 'Explore Now',
    buttonLink: '/visual',
  },
  {
    title: 'User Authentication',
    description:
      'Securely register, log in, and manage your account with robust security features.',
    image: Authenticationimage, // Replace with your image or asset
    buttonText: 'Register / Login',
    buttonLink: '/auth',
  },
  {
    title: 'Data Export',
    description:
      'Export your expense data to CSV or PDF for offline analysis and record keeping.',
    image: DataExportimage, // Replace with your image or asset
    buttonText: 'Learn More',
    buttonLink: '/auth',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <CssBaseline />
      {/* Root Full-Screen Container */}
      <Box sx={{ minHeight: '100vh', width: '100vw', backgroundColor: themeColors.background }}>
        {/* Hero Section */}
        <Grid container sx={{ minHeight: '60vh' }}>
          {/* Left: Text and CTA */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 2, md: 4 },
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{ color: themeColors.primary, fontWeight: 'bold', mb: 2 }}
            >
              Welcome to KAZI CHAP CHAP
            </Typography>
            <Typography variant="h6" sx={{ color: themeColors.text, mb: 4 }}>
              Manage your expenses, set budgets, and visualize your spending—all in one place.
            </Typography>
            <Box>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: themeColors.primary,
                  color: '#fff',
                  mr: 2,
                  px: 3,
                  py: 1.5,
                }}
                onClick={() => handleNavigate('/login')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: themeColors.primary,
                  color: themeColors.primary,
                  px: 3,
                  py: 1.5,
                }}
                onClick={() => handleNavigate('/budget')}
              >
                Learn More
              </Button>
            </Box>
          </Grid>
          {/* Right: Hero Image */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Box
              component="img"
              src={heroImage}
              alt="Hero"
              sx={{
                width: '100%',
                height: '100vh',
                objectFit: 'cover',
              }}
            />
          </Grid>
        </Grid>

        {/* Features Section */}
        <Container sx={{ py: 4 }}>
          <Typography variant="h4" align="center" sx={{ color: themeColors.primary, mb: 4 }}>
            Our Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ maxWidth: 345, m: 'auto', boxShadow: 3 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={feature.image}
                    alt={feature.title}
                  />
                  <CardContent>
                    <Typography variant="h5" component="div" sx={{ color: themeColors.primary }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleNavigate(feature.buttonLink)}>
                      {feature.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ backgroundColor: '#f5f5f5', py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} KAZI CHAP CHAP. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Home;



