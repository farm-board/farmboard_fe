import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { baseUrl } from '../config';

export default function LoginScreen() {
    const [data, setData] = useState({
        email: '',
        password: '',
    })
    
    const navigation = useNavigation();

    const [showPassword, setShowPassword] = useState(false);
    
    const { setCurrentUser } = useContext(UserContext);

    const handleSubmit = () => {
        const user = {
            user: {
              email: data.email,
              password: data.password
            }
          };

        axios.post(`${baseUrl}/login`, user)
        .then(response => {
          setCurrentUser(response.data.data);
          AsyncStorage.setItem('token', response.headers.authorization);
        })
        .catch(error => {
          console.log(error);
          console.log(error.message);
          Alert.alert(
            "Login Error",
            "The email or password you entered is incorrect.",
            [{ text: "OK" }]
          );
        })
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
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
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Email'
                  placeholderTextColor='gray'
                  onChangeText={text => setData({ ...data, email: text })}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Password'
                  placeholderTextColor='gray'
                  secureTextEntry={!showPassword}
                  onChangeText={text => setData({ ...data, password: text })}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}>
                    <Text style={styles.buttonText}>
                    Login
                    </Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.signUpTextContainer}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.push('SignUp')}>
                  <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.signUpTextContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.signUpText}>Forgot Password?</Text>
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
        paddingBottom: 15,
      },
      logoImageTop: {
        height: '45%',
        maxWidth: '90%',
      },
      logoImageBottom: {
        height: '21.5%',
        maxWidth: '95%',
        aspectRatio: 3/1,
        marginTop: 2.5,
      },
      formContainer: {
        alignItems: 'center',
        marginTop: -80,
      },
      inputContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 15,
        borderRadius: 20,
        width: '100%',
        marginBottom: 10,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      input: {
        color: 'black',
        flex: 1,
      },
      button: {
        backgroundColor: '#4F6F52',
        padding: 15,
        paddingHorizontal: 75,
        borderRadius: 20,
        width: '100%',
        marginBottom: 10,
        marginTop: 10,
      },
      buttonText: {
        fontSize: 20,
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
    });