import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    image: null,
    marketplace_phone: '',
    marketplace_email: ''
  });

  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]);

  const [experienceEditMode, setExperienceEditMode] = useState(false);
  const [referenceEditMode, setReferenceEditMode] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [hasMounted, setHasMounted] = useState(false);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({ ...data, skills: selectedSkills });
  }

  const navigation = useNavigation();
  const { currentUser, setUserAvatar, editProfileRefresh, setEditProfileRefresh, profileRefresh, setProfileRefresh, logout } = useContext(UserContext);

  useEffect(() => {
    fetchProfileData(editProfileRefresh);
    setHasMounted(true);
  }, [editProfileRefresh]);
  
  // Add another useEffect that runs when editProfileRefresh and hasMounted changes
  useEffect(() => {
    if (editProfileRefresh && hasMounted) {
      fetchProfileData(true);
      setEditProfileRefresh(false);
    }
  }, [editProfileRefresh, hasMounted]);
  
  // Add a useFocusEffect that triggers fetchProfileData when the component is focused
  useFocusEffect(
    React.useCallback(() => {
      if (editProfileRefresh && hasMounted) {
        fetchProfileData(true);
        setEditProfileRefresh(false);
      }
    }, [editProfileRefresh, hasMounted])
  );
  
  const fetchProfileData = async (refresh) => {
    try {
      let employeeResponse, experiencesResponse, referencesResponse, imageResponse;
  
      if (!refresh) {
        const cachedEmployee = await AsyncStorage.getItem('employee');
        const cachedExperiences = await AsyncStorage.getItem('experiences');
        const cachedReferences = await AsyncStorage.getItem('references');
        const cachedImage = await AsyncStorage.getItem('employee_image');
  
        if (cachedEmployee !== null) {
          employeeResponse = { data: { data: { attributes: JSON.parse(cachedEmployee) } } };
        }
  
        if (cachedExperiences !== null) {
          experiencesResponse = { data: { data: JSON.parse(cachedExperiences) } };
        }
  
        if (cachedReferences !== null) {
          referencesResponse = { data: { data: JSON.parse(cachedReferences) } };
        }
  
        if (cachedImage !== null) {
          imageResponse = { data: { image_url: cachedImage } };
        }
      }
  
      if (!employeeResponse) {
        employeeResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`);
        await AsyncStorage.setItem('employee', JSON.stringify(employeeResponse.data.data.attributes));
      }
  
      if (!experiencesResponse) {
        experiencesResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences`);
        await AsyncStorage.setItem('experiences', JSON.stringify(experiencesResponse.data.data));
      }
  
      if (!referencesResponse) {
        referencesResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references`);
        await AsyncStorage.setItem('references', JSON.stringify(referencesResponse.data.data));
      }
  
      if (!imageResponse) {
        try {
          imageResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/image`);
          await AsyncStorage.setItem('employee_image', imageResponse.data.image_url);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            imageResponse = { data: { image_url: null } }; // Default value if image is not found
          } else {
            throw error; // Rethrow if it's a different error
          }
        }
      }
  
      setExperiences(experiencesResponse.data.data);
      setReferences(referencesResponse.data.data);
      setUserAvatar(imageResponse.data.image_url);
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
        image: imageResponse.data.image_url || prevData.image,
        marketplace_phone: employeeResponse.data.data.attributes.marketplace_phone,
        marketplace_email: employeeResponse.data.data.attributes.marketplace_email
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
      const imageResponse = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/employees/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUserAvatar(imageResponse.data.image_url);
      setProfileRefresh(true);
      console.log('Profile image updated and profileRefresh set to true');
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const removeImage = async () => {
    setData({ ...data, image: null});
    try {
      await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/employees/delete_image`);
      AsyncStorage.removeItem('employee_image');
      setUserAvatar('');
      setProfileRefresh(true);
      setModalVisible(false);
  
      // Reset the flags
      await AsyncStorage.setItem('hasFetchedProfilePhoto', 'false');
      await AsyncStorage.setItem('profilePhotoExists', 'false'); // Set to 'false' when image is removed
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const deleteExperience = async (experienceId) => {
    try {
      await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences/${experienceId}`);
      fetchProfileData(true);
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const handleExperienceRedirect = (experienceId) => {
    navigation.navigate('Employee Profile Edit Experiences', { experienceId: experienceId });
  };
  
  const handleReferenceRedirect = (referenceId) => {
    navigation.navigate('Employee Profile Edit References', { referenceId: referenceId });
  };


  const deleteReference = async (referenceId) => {
    try {
      await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references/${referenceId}`);
      fetchProfileData(true);
    } catch (error) {
      console.error('Error deleting references:', error);
    }
  };

  const handleAccountDelete = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? All Existing data will be lost. This includes your profile and any active listings.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive", // This will show a red "Delete" on iOS
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            try {
              await axios.delete(`${baseUrl}/`, {
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: token,
                },
              });
              console.log("Account deleted");
  
              // Show a success alert
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );
  
              // Clear local data and log out
              setUserAvatar("");
              logout(navigation);
              AsyncStorage.clear();
            } catch (error) {
              console.log("Error deleting account:", error);
            }
          }
        }
      ]
    );
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
              <StyledText style={styles.existingData}>
              {data.last_name.length > 15 ? `${data.last_name.substring(0, 15)}...` : data.last_name}
              </StyledText>
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
        <View style={styles.inputContainer2}>
          <SectionHeader
          >
            Experience Info
          </SectionHeader>
          <View style={{marginBottom: 20}}>
          {experiences.map((experience, index) => (
            <Animated.View key={index} entering={FadeInDown.duration(1000).springify()} style={styles.inputItemTwo}>
              <ProfileInfo label="Company Name" icon="briefcase-outline">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledText style={styles.existingData}>
                  {experience.attributes.company_name.length > 10 ? `${experience.attributes.company_name.substring(0, 10)}...` : experience.attributes.company_name}
                  </StyledText>
                    <TouchableOpacity onPress={() => handleExperienceRedirect(experience.id)} style={{backgroundColor: '#3A4D39', marginRight: -18, marginLeft: 10, padding: 10, borderRadius: 15}}>
                      <MaterialCommunityIcons name="pencil" size={26} color="#ffb900" style={{}}/>
                    </TouchableOpacity>
                </View>
              </ProfileInfo>
            </Animated.View>
          ))}
          </View>
          {experiences.length < 3 && (
            <TouchableOpacity
              style={[styles.addButton]}
              onPress={() => navigation.navigate("Employee Profile Add Experiences")}
            >
              <Text style={styles.addButtonText}>Add Experience</Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputContainer2}>
          <SectionHeader>
            Reference Info
          </SectionHeader>
          <View style={{marginBottom: 20}}>
          {references.map((reference, index) => (
            <Animated.View key={index} entering={FadeInDown.duration(1000).springify()} style={styles.inputItemTwo}>
              <ProfileInfo label="Reference Name" icon="account-outline">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledText style={styles.existingData}>
                    {reference.attributes.first_name.length > 10 ? `${reference.attributes.first_name.substring(0, 10)}...` : reference.attributes.first_name}
                  </StyledText>
                  <TouchableOpacity onPress={() => handleReferenceRedirect(reference.id)} style={{backgroundColor: '#3A4D39', marginRight: -18, marginLeft: 10, padding: 10, borderRadius: 15}}>
                      <MaterialCommunityIcons name="pencil" size={26} color="#ffb900" style={{}}/>
                    </TouchableOpacity>
                </View>
              </ProfileInfo>
            </Animated.View>
          ))}
          </View>
          {references.length < 3 && (
            <TouchableOpacity
              style={[styles.bottomButton]}
              onPress={() => navigation.navigate("Employee Profile Add References")}
            >
              <Text style={styles.addButtonText}>Add Reference</Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        { data.marketplace_phone || data.marketplace_email ?
          <View style={styles.inputContainerContactInfo}>
              <View>
                <SectionHeader
                  option="Edit"
                  onPress={() =>
                    navigation.navigate("Employee Profile Edit Marketplace Contact Info")
                  }
                  >
                  Marketplace Contact Info
                </SectionHeader>
                { data.marketplace_phone ?
                <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.inputItem}>
                  <ProfileInfo label="Phone Number" icon="phone">
                    <StyledText style={styles.existingData}>{data.marketplace_phone}</StyledText>
                  </ProfileInfo>
                </Animated.View>
                : null }
                { data.marketplace_email ?
                <Animated.View entering={FadeInDown.delay(1200).duration(1000).springify()} style={styles.inputItem}>
                  <ProfileInfo label="Email" icon="email">
                    <StyledText style={styles.existingData}>{data.marketplace_email.length > 15 ? `${data.marketplace_email.substring(0, 15)}...` : data.marketplace_email}</StyledText>
                  </ProfileInfo>
                </Animated.View>
                : null }
              </View>
          </View>
          : null}
          <View style={styles.deleteAccountButtonContainer}>
            <TouchableOpacity style={styles.deleteAccountButton} onPress={handleAccountDelete}>
              <Text style={styles.deleteAccountText}>Delete Your Account</Text>
            </TouchableOpacity>
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
  inputContainerContactInfo: {
    backgroundColor: '#3A4D39',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  existingData: {
    color: 'black',
  },
  inputContainer: { 
    backgroundColor: '#3A4D39',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 25,
  },
  inputContainer2: { 
    backgroundColor: '#3A4D39',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inputItem: {
    minWidth: '100%',
  },
  inputItemTwo: {
    minWidth: '100%',
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
  bottomButton: {
    backgroundColor: '#ffb900',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 100,
    marginBottom: 20,
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
  deleteAccountButtonContainer: {
    width: '100%',
    backgroundColor: '#3A4D39',
    paddingBottom: 40,
  },
  deleteAccountButton: {
    backgroundColor: '#FF3F3F',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    width: '90%',
    marginTop: 20,
  },
  deleteAccountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});