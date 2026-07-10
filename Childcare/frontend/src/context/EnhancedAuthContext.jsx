// src/context/EnhancedAuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const EnhancedAuthContext = createContext();

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider = ({ children }) => {
  const { user } = useAuth();
  const [childInfo, setChildInfo] = useState(null);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [selectedNanny, setSelectedNanny] = useState(null);
  const [booking, setBooking] = useState(null);

  // Load saved data on mount
  useEffect(() => {
    if (user) {
      const savedChildInfo = localStorage.getItem(`${user.email}_child_info`);
      const savedTraining = localStorage.getItem(`${user.email}_training_completed`);
      const savedNanny = localStorage.getItem(`${user.email}_selected_nanny`);
      const savedBooking = localStorage.getItem(`${user.email}_booking`);

      if (savedChildInfo) {
        try {
          setChildInfo(JSON.parse(savedChildInfo));
        } catch (error) {
          console.error('Error parsing child info:', error);
        }
      }

      if (savedTraining) {
        setTrainingCompleted(savedTraining === 'true');
      }

      if (savedNanny) {
        try {
          setSelectedNanny(JSON.parse(savedNanny));
        } catch (error) {
          console.error('Error parsing nanny info:', error);
        }
      }

      if (savedBooking) {
        try {
          setBooking(JSON.parse(savedBooking));
        } catch (error) {
          console.error('Error parsing booking info:', error);
        }
      }
    }
  }, [user]);

  // Save child information (for parents)
  const saveChildInfo = (info) => {
    if (!user) return;
    
    const childData = {
      ...info,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`${user.email}_child_info`, JSON.stringify(childData));
    setChildInfo(childData);
  };

  // Complete training (for caretakers)
  const completeTraining = () => {
    if (!user) return;
    
    localStorage.setItem(`${user.email}_training_completed`, 'true');
    setTrainingCompleted(true);
  };

  // Select a nanny (for parents)
  const selectNanny = (nanny) => {
    if (!user) return;
    
    localStorage.setItem(`${user.email}_selected_nanny`, JSON.stringify(nanny));
    setSelectedNanny(nanny);
  };

  // Create a booking (for parents)
  const createBooking = (bookingData) => {
    if (!user) return;
    
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`${user.email}_booking`, JSON.stringify(newBooking));
    setBooking(newBooking);
    
    return newBooking;
  };

  // Clear all user-specific data (on logout)
  const clearUserData = () => {
    setChildInfo(null);
    setTrainingCompleted(false);
    setSelectedNanny(null);
    setBooking(null);
  };

  const value = {
    childInfo,
    saveChildInfo,
    trainingCompleted,
    completeTraining,
    selectedNanny,
    selectNanny,
    booking,
    createBooking,
    clearUserData
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};