// src/pages/NotificationsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert
} from '@mui/material';
import API_URL from '../utils/config';
import Navbar from '../components/Navbar';

// Reuse your theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface Notification {
  notificationID: number;
  userID: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('jwtToken');

  // Fetch notifications for the logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notifications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle the case where the backend might return an EF object with $values
        let data = response.data;
        if (!Array.isArray(data)) {
          if (data?.$values) {
            data = data.$values;
          } else {
            data = [];
          }
        }
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications.');
      }
    };
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Mark a notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/mark-as-read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.notificationID === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: themeColors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 4,
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', p: 2 }}>
          <Typography variant="h5" sx={{ color: themeColors.primary, mb: 2 }}>
            My Notifications
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <List>
            {notifications.map((n) => (
              <ListItem
                key={n.notificationID}
                sx={{
                  backgroundColor: n.isRead ? '#f9f9f9' : '#fff',
                  mb: 1,
                  border: '1px solid #ccc',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={n.message || 'No message'}
                  secondary={`Created: ${new Date(n.createdAt).toLocaleString()}`}
                  primaryTypographyProps={{ sx: { color: themeColors.text } }}
                  secondaryTypographyProps={{ sx: { color: themeColors.text } }}
                />
                {!n.isRead && (
                  <Button
                    variant="contained"
                    onClick={() => handleMarkAsRead(n.notificationID)}
                    sx={{
                      ml: 2,
                      backgroundColor: 'black', // black button for unread
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#333', // darker black
                      },
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </>
  );
};

export default NotificationsList;
