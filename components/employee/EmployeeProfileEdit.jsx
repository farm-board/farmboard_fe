import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import AvatarEdit from "../Profile/AvatarEdit";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';
import SectionHeader from '../Texts/SectionHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProfileInfo from '../Profile/ProfileInfo';

export default function EmployeeProfileEdit() {
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
  });
  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]);

  const [experienceEditMode, setExperienceEditMode] = useState(false);
  const [referenceEditMode, setReferenceEditMode] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({ ...data, skills: selectedSkills });
  }

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [employeeResponse, experiencesResponse, referencesResponse] = await Promise.all([
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`),
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`),
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references`)
      ]);

      let imageResponse;
      try {
        imageResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          imageResponse = { data: { image_url: null } }; // Default value if image is not found
        } else {
          throw error; // Rethrow if it's a different error
        }
      }

      setExperiences(experiencesResponse.data.data);
      setReferences(referencesResponse.data.data);
      setData(prevData => ({
        ...prevData,
        first_name: employeeResponse.data.data.attributes.first_name,
        last_name: employeeResponse.data.data.attributes.last_name,
        city: employeeResponse.data.data.attributes.city,
        state: employeeResponse.data.data.attributes.state,
        zip_code: employeeResponse.data.data.attributes.zip_code,
        skills: employeeResponse.data.data.attributes.skills,
        bio: employeeResponse.data.data.attributes.bio,
        age: employeeResponse.data.data.attributes.age,
        image: imageResponse.data.image_url || prevData.image,  // Maintain previous image if not updated
      }));
    } catch (error) {
      console.error('There was an error fetching the employee:', error);
    }
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
        setData({ ...data, image: result.assets[0].uri });
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

      await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const deleteExperience = async (experienceId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences/${experienceId}`);
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const deleteReference = async (referenceId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references/${referenceId}`);
      fetchReferences();
    } catch (error) {
      console.error('Error deleting references:', error);
    }
  };

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <View style={styles.header} />
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
          <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit} />
        </Animated.View>
        <View style={styles.inputContainer}>
          <SectionHeader
            option="Edit"
            onPress={() => navigation.navigate("Employee Profile Edit Details")}
          >
            Display Info
          </SectionHeader>
          <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="First Name" icon="account-outline">
              <StyledText style={styles.existingData}>
                {data.first_name.length > 15 ? `${data.first_name.substring(0, 15)}...` : data.first_name}
              </StyledText>
            </ProfileInfo>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="Last Name" icon="account-outline">
              <StyledText style={styles.existingData}>{data.last_name}</StyledText>
            </ProfileInfo>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="City" icon="city-variant-outline">
              <StyledText style={styles.existingData}>{data.city}</StyledText>
            </ProfileInfo>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="State" icon="star-box-outline">
              <StyledText style={styles.existingData}>{data.state}</StyledText>
            </ProfileInfo>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="Zip Code" icon="longitude">
              <StyledText style={styles.existingData}>{data.zip_code}</StyledText>
            </ProfileInfo>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="About" icon="pencil-outline">
              <StyledText style={styles.existingData}>
                {data.bio.length > 15 ? `${data.bio.substring(0, 15)}...` : data.bio}
              </StyledText>
            </ProfileInfo>
          </Animated.View>
        </View>
        <View style={styles.inputContainer}>
          <SectionHeader
            option={experienceEditMode ? 'Done' : 'Edit'}
            onPress={() => setExperienceEditMode(!experienceEditMode)}
          >
            Experience Info
          </SectionHeader>
          {experiences.map((experience, index) => (
            <Animated.View key={index} entering={FadeInDown.duration(1000).springify()} style={styles.inputItemTwo}>
              <ProfileInfo label="Company Name" icon="briefcase-outline">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledText style={styles.existingData}>
                    {experience.attributes.company_name}
                  </StyledText>
                  {experienceEditMode && (
                    <TouchableOpacity onPress={() => deleteExperience(experience.id)}>
                      <MaterialCommunityIcons name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              </ProfileInfo>
            </Animated.View>
          ))}
          {experienceEditMode && experiences.length < 3 && (
            <TouchableOpacity
              style={[styles.addButton, styles.bottomButton]}
              onPress={() => navigation.navigate("Employee Profile Add Experiences")}
            >
              <Text style={styles.addButtonText}>Add Experience</Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputContainer}>
          <SectionHeader
            option={referenceEditMode ? 'Done' : 'Edit'}
            onPress={() => setReferenceEditMode(!referenceEditMode)}
          >
            Reference Info
          </SectionHeader>
          {references.map((reference, index) => (
            <Animated.View key={index} entering={FadeInDown.duration(1000).springify()} style={styles.inputItemTwo}>
              <ProfileInfo label="Reference Name" icon="account-outline">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledText style={styles.existingData}>
                    {reference.attributes.first_name}
                  </StyledText>
                  {referenceEditMode && (
                    <TouchableOpacity onPress={() => deleteReference(reference.id)}>
                      <MaterialCommunityIcons name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              </ProfileInfo>
            </Animated.View>
          ))}
          {referenceEditMode && references.length < 3 && (
            <TouchableOpacity
              style={[styles.addButton, styles.bottomButton]}
              onPress={() => navigation.navigate("Employee Profile Add References")}
            >
              <Text style={styles.addButtonText}>Add Reference</Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
              </View>
            </TouchableOpacity>
          )}
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
      </View>
    </KeyboardAvoidingContainer>
  );
}

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
    marginTop: 25,
  },
  avatarEdit: {
    backgroundColor: '#3A4D39',

    padding: 30,
    borderRadius: 100,
    marginBottom: 25,
  },
  inputContainer: {
    width: '100%',
  },
  existingData: {
    color: 'black',
  },
  inputContainer: { 
    backgroundColor: '#3A4D39',
    width: '100%',
    padding: 20,
  },
  inputItem: {
    minWidth: '100%',
  },
  inputItemTwo: {
    minWidth: '100%',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#ffb900',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 100,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  submitArrow: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 2,
    position: "absolute",
    right: 15,
    top: 5,
  },
});