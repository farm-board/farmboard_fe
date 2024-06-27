import { View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet, Modal, ScrollView } from 'react-native'
import Checkbox from 'expo-checkbox';
import React, { useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../config';
import StyledText from '../components/Texts/StyledText';
import TermsOfUse from '../components/Texts/TermsOfUse';
import PrivacyPolicy from '../components/Texts/PrivacyPolicy';

export default function SignupScreen() {
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] = useState(false);
  const [termsCheckbox, setTermsCheckbox] = useState(false);
  const [data, setData] = useState({
      email: '',
      password: '',
      password_confirmation: '',
  })
  
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTwo, setShowPasswordTwo] = useState(false);

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
      if (!termsCheckbox) {
          Alert.alert(
              "Terms of Use", // Title of the popup
              "You must check the box acknowledging your agreement to the Terms of Use and Privacy Policy before continuing", // Message in the popup
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

      axios.post(`${baseUrl}/`, user)
      .then(response => {
          setCurrentUser(response.data.data);
          AsyncStorage.setItem('token', response.headers.authorization);
          if (response.data.data.role_type === "no_role") {
              navigation.navigate('Setup');
          }
          else {
              navigation.navigate('Profile');
          }
      })
      .catch(error => {
          console.log(error);
          console.log(error.message);
      })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibilityTwo = () => {
    setShowPasswordTwo(!showPasswordTwo);
  };
  
  const termsAndConditionsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={30}
              color="white"
              onPress={() => setTermsModalVisible(false)}
            />
          </TouchableOpacity>
            <Animated.Text entering={FadeInUp.duration(1000).springify()}>
              <StyledText bold big >
                Terms of Use
              </StyledText>
            </Animated.Text>
        </View>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.content}>
            <TermsOfUse />
          </View>
        </ScrollView>
      </Modal>
    );
  }
  const privacyPolicyModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyPolicyModalVisible}
        onRequestClose={() => setPrivacyPolicyModalVisible(false)}
      >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color="white"
            onPress={() => setPrivacyPolicyModalVisible(false)}
          />
        </TouchableOpacity>
          <Animated.Text entering={FadeInUp.duration(1000).springify()}>
            <StyledText bold big >
              Privacy Policy
            </StyledText>
          </Animated.Text>
      </View>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.content}>
            <PrivacyPolicy />
          </View>
        </ScrollView>
      </Modal>
    );
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
            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder='Password Confirmation'
                placeholderTextColor='gray'
                secureTextEntry={!showPasswordTwo}
                onChangeText={text => setData({ ...data, password_confirmation: text })}
            />
              <TouchableOpacity onPress={togglePasswordVisibilityTwo}>
                    <Icon name={showPasswordTwo ? "eye-off" : "eye"} size={24} color="gray" />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={termsCheckbox}
              onValueChange={setTermsCheckbox}
              color={'#4F6F52'}
            />
            <StyledText bold style={styles.checkboxText}>By checking this I agree to The FarmBoard</StyledText>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.termsContainer}>
            <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
                <StyledText style={styles.termsText}>Terms of Use</StyledText>
            </TouchableOpacity>
            <StyledText bold style={styles.termsAndText}>and</StyledText>
            <TouchableOpacity onPress={() => setPrivacyPolicyModalVisible(true)}>
                <StyledText style={styles.termsText}>Privacy Policy</StyledText>
            </TouchableOpacity>
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
        {termsAndConditionsModal()}
        {privacyPolicyModal()}
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
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 90,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'normal',
      marginBottom: 80,
      marginTop: 40,
    },
    logoImageTop: {
      height: '45%',
      maxWidth: '90%',
    },
    logoImageBottom: {
      height: '23%',
      maxWidth: '95%',
      aspectRatio: 3/1,
      marginTop: 2.5,
    },
    formContainer: {
      alignItems: 'center',
      marginTop: -140,
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
    checkboxContainer: {
      padding: 10,
      width: '100%',
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    termsContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    input: {
      color: 'black',
      flex: 1,
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
      flexDirection: 'row',
      justifyContent: 'center',
    },
    signUpText: {
      color: '#00B0FF',
      marginLeft: 5,
    },
    termsText: {
      color: '#00B0FF',
    },
    termsAndText: {
      paddingHorizontal: 10,
      color: 'black',
    },
    checkbox: {
      alignSelf: 'center',
      marginRight: 10,
    },
    checkboxText: {
      color: 'black',
      paddingRight: 10,
    },
    modalContainer: {
      alignItems: 'center',
      backgroundColor: '#4F6F52',
      minHeight: '100%',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      padding: 10,
      bottom: 5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4F6F52',
      width: '100%',
      paddingBottom: 20,
      marginTop: 60,
    },
    content: {
      flex: 1,
      alignItems: 'right',
      paddingHorizontal: 15, 
      width: '100%',
    },
});