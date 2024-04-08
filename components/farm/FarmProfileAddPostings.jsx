import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import StyledSwitch from '../Inputs/StyledSwitch';
import SkillsSelect from '../skills/SkillSelect';


export default function FarmProfileAddPostings() {
  const [data, setData] = useState({
    title: '',
    salary: '',
    skill_requirements: [],
    offers_lodging: false,
    duration: '',
    age_requirement: '',
    payment_type: '',
    description: ''
  })

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({...data, skill_requirements: selectedSkills});
  }

  const handleSubmit = () => {
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings`, data)
    .then(response => {
      console.log(response.data);
      navigation.push('Profile');
    })
    .catch(error => {
      console.log('Unable to add posting', error);
    })
  }

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.Text >
          <View style={styles.titleTextBox}>
            <StyledText entering={FadeInUp.duration(1000).springify()} big style={styles.text}>
              Complete the form below to add a new job posting:
            </StyledText>
          </View>
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Job Title"
            icon="account-outline"
            label="Job Title:"
            onChangeText={(text) => setData({ ...data, title: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Salary"
            icon="city-variant-outline"
            label="Salary:"
            onChangeText={(text) => setData({...data, salary: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
           <StyledTextInput
            placeholder="Payment Type"
            icon="longitude"
            label="Payment Type:"
            onChangeText={(text) => setData({...data, payment_type: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Duration"
            icon="star-box-outline"
            label="Duration:"
            onChangeText={(text) => setData({...data, duration: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
           <StyledTextInput
            placeholder="Age Requirement"
            icon="longitude"
            label="Age Requirement:"
            onChangeText={(text) => setData({...data, age_requirement: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} >
        <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5 }}>Relevant Skills:</Text>
            <SkillsSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledSwitch
            placeholder="Offers Accommodations"
            icon="home-outline"
            label="Offers Accommodations:"
            value={data.offers_lodging}
            onValueChange={(newValue) => setData({ ...data, offers_lodging: newValue })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
        <StyledTextInput
          placeholder="Description"
          icon="pencil-outline"
          multiline={true}
          label="Description:"
          onChangeText={(text) => setData({...data, description: text})}
        />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Posting</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  );
};

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
  titleTextBox: {
    padding: 10,
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
  avatarEdit: {
    // Styles for AvatarEdit component
  },
  inputContainer: {
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
});

