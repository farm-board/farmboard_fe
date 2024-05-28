import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
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


export default function FarmProfileEdit() {
  const [modalVisible, setModalVisible] = useState(false);
  const [accommodations, setAccommodations] = useState({});
  const [galleryImages, setGalleryImages] = useState([]);
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
  const { currentUser } = useContext(UserContext);

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
      let response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const removeImage = () => {
    setData({ ...data, image: null});
    axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/delete_image`);
    setModalVisible(false);
  };
  
  const handleAccommodationsDelete = () => {
    setAccommodations({});
    axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`);
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
      let response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/upload_gallery_photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchGalleryImages();
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const handleDeleteGalleryImage = (photoId) => {
    axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/delete_gallery_photo/${photoId}`);
    console.log('Deleted photo:', photoId);
    setGalleryImages(galleryImages.filter(galleryPhoto => galleryPhoto.id !== photoId));
  };

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`),
    ])
    .then(([farmResponse, imageResponse, accommodationResponse]) => {
      setData({
        ...data,
        name: farmResponse.data.data.attributes.name,
        state: farmResponse.data.data.attributes.state,
        city: farmResponse.data.data.attributes.city,
        zip_code: farmResponse.data.data.attributes.zip_code,
        bio: farmResponse.data.data.attributes.bio,
        image: imageResponse.data.image_url
      });
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
  };

  const fetchAccommodationData = async () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`)
      .then((accommodationResponse) => {
        if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
          setAccommodations(accommodationResponse.data.data.attributes);
        } else {
          console.log('No accommodations found for this farm.');
        }
      })
      .catch(error => {
        console.error('There was an error fetching the accommodations:', error);
      });
  };


  const fetchGalleryImages = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/gallery_photos`)
    .then((galleryResponse) => {
      console.log('gallery images:', galleryResponse.data.gallery_photos);
      setGalleryImages(galleryResponse.data.gallery_photos);
    })
    .catch(error => {
      console.error('There was an error fetching the gallery images:', error);
    });
  };

  const handleAddAccommodation = () => {
    navigation.navigate('Farm Profile Add Accommodations');
  }

  useEffect(() => {
    fetchProfileData()
    fetchGalleryImages();
    fetchAccommodationData();
  }, [currentUser.id]);

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
        <StyledText tanColor bold style={styles.galleryPhotosNotFoundText}>
          You do not currently have any photos added to your gallery. Click on the button below to add gallery photos to your profile.
        </StyledText> 
        </View>}
        <View style={styles.addImageContainer}>
        <TouchableOpacity style={styles.addImageButton} onPress={handleGalleryImageUpload}>
          <Text style={styles.addImageText}>Upload Image To Gallery</Text>
        </TouchableOpacity>
        </View>
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
              <StyledText tanColor bold >
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
              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleAccommodationsDelete}>
                  <Text style={styles.submitButtonText}>Remove Accommodations</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          }
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
    backgroundColor: '#ECE3CE',
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
  },
  addImageButton: {
    backgroundColor: '#ECE3CE',
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

