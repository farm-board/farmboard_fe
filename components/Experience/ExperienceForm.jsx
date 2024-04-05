import React, { useState, useContext, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { UserContext } from '../../contexts/UserContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExperienceForm({ setExperiences }) {
  const [data, setData] = useState({
    company_name: '',
    started_at: '',
    ended_at: '',
    description: '',
  });

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`, { experience: data })
      .then(response => {
        setExperiences(prevExperiences => [...prevExperiences, response.data.data]);
        // Navigate back to profile page after adding experience
        navigation.navigate('Profile');
      })
      .catch(error => {
        console.error('There was an error creating the experience:', error);
      });
  };

  return (
    <KeyboardAvoidingContainer style={{paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5}}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={30}
              color="#ECE3CE"
              onPress={() => navigation.push("Profile Edit")}
            />
            </TouchableOpacity>
              <Animated.Text entering={FadeInUp.duration(1000).springify()}>
                <StyledText bold tanColor style={[styles.text, styles.pb10]}>
                  Edit profile
                </StyledText>
              </Animated.Text>
        </View>
        <View style={styles.mb3}>
          <Animated.Text >
            <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
              Fill in Previous Experience Details:
            </StyledText>
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputTopContainer}>
          <StyledTextInput
            placeholder="Company Name"
            icon="account-outline"
            label="Company Name:"
            onChangeText={(text) => setData({...data, company_name: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Date Started"
            icon="account-outline"
            label="Date Started:"
            onChangeText={(text) => setData({...data, started_at: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Date Ended"
            icon="city-variant-outline"
            label="Date Ended:"
            onChangeText={(text) => setData({...data, ended_at: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Description"
            icon="star-box-outline"
            multiline={true}
            label="Description:"
            onChangeText={(text) => setData({...data, description: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Add Experience
              </Text>
            </TouchableOpacity>
        </Animated.View>
    </View>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  pb10: {
    paddingBottom: 30,
  },
  mb3: {
    marginBottom: 3,
    marginTop: 25,
  },
  inputContainer: {
    minWidth: '100%',
  },
  inputTopContainer: {
    marginTop: 25,
    width: '100%',
  },
  submitButtonContainer: {
    width: '100%',
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
});