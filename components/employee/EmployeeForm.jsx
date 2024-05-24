import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
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
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';


export default function EmployeeForm() {
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

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({...data, skills: selectedSkills});
  }

  const navigation = useNavigation();
  const { currentUser, setSetupComplete } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`, { employee: { ...data, setup_complete: true }})
    .then(response => {
      console.log(response.data);
      setSetupComplete(true);
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }

  const pickImage = async (mode) => {
    try {
      let result = {};
      if (mode === "gallery") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        setData({ ...data, image: result.assets[0].uri});
        uploadImage(result.assets[0].uri);
        setModalVisible(false);
      }
    } catch (error) {
      console.log('Unable to pick image', error);
      setModalVisible(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      let formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `profile_${currentUser.id}.jpg`,
      });

      // Upload image to Amazon S3
      let response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const fetchProfileImage = async () => {
    try {
      let response = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`);
      setData({ ...data, image: response.data.image_url });
    } catch (error) {
      console.log('Unable to fetch profile image', error);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container}
    behavior="padding">
      <View style={styles.content}>
      <Animated.Text >
          <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
            Fill in your details to get started with your Profile:
          </StyledText>
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
            <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit}/>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="First Name"
              icon="account-outline"
              label="First Name:"
              onChangeText={(text) => setData({...data, first_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Last Name"
              icon="account-outline"
              label="Last Name:"
              onChangeText={(text) => setData({...data, last_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="City"
              icon="city-variant-outline"
              label="City:"
              onChangeText={(text) => setData({...data, city: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={states}
            fieldPlaceholder="State"
            label="State:"
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
              keyboardType="numeric"
              onChangeText={(text) => setData({...data, zip_code: text})}
            />
        </Animated.View>
          <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Age"
              icon="cake"
              label="Age:"
              onChangeText={(text) => setData({...data, age: text})}
            />
            <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Phone"
              icon="phone"
              label="Phone number that potential employers can contact you at:"
              keyboardType="numeric"
              onChangeText={(text) => setData({...data, phone: text})}
            />
            <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Email"
              icon="email"
              label="Email that potential employers can contact you at:"
              onChangeText={(text) => setData({...data, email: text})}
            />
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Bio"
            icon="pencil-outline"
            multiline={true}
            label="Bio:"
            onChangeText={(text) => setData({...data, bio: text})}
          />
          </Animated.View>
          </Animated.View>
        </Animated.View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} >
        <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5 }}>Relevant Skills:</Text>
            <SkillSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Submit
              </Text>
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
  )
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