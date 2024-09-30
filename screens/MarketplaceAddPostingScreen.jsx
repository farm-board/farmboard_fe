import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import StyledTextInput from '../components/Inputs/StyledTextInput';
import StyledText from '../components/Texts/StyledText';
import StyledSelectDropdown from '../components/Inputs/StyledSelectDropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GalleryEdit from '../components/Profile/GalleryEdit';
import { baseUrl } from '../config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketplaceAddPostingScreen() {
  const [data, setData] = useState({
    title: '',
    price: '',
    description: '',
    condition: '',
    images: ''
  });

  const conditionList = ['New', 'Used: Like New', 'Used: Good', 'Used: Fair', 'Used: Bad'];
  const [galleryImages, setGalleryImages] = useState([]);
  const [marketplacePostingId, setMarketplacePostingId] = useState('');
  const width = Dimensions.get('window').width;

  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser, setRefresh, refresh, setProfileRefresh, profileRefresh } = useContext(UserContext);

  const handleSubmit = async () => {
    if (!data.title || !data.price || !data.description || !data.condition) {
      Alert.alert('Posting Incomplete', 'All fields are required.');
      return;
    }
  
    const postData = {
      title: data.title,
      price: data.price,
      description: data.description,
      condition: data.condition,
    };
  
    try {
      // Step 3: Update the draft marketplace posting
      let response = await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}`, { marketplace_posting: postData });
  
      setRefresh(true);
      setProfileRefresh(true);
      Alert.alert('Success', 'Posting created successfully!');
    } catch (error) {
      console.log('Unable to update posting', error);
      Alert.alert('Error', 'An error occurred while creating the posting.');
    }
  };

  const uploadGalleryImage = async (uri) => {
    try {
      if (!marketplacePostingId) {
        console.log('MarketPlacePostingId is undefined');
        return;
      }
  
      let formData = new FormData();
      formData.append('gallery_photo', {
        uri,
        type: 'image/jpeg',
        name: `posting_${marketplacePostingId}.jpg`,
      });
  
      // Upload image to Amazon S3 using marketplacePostingId
      let response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}/upload_gallery_photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Image uploaded:', response.data);
      fetchGalleryImages(true); // Optional: Refresh gallery images if needed
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const fetchGalleryImages = async (refresh) => {
    try {
      const cachedGalleryImages = await AsyncStorage.getItem('posting_gallery_images');
      const hasFetchedBefore = await AsyncStorage.getItem('hasFetchedPostingGalleryImages');
      if (cachedGalleryImages !== null && !refresh && hasFetchedBefore === 'true') {
        console.log('Loaded gallery images from cache');
        setGalleryImages(JSON.parse(cachedGalleryImages));
        return;
      } else {

      const galleryResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}/gallery_photos`);
      console.log('Fetched gallery images from API:', galleryResponse.data.gallery_photos);
      setGalleryImages(galleryResponse.data.gallery_photos);
      await AsyncStorage.setItem('posting_gallery_images', JSON.stringify(galleryResponse.data.gallery_photos));
      }
      await AsyncStorage.setItem('hasFetchedPostingGalleryImages', 'true');
    } catch (error) {
      console.error('Error fetching gallery images:', error);
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

  useEffect(() => {
    const createDraftPosting = async () => {
      const postData = {
        title: data.title,
        price: data.price,
        description: data.description,
        condition: data.condition,
      };
      try {
        let response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}`, { marketplace_posting: postData });
        setMarketplacePostingId(response.data.data.id); // Save the marketplacePostingId
        console.log("marketplace posting ID:", response.data.data.id)
      } catch (error) {
        console.log('Error creating draft posting:', error);
      }
    };
  
    createDraftPosting();
  }, []);

  useEffect(() => {
    if (refresh || profileRefresh) {
      // Check the sourceStack parameter and navigate accordingly
      if (route.params.sourceStack === 'Profile') {
        navigation.navigate('Profile');
      } else if (route.params.sourceStack === 'Home') {
        navigation.navigate('Home');
      }
    }
  }, [refresh]);

  const { loading } = useContext(UserContext);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.backgroundContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentView}>
        <KeyboardAvoidingContainer style={styles.container} behavior="padding">
          <View style={styles.content}>
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
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
                  You do not currently have any photos added this posting. Click on the button below to add gallery photos to this posting.
                </StyledText> 
              </View>}
              <View style={styles.addImageContainer}>
            <TouchableOpacity style={styles.addImageButton} onPress={handleGalleryImageUpload}>
              <Text style={styles.addImageText}>Upload Image To Posting</Text>
            </TouchableOpacity>
            </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
              <StyledTextInput
                placeholder="Posting Title"
                icon="account-outline"
                label="Posting Title:"
                maxLength={45}
                labelStyle={{ fontSize: 18, color: 'white' }}
                onChangeText={(text) => setData({ ...data, title: text })}
              />
            </Animated.View>
            <View style={styles.paymentInfo}>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
                <StyledTextInput
                  placeholder="Price"
                  icon="city-variant-outline"
                  label="Price:"
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  keyboardType="numeric"
                  onChangeText={(text) => setData({ ...data, price: text })}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
                <StyledSelectDropdown
                  listData={conditionList}
                  fieldPlaceholder="Condition"
                  label="Condition:"
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  onSelect={(selectedItem) => setData({ ...data, condition: selectedItem })}
                />
              </Animated.View>
            </View>
            <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
              <StyledTextInput
                placeholder="Description"
                icon="pencil-outline"
                multiline={true}
                maxLength={3000}
                label="Description:"
                labelStyle={{ fontSize: 18, color: 'white' }}
                onChangeText={(text) => setData({ ...data, description: text })}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} style={styles.submitButtonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Create Posting</Text>
                <View style={styles.submitArrow}>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingContainer>
      </View>
    </View>  
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#3A4D39',
  },
  container: {
    paddingBottom: 25,
    paddingHorizontal: 10,
  },
  content: {
    marginTop: 25,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
  },
  contentView: {
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
  inputContainer: {
    width: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  inputContainerAccommodations: {
    width: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  deleteButtonContainer: {
    width: '100%',
    marginTop: 30,
  },
  deleteButton: {
    backgroundColor: '#FF3F3F',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  deleteIcon: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 15,
    top: 13,
  },
  submitButtonContainer: {
    width: '100%',
    marginTop: 15,
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
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainerPayment: {
    width: '48.5%',
    marginHorizontal: 5,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
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
    marginBottom: 20,
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
  galleryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '100%',
    backgroundColor: '#3A4D39',
  },
});