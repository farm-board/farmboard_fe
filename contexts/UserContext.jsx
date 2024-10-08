import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../config';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(false);
  const [editProfileRefresh, setEditProfileRefresh] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

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
  const fetchUserData = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        let response;
        if (currentUser.role_type === "farm") {
          response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
        } else if (currentUser.role_type === "employee") {
          response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`);
        }

        if (response) {
          setSetupComplete(response.data.data.attributes.setup_complete);
          setUserName(response.data.data.attributes.name);
        }
      } catch (error) {
        console.error('Unable to fetch user data', error);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchUserData();
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
      await AsyncStorage.clear();

      // Make a request to the backend to invalidate the token
      await axios.delete(`${baseUrl}/logout`);
      // Navigate to the login screen
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout, loading, setupComplete, setSetupComplete, userName, setUserName, userAvatar, setUserAvatar, userFirstName, setUserFirstName, userLastName, setUserLastName, refresh, setRefresh, profileRefresh, setProfileRefresh, editProfileRefresh, setEditProfileRefresh, deviceId, setDeviceId }}>
      {children}
    </UserContext.Provider>
  );
};