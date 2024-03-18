import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load any saved user data when the component mounts
  useEffect(() => {
    AsyncStorage.getItem('user').then(user => {
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    });
  }, []);

  // Save any changes to user data
  useEffect(() => {
    AsyncStorage.setItem('user', JSON.stringify(currentUser));
    console.log(currentUser);
  }, [currentUser]);

  const logout = async (navigation) => {
    setLoading(true);
    try {
      // Clear user data from context
      setCurrentUser(null);
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      // Navigate to the login screen
      navigation.navigate("Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};