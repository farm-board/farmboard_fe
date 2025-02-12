import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '../config';

export default function ResetPasswordScreen() {
    const [passwordResetToken, setPasswordResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const navigation = useNavigation();

    const route = useRoute();

  useEffect(() => {
    if (route.params?.token) {
      setPasswordResetToken(route.params.token);
      console.log('token:', route.params.token);
    }
  }, [route.params?.token]);
    
    const handleSubmit = () => {
      // Call your API to request password reset
      axios.patch(`${baseUrl}/password`, {
        user: {
          reset_password_token: passwordResetToken,
          password: password,
          password_confirmation: passwordConfirmation
        }
      })
      .then(response => {
        // Handle success
        console.log('Password has been reset');
        alert('Your password has been reset.')
        navigation.navigate('Login');
      })
      .catch(error => {
        // Handle error
        console.log('passwordResetToken:', passwordResetToken);
        console.log('password:', password);
        console.log('passwordConfirmation:', passwordConfirmation);
        console.error('Error resetting password:', error);
        alert('There was an issue resetting your password. Please try again later.')
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
                <Text style={styles.passwordText}>Enter your new password.</Text>
                <Text style={styles.passwordDetails}>Enter your new password in the fields below.</Text>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='New Password'
                  placeholderTextColor='gray'
                  onChangeText={text => setPassword(text)}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Confirm Password'
                  placeholderTextColor='gray'
                  onChangeText={text => setPasswordConfirmation(text)}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}>
                    <Text style={styles.buttonText}>
                    Reset Password
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
      paddingBottom: 60,
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
      marginTop: -110,
    },
    inputContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      padding: 15,
      borderRadius: 20,
      width: '100%',
      marginBottom: 10,
      marginTop: 10,
    },
    input: {
      color: 'black',
    },
    button: {
      backgroundColor: '#4F6F52',
      padding: 15,
      paddingHorizontal: 75,
      borderRadius: 20,
      maxWidth: '100%',
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