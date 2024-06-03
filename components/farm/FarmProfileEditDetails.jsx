import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function FarmProfileEditDetails() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState({
    name: '',
    state: '',
    city: '',
    zip_code: '',
    bio: '',
    image: null
  })

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
]

  const navigation = useNavigation();
  const { currentUser, setUserName } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`, { farm: data})
    .then(response => {
      console.log(response.data);
      navigation.push('Edit Profile');
      setUserName(data.name);
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
    ])
    .then(([farmResponse, imageResponse]) => {
      setData({
        ...data,
        name: farmResponse.data.data.attributes.name,
        state: farmResponse.data.data.attributes.state,
        city: farmResponse.data.data.attributes.city,
        zip_code: farmResponse.data.data.attributes.zip_code,
        bio: farmResponse.data.data.attributes.bio
      })
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
  };

  useEffect(() => {
    fetchProfileData()
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Name"
            icon="account-outline"
            label="Name:"
            labelStyle={{fontSize: 18, color: 'white'}}
            value={data.name}
            onChangeText={(text) => setData({ ...data, name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="City"
            icon="city-variant-outline"
            label="City:"
            labelStyle={{fontSize: 18, color: 'white'}}
            value={data.city}
            onChangeText={(text) => setData({...data, city: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={states}
            fieldPlaceholder="State"
            label="State:"
            labelStyle={{fontSize: 18, color: 'white'}}
            onSelect={(selectedItem) => {
              setData({...data, state: selectedItem})
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Zip Code"
            icon="longitude"
            label="Zip Code:"
            labelStyle={{fontSize: 18, color: 'white'}}
            keyboardType="numeric"
            maxLength={5}
            value={data.zip_code}
            onChangeText={(text) => {
              // Ensure that only numbers are entered
              const numericText = text.replace(/[^0-9]/g, '');
              setData({...data, zip_code: numericText})
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
        <StyledTextInput
          placeholder="Bio"
          icon="pencil-outline"
          multiline={true}
          label="Bio:"
          labelStyle={{fontSize: 18, color: 'white'}}
          value={data.bio}
          onChangeText={(text) => setData({...data, bio: text})}
        />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
            <View style={styles.submitArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
        </TouchableOpacity>
        </Animated.View>
      </View>
      {/* UploadModal component */}
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
  )
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  content: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  titleTextBox: {
  },
  text: {
    textAlign: 'center',
  },
  mb3: {
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
    marginTop: 15,
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
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
});
