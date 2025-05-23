import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import AvatarEdit from "../Profile/AvatarEdit";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';
import SkillSelect from '../../components/skills/SkillSelect';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmployeeProfileEditDetails() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    city: '',
    state: '',
    zip_code: '',
    skills: [],
    bio: '',
    age: '',
    phone: '',
    email: '',
    image: null,
  });

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({ ...data, skills: selectedSkills });
  };

  const navigation = useNavigation();
  const { currentUser, setUserFirstName, setUserLastName, editProfileRefresh, setEditProfileRefresh, profileRefresh, setProfileRefresh } = useContext(UserContext);

  const validateForm = () => {
    const missingFields = [];
    if (!data.first_name) missingFields.push('First Name');
    if (!data.last_name) missingFields.push('Last Name');
    if (!data.city) missingFields.push('City');
    if (!data.state) missingFields.push('State');
    if (!data.zip_code) missingFields.push('Zip Code');
    if (!data.phone && !data.email) missingFields.push('Phone or Email');

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please fill out the following fields: ${missingFields.join(', ')} to create a profile`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/employees`, { employee: data });
        console.log('Updated employee data');
        // Clear the cache and wait for it to complete
        await AsyncStorage.removeItem('employee');
        console.log('Cleared employee data from cache');
        setProfileRefresh(true);
        setEditProfileRefresh(true);
        setUserFirstName(data.first_name);
        setUserLastName(data.last_name);
      } catch (error) {
        if (
          error.response &&
          error.response.status === 422 &&
          Array.isArray(error.response.data?.errors)
        ) {
          const messages = error.response.data.errors;
          const containsProfanity = messages.some(m =>
            m.toLowerCase().includes('prohibited word')
          );
    
          Alert.alert(
            containsProfanity ? 'Prohibited Language' : 'Validation Error',
            messages[0]           
          );
        } else {
          console.error('There was an error updating the profle:', error);
          Alert.alert('Error', 'Unable to update profile. Please try again.');
        }
      }
    }
  }

  const fetchProfileData = async () => {
    try {
      const [employeeResponse, imageResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`),
        axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/image`).catch(error => {
          if (error.response && error.response.status === 404) {
            return { data: { image_url: null } };
          }
          throw error;
        })
      ]);

      setData({
        first_name: employeeResponse.data.data.attributes.first_name,
        last_name: employeeResponse.data.data.attributes.last_name,
        city: employeeResponse.data.data.attributes.city,
        state: employeeResponse.data.data.attributes.state,
        zip_code: employeeResponse.data.data.attributes.zip_code,
        skills: employeeResponse.data.data.attributes.skills,
        bio: employeeResponse.data.data.attributes.bio,
        age: employeeResponse.data.data.attributes.age,
        phone: employeeResponse.data.data.attributes.phone,
        email: employeeResponse.data.data.attributes.email,
        image: imageResponse.data.image_url || null,
      });
    } catch (error) {
      console.error('There was an error fetching the employee:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

  useEffect(() => {
    if (profileRefresh || editProfileRefresh) {
      navigation.push('Edit Profile');
    }
  }, [profileRefresh, editProfileRefresh]);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="First Name"
            icon="account-outline"
            label="First Name:"
            maxLength={25}
            value={data.first_name}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, first_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Last Name"
            icon="account-outline"
            label="Last Name:"
            maxLength={25}
            value={data.last_name}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, last_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="City"
            icon="city-variant-outline"
            label="City:"
            value={data.city}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, city: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={states}
            fieldPlaceholder="State"
            label="State:"
            value={data.state}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onSelect={(selectedItem) => {
              setData({ ...data, state: selectedItem });
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Zip Code"
            icon="longitude"
            label="Zip Code:"
            keyboardType="numeric"
            maxLength={5}
            value={data.zip_code}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => {
              // Ensure that only numbers are entered
              const numericText = text.replace(/[^0-9]/g, '');
              setData({...data, zip_code: numericText})
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Phone"
            icon="phone"
            label="Phone:"
            maxLength={14}
            keyboardType="numeric"
            value={data.phone}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, phone: formatPhoneNumber(text) })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Email"
            icon="email"
            label="Email:"
            value={data.email}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, email: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Bio"
            icon="pencil-outline"
            multiline={true}
            label="Bio:"
            maxLength={3000}
            labelStyle={{ fontSize: 18, color: 'white' }}
            value={data.bio}
            onChangeText={(text) => setData({ ...data, bio: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
          <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5, fontSize: 18 }}>Relevant Skills:</Text>
          <SkillSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              Save Changes
            </Text>
            <View style={styles.submitArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <UploadModal
        modalVisible={modalVisible}
        onBackPress={() => {
          setModalVisible(false);
        }}
        onCameraPress={() => pickImage()}
        onGalleryPress={() => pickImage("gallery")}
        onRemovePress={() => removeImage()}
      />
    </KeyboardAvoidingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
    marginTop: 25,
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
    width: '100%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  submitArrow: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 15,
    top: 13,
  },
  toggleButton: {
    backgroundColor: '#ECE3CE',
    minWidth: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  toggleButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center'
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