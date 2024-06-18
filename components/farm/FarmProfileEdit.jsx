import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import AvatarEdit from "../Profile/AvatarEdit";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';
import ProfileInfo from '../Profile/ProfileInfo';
import SectionHeader from '../Texts/SectionHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GalleryEdit from '../Profile/GalleryEdit';
import { baseUrl } from '../../config';


export default function FarmProfileEdit() {
  const [modalVisible, setModalVisible] = useState(false);
  const [accommodations, setAccommodations] = useState({});
  const [galleryImages, setGalleryImages] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);

  const [data, setData] = useState({
    name: '',
    state: '',
    city: '',
    zip_code: '',
    bio: '',
    image: null
  })

  const width = Dimensions.get('window').width;

  const navigation = useNavigation();
  const { currentUser, setUserAvatar, setProfileRefresh, profileRefresh, editProfileRefresh, setEditProfileRefresh } = useContext(UserContext);

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
      const imageResponse = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/farms/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUserAvatar(imageResponse.data.image_url);
      setProfileRefresh(true);
      console.log('Profile image updated and profileRefresh set to true');
  
      // Reset the flag
      await AsyncStorage.setItem('hasFetchedProfilePhoto', 'false');
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };
  
  const removeImage = async () => {
    setData({ ...data, image: null});
    try {
      await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/farms/delete_image`);
      AsyncStorage.removeItem('profile_photo');
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

  const handleGalleryImageUpload = async () => {
    if (galleryImages.length >= 6) {
      Alert.alert('Upload limit reached', 'You can only upload 6 images to your gallery.');
      return;
    }

    try {
      let result = {};
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 2],
        quality: 1,
      });
  
      if (!result.cancelled) {
        uploadGalleryImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Unable to pick image', error);
    }
  };

  const uploadGalleryImage = async (uri) => {
    try {
      let formData = new FormData();
      formData.append('gallery_photo', {
        uri,
        type: 'image/jpeg',
        name: `profile_${currentUser.id}.jpg`,
      });
      // Upload image to Amazon S3
      let response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/farms/upload_gallery_photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileRefresh(true);
      fetchGalleryImages(true);
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const handleDeleteGalleryImage = (photoId) => {
    Alert.alert(
      'Delete Gallery Image', "Are you sure you want to delete this Gallery Image?",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/farms/delete_gallery_photo/${photoId}`);
              console.log('Deleted photo:', photoId);
              setGalleryImages(galleryImages.filter(galleryPhoto => galleryPhoto.id !== photoId));
              setProfileRefresh(true);
            } catch (error) {
              console.log('Error deleting photo:', error);
            }
          }
        }
      ],
    );
  };

  const fetchProfileData = async (refresh) => {
    try {
      if (!refresh) {
        const cachedFarm = await AsyncStorage.getItem('farm');
        if (cachedFarm !== null) {
          console.log('Loaded farm data from cache');
          setData(prevData => ({
            ...prevData,
            name: JSON.parse(cachedFarm).name,
            state: JSON.parse(cachedFarm).state,
            city: JSON.parse(cachedFarm).city,
            zip_code: JSON.parse(cachedFarm).zip_code,
            bio: JSON.parse(cachedFarm).bio,
          }));
        } else {
          const farmResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
          console.log('Fetched farm data from API:', farmResponse.data.data);
          setData(prevData => ({
            ...prevData,
            name: farmResponse.data.data.attributes.name,
            state: farmResponse.data.data.attributes.state,
            city: farmResponse.data.data.attributes.city,
            zip_code: farmResponse.data.data.attributes.zip_code,
            bio: farmResponse.data.data.attributes.bio,
          }));
          await AsyncStorage.setItem('farm', JSON.stringify(farmResponse.data.data.attributes));
        }
      } else {
        const farmResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
        console.log('Fetched farm data from API:', farmResponse.data.data);
        setData(prevData => ({
          ...prevData,
          name: farmResponse.data.data.attributes.name,
          state: farmResponse.data.data.attributes.state,
          city: farmResponse.data.data.attributes.city,
          zip_code: farmResponse.data.data.attributes.zip_code,
          bio: farmResponse.data.data.attributes.bio,
        }));
        await AsyncStorage.setItem('farm', JSON.stringify(farmResponse.data.data.attributes));
      }
  
      const cachedProfilePhoto = await AsyncStorage.getItem('profile_photo');
      const hasFetchedProfilePhotoBefore = await AsyncStorage.getItem('hasFetchedProfilePhoto');
  
      if (cachedProfilePhoto !== null && !refresh && hasFetchedProfilePhotoBefore === 'true') {
        console.log('Loaded profile photo from cache');
        setData(prevData => ({
          ...prevData,
          image: cachedProfilePhoto,
        }));
        setUserAvatar(cachedProfilePhoto);
      } else {
        try {
          const imageResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/image`);
          console.log('Fetched profile photo from API:', imageResponse.data.image_url);
          setData(prevData => ({
            ...prevData,
            image: imageResponse.data.image_url,
          }));
          setUserAvatar(imageResponse.data.image_url);
          await AsyncStorage.setItem('profile_photo', imageResponse.data.image_url);
          await AsyncStorage.setItem('hasFetchedProfilePhoto', 'true');
        } catch (imageError) {
          console.log('Error fetching profile photo:', imageError);
          setData(prevData => ({
            ...prevData,
            image: null, // or set a default image URL here if you have one
          }));
          await AsyncStorage.setItem('hasFetchedProfilePhoto', 'false');
        }
      }

      await fetchGalleryImages(refresh);
      await fetchAccommodationData(refresh);
    } catch (farmError) {
      console.error('There was an error fetching the farm:', farmError);
    }
  };

  const fetchAccommodationData = async (refresh) => {
    try {
      const cachedAccommodations = await AsyncStorage.getItem('accommodations');
      const hasFetchedBeforeEditProfile = await AsyncStorage.getItem('hasFetchedAccommodationsEditProfile');
  
      if (cachedAccommodations !== null && !refresh && hasFetchedBeforeEditProfile === 'true') {
        console.log('Loaded accommodations from cache');
        setAccommodations(JSON.parse(cachedAccommodations));
        return;
      }
  
      const accommodationResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/accommodation`);
      if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
        console.log("Fetched accommodations from API:", accommodationResponse.data.data.attributes);
        setAccommodations(accommodationResponse.data.data.attributes);
        await AsyncStorage.setItem('accommodations', JSON.stringify(accommodationResponse.data.data.attributes));
      } else {
        setAccommodations({});
        console.log('No accommodations found for this farm.', accommodations);
      }
  
      // Set the flag to indicate that a fetch has been attempted
      await AsyncStorage.setItem('hasFetchedAccommodationsEditProfile', 'true');
    } catch (error) {
      console.error('There was an error fetching the accommodations:', error);
    }
  };

  const fetchGalleryImages = async (refresh) => {
    try {
      const cachedGalleryImages = await AsyncStorage.getItem('gallery_images');
      const hasFetchedBefore = await AsyncStorage.getItem('hasFetchedGalleryImages');
      if (cachedGalleryImages !== null && !refresh && hasFetchedBefore === 'true') {
        console.log('Loaded gallery images from cache');
        setGalleryImages(JSON.parse(cachedGalleryImages));
        return;
      } else {

      const galleryResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/gallery_photos`);
      console.log('Fetched gallery images from API:', galleryResponse.data.gallery_photos);
      setGalleryImages(galleryResponse.data.gallery_photos);
      await AsyncStorage.setItem('gallery_images', JSON.stringify(galleryResponse.data.gallery_photos));
      }
      await AsyncStorage.setItem('hasFetchedGalleryImages', 'true');
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const handleAddAccommodation = () => {
    navigation.navigate('Farm Profile Add Accommodations');
  }
  
  // This useEffect runs when editProfileRefresh chang
  useEffect(() => {
    fetchProfileData(editProfileRefresh);
    setHasMounted(true);
  }, [editProfileRefresh]); // Empty dependency array means this useEffect runs once on mount
  
  // This useEffect runs when editProfileRefresh changes
  useEffect(() => {
    if (editProfileRefresh && hasMounted) {
      fetchProfileData(true);
      setEditProfileRefresh(false);
    }
  }, [editProfileRefresh, hasMounted]); // Trigger on refresh changes
  
  useFocusEffect(
    React.useCallback(() => {
      if (editProfileRefresh && hasMounted) { // Check if the component has mounted
        fetchProfileData(true);
        setEditProfileRefresh(false); // Reset the flag
      }
    }, [editProfileRefresh, hasMounted]) // Add hasMounted to the dependency array
  );

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
            <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit}/>
        </Animated.View>
        {Object.keys(galleryImages).length !== 0 ?
        <View style={styles.galleryContainer}>
          <GalleryEdit
            width={width}
            galleryImages={galleryImages}
            handleDeleteImage={handleDeleteGalleryImage}
            handleGalleryImageUpload={handleGalleryImageUpload}
          />
        </View>
        : 
        <View style={styles.galleryPhotosNotFoundContainer}>
        <StyledText bold style={styles.galleryPhotosNotFoundText}>
          You do not currently have any photos added to your gallery. Click on the button below to add gallery photos to your profile.
        </StyledText> 
        </View>}
        <View style={styles.addImageContainer}>
        <TouchableOpacity style={styles.addImageButton} onPress={handleGalleryImageUpload}>
          <Text style={styles.addImageText}>Upload Image To Gallery</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.inputContainer}>
            <SectionHeader
              option="Edit"
              onPress={() =>
                navigation.navigate("Farm Profile Edit Details")
              }
              >
              Display Info
            </SectionHeader>
            <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputItem}>
            <ProfileInfo label="Name" icon="account-outline">
              <StyledText style={styles.existingData}>
                {data.name.length > 15 ? `${data.name.substring(0, 15)}...` : data.name}
              </StyledText>
            </ProfileInfo>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputItem}>
            <ProfileInfo label="City" icon="city-variant-outline">
              <StyledText style={styles.existingData}>{data.city}</StyledText>
            </ProfileInfo>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputItem}>
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
            {/* Submit button */}
          </View>
          <View style={styles.inputContainer}>
            { Object.keys(accommodations).length === 0 ?
              <View>
                <StyledText bold >
                  No accommodations found. Click on the button below to add accommodations to your profile.
                </StyledText>
                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
                  <TouchableOpacity style={styles.submitButton} onPress={handleAddAccommodation}>
                    <Text style={styles.submitButtonText}>Add Accommodations</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              :
              <View>
                <SectionHeader
                  option="Edit"
                  onPress={() =>
                    navigation.navigate("Farm Profile Edit Accommodations")
                  }
                  >
                  Accommodation Info
                </SectionHeader>
                <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.inputItem}>
                  <ProfileInfo label="Offers Housing" icon="home-outline">
                    <StyledText style={styles.existingData}>{accommodations.housing === true ? "Yes" : "No"}</StyledText>
                  </ProfileInfo>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(1200).duration(1000).springify()} style={styles.inputItem}>
                  <ProfileInfo label="Offers Meals" icon="food-apple-outline">
                    <StyledText style={styles.existingData}>{accommodations.meals === true ? "Yes" : "No"}</StyledText>
                  </ProfileInfo>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} style={styles.inputItem}>
                  <ProfileInfo label="Offers Transportation" icon="car-outline">
                    <StyledText style={styles.existingData}>{accommodations.transportation === true ? "Yes" : "No"}</StyledText>
                  </ProfileInfo>
                </Animated.View>
              </View>
            }
          </View>
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
  infoContainer: {
    backgroundColor: '#3A4D39',
    paddingBottom: 30,
  },
  text: {
    textAlign: 'center',
  },
  mb3: {
    marginTop: 15,
    marginBottom: 5,
  },
  avatarEdit: {
    backgroundColor: '#3A4D39',
    padding: 30,
    borderRadius: 100,
  },
  existingData: {
    color: '#3A4D39',
  },
  inputContainer: { 
    backgroundColor: '#3A4D39',
    width: '100%',
    padding: 20,
  },
  inputItem: {
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
  submitButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '100%',
    backgroundColor: '#3A4D39',
  },
  galleryPhotosNotFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#3A4D39',
    padding: 20,
  },
  galleryPhotosNotFoundText: {
    textAlign: 'center',
  },
  addImageContainer: {
    width: '100%',
    backgroundColor: '#3A4D39',
    paddingBottom: 20,
  },
  addImageButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    width: '90%',
  },
  addImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
});

