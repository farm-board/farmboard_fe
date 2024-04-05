import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
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
import ExperienceForm from '../Experience/ExperienceForm';
import ReferenceForm from '../Reference/ReferenceForm';
import SectionHeader from '../Texts/SectionHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';


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
    image: null
  })
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [showReferencesForm, setShowReferencesForm] = useState(false);
  const [references, setReferences] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({...data, skills: selectedSkills});
  }

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`, { employee: data})
    .then(response => {
      console.log(response.data);
      navigation.push('Profile');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }

  const toggleExperienceForm = () => {
    setShowExperienceForm(!showExperienceForm);
  };

  const toggleReferenceForm = () => {
    setShowReferencesForm(!showReferencesForm);
  };

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

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`)
    ])
    .then(([employeeResponse, imageResponse]) => {
      setData({
        ...data,
        first_name: employeeResponse.data.data.attributes.first_name,
        last_name: employeeResponse.data.data.attributes.last_name,
        city: employeeResponse.data.data.attributes.city,
        state: employeeResponse.data.data.attributes.state,
        zip_code: employeeResponse.data.data.attributes.zip_code,
        skills: employeeResponse.data.data.attributes.skills,
        bio: employeeResponse.data.data.attributes.bio,
        age: employeeResponse.data.data.attributes.age,
        image: imageResponse.data.image_url
      })
    })
    .catch(error => {
      console.error('There was an error fetching the employee:', error);
    });
  };

  useEffect(() => {
    fetchProfileData()
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
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
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
            <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit}/>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="First Name"
              icon="account-outline"
              label="First Name:"
              value={data.first_name}
              onChangeText={(text) => setData({...data, first_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Last Name"
              icon="account-outline"
              label="Last Name:"
              value={data.last_name}
              onChangeText={(text) => setData({...data, last_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="City"
              icon="city-variant-outline"
              label="City:"
              value={data.city}
              onChangeText={(text) => setData({...data, city: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="State"
              icon="star-box-outline"
              label="State:"
              value={data.state}
              onChangeText={(text) => setData({...data, state: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
             <StyledTextInput
              placeholder="Zip Code"
              icon="longitude"
              label="Zip Code:"
              value={data.zip_code}
              onChangeText={(text) => setData({...data, zip_code: text})}
            />
        </Animated.View>
          <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Age"
              icon="cake"
              label="Age:"
              value={data.age}
              onChangeText={(text) => setData({...data, age: text})}
            />
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Bio"
            icon="pencil-outline"
            multiline={true}
            label="Bio:"
            value={data.bio}
            onChangeText={(text) => setData({...data, bio: text})}
          />
        </Animated.View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} >
        <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5 }}>Relevant Skills:</Text>
            <SkillSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Submit
              </Text>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
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