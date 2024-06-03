import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load any saved user data when the component mounts
  useEffect(() => {
    AsyncStorage.getItem('user').then(user => {
      if (user) {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      }
    });
  }, []);
  
  // Make API call when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role_type === "farm") {
        setLoading(true);
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`)
        .then(response => {
          // Update the setupComplete state
          console.log("setup Complete:", response.data.data.attributes.setup_complete);
          setSetupComplete(response.data.data.attributes.setup_complete);
          setUserName(response.data.data.attributes.name);
          setLoading(false);
        })
        .catch(error => {
          console.log('Unable to fetch user data', error);
        });
      } 
  
      if (currentUser.role_type === "employee") {
        setLoading(true);
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`)
        .then(response => {
          // Update the setupComplete state
          console.log("setup complete:", response.data);
          setSetupComplete(response.data.data.attributes.setup_complete);
          setLoading(false);
        })
        .catch(error => {
          console.log('Unable to fetch user data', error);
        });
      }
    }
  }, [currentUser]);
  
  // Save any changes to user data
  useEffect(() => {
    AsyncStorage.setItem('user', JSON.stringify(currentUser));
    console.log("Current User:", currentUser);
  }, [currentUser]);

  const logout = async (navigation) => {
    setLoading(true);
    try {
      // Clear user data from context
      setCurrentUser(null);
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');

      // Make a request to the backend to invalidate the token
      await axios.delete('http://localhost:4000/logout');

      // Navigate to the login screen
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout, loading, setupComplete, setSetupComplete, userName, setUserName, userAvatar, setUserAvatar, userFirstName, setUserFirstName, userLastName, setUserLastName }}>
      {children}
    </UserContext.Provider>
  );
};