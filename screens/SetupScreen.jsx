import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import React, { useContext, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FarmForm from '../components/Farm/FarmForm';
import EmployeeForm from '../components/employee/EmployeeForm';
import { baseUrl } from '../config';


export default function SetupScreen() {
  const roleTypes = { 0: "no_role", 1: "farm", 2: "employee" };
  const navigation = useNavigation();
  const { setCurrentUser, currentUser, logout, loading } = useContext(UserContext);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  const handleRoleChange = async (role) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    axios.patch(`${baseUrl}/current_user/update`, {
      user: {
          role_type: role
      }
    },
    {
      headers: {
          Authorization: token
      }
    }
    )
    .then(response => {
        console.log(currentUser.role_type);
        console.log('User role updated successfully:', response.data);
        setCurrentUser({
          ...currentUser,
          role_type: roleTypes[role]
        });
    })
    .catch(error => {
        console.error('There was an error updating the user role:', error);
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        {currentUser.role_type === "no_role" ? (
          <View style={styles.introContainer}>
            <Text style={styles.introText}>Welcome to FarmBoard! What will you be using this application for?</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleRoleChange(1)}
            >
              <Text style={styles.buttonText}>I will be posting jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleRoleChange(2)}
            >
              <Text style={styles.buttonText}>I will be applying for jobs</Text>
            </TouchableOpacity>
          </View>
        ) : currentUser.role_type === "farm" ? (
          <View>
            <FarmForm />
          </View>
        ) : currentUser.role_type === "employee" ? (
          <View>
            <EmployeeForm />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
  },
  backgroundImage: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContainer: {
    alignItems: 'center',
  },
  introText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    paddingBottom: 10,
    margin: 10,
  },
  button: {
    minWidth: '90%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    margin: 10,
  },
  buttonText: {
    color: '#3A4D39',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
