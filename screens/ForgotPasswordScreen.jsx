import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    
    const navigation = useNavigation();
    
    const { setCurrentUser } = useContext(UserContext);

    const handleSubmit = () => {
        // Call your API to request password reset
        axios.post(`https://farmboard-be-a01a77990d21.herokuapp.com/password`, { user: { email: email } })
          .then(response => {
            // Handle success
            console.log('Password reset link sent');
            alert('The password reset link has been sent. Please check your email for further instructions.')
          })
          .catch(error => {
            // Handle error
            console.error('Error requesting password reset:', error);
            alert('Error requesting password reset. Please try again later.')
          });
      };

    return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <Image style={styles.background} source={require('../assets/images/backgroundUpdatedColors.png')} />
          {/* Title and Form */}
          <View style={styles.titleAndForm}>
            {/* Title */}
            <View style={styles.logoContainer}>
              <Animated.Image entering={FadeInUp.delay(1000).duration(1000).springify()} style={styles.logoImageTop} source={require('../assets/images/logowithbarn-transformed-top.png')} />
              <Animated.Image entering={FadeInUp.delay(400).duration(1000).springify()} style={styles.logoImageBottom} source={require('../assets/images/logowithbarn-transformed-bottom-fix.png')} />
            </View>
    
            {/* Form */}
            <View style={styles.formContainer}>
                <Text style={styles.passwordText}>Forgot your password?</Text>
                <Text style={styles.passwordDetails}>Enter your email address below and we'll send you a link to reset your password.</Text>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Email'
                  placeholderTextColor='gray'
                  onChangeText={text => setEmail(text)}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}>
                    <Text style={styles.buttonText}>
                    Send Password Reset Link
                    </Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.signUpTextContainer}>
                <TouchableOpacity onPress={() => navigation.push('Login')}>
                  <Text style={styles.signUpText}>Back to Login</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      );
    };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    background: {
      position: 'absolute',
      height: '100%',
      width: '100%',
    },
    titleAndForm: {
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 60,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'normal',
      paddingBottom: 40,
    },
    logoImageTop: {
      height: '46%',
      maxWidth: '80%',
    },
    logoImageBottom: {
      height: '22%',
      maxWidth: '100%',
      aspectRatio: 3/1,
      marginTop: 2.5,
    },
    formContainer: {
      alignItems: 'center',
      marginTop: -90,
    },
    inputContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      padding: 15,
      borderRadius: 20,
      width: '100%',
      marginBottom: 10,
      marginTop: 20,
    },
    input: {
      color: 'black',
    },
    button: {
      backgroundColor: '#4F6F52',
      padding: 15,
      paddingHorizontal: 60,
      borderRadius: 20,
      minWidth: '80%',
      marginBottom: 10,
      marginTop: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    signUpTextContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    signUpText: {
      color: '#00B0FF',
      marginLeft: 5,
    },
    passwordText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      textAlign: 'center',
      marginBottom: 10,
    },
    passwordDetails: {
        color: 'black',
        textAlign: 'center',
    },
});