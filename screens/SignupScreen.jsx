import { View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import React, { useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
    const [data, setData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
    })
    
    const navigation = useNavigation();

    const { currentUser, setCurrentUser } = useContext(UserContext);

    const handleSubmit = () => {
        if (data.password !== data.password_confirmation) {
            Alert.alert(
                "Password Error", // Title of the popup
                "Passwords do not match!", // Message in the popup
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
            return;
        }

        const user = {
            user: {
              email: data.email,
              password: data.password,
              password_confirmation: data.password_confirmation
            }
        };

        axios.post('http://localhost:4000/', user)
        .then(response => {
            setCurrentUser(response.data.data);
            AsyncStorage.setItem('token', response.headers.authorization);
            if (response.data.data.role_type === "no_role") {
                navigation.push('Setup');
            }
            else {
                navigation.push('Profile');
            }
        })
        .catch(error => {
            console.log(error);
            console.log(error.message);
        })
    }
return (
    <View style={styles.container}>
        <StatusBar style="light" />
        <Image style={styles.background} source={require('../assets/images/backgroundUpdatedColors.png')} />
        {/* Title and Form */}
        <View style={styles.titleAndForm}>
        {/* Title */}
        <View style={styles.logoContainer}>
            <Animated.Image entering={FadeInUp.delay(1000).duration(1000).springify()} style={styles.logoImageTop} source={require('../assets/images/logowithbarn-transformed-top.png')} />
            <Animated.Image entering={FadeInUp.delay(400).duration(1000).springify()} style={styles.logoImageBottom} source={require('../assets/images/logowithbarn-transformed-bottom.png')} />
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
                secureTextEntry
                onChangeText={text => setData({ ...data, password: text })}
            />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder='Password Confirmation'
                placeholderTextColor='gray'
                secureTextEntry
                onChangeText={text => setData({ ...data, password_confirmation: text })}
            />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}>
                <Text style={styles.buttonText}>
                Sign Up
                </Text>
            </TouchableOpacity>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.signUpTextContainer}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.push('Login')}>
                <Text style={styles.signUpText}>Login</Text>
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
      height: '22.5%',
      maxWidth: '95%',
      aspectRatio: 3/1,
    },
    formContainer: {
      alignItems: 'center',
      marginTop: -100,
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
      paddingHorizontal: 65,
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