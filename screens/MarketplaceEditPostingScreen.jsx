import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native'
import React, { useState, useContext, useEffect, useRef } from 'react';
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
import GalleryEdit from '../components/Feed/GalleryEdit';
import { baseUrl } from '../config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketplaceEditPostingScreen({ route }) {
  const [data, setData] = useState({
    title: '',
    price: '',
    description: '',
    condition: '',
    images: '',
  });

  const conditionList = ['New', 'Used: Like New', 'Used: Good', 'Used: Fair', 'Used: Bad'];
  const [galleryImages, setGalleryImages] = useState([]);
  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  const { currentUser, setRefresh, refresh, setProfileRefresh, profileRefresh } = useContext(UserContext);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { postingId } = route.params;
  const galleryEditRef = useRef(null);

  const handleDeletePosting = () => {
    Alert.alert(
      'Delete Posting', "Are you sure you want to delete this posting?",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}`)
            .then(response => {
              console.log('Posting deleted:', postingId);
              Alert.alert('Posting deleted');
              navigation.goBack();
              setRefresh(true);
              setProfileRefresh(true);
            })
            .catch(error => {
              console.log('Unable to delete posting', error);
            });
          }
        }
      ]
    );
  };


  const fetchPosting = (postingId) => {
    console.log('Posting ID:', postingId );
    axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}`)
    .then((postingsResponse) => {
      console.log('Posting:', postingsResponse.data.data);
      setData(postingsResponse.data.data);
    })
    .catch(error => {
      console.error("There was an error fetching the farm's postings:", error);
    });
  };

  const handleSubmit = async () => {
    // Validate fields inside data.attributes
    if (
      !data.attributes?.title || 
      !data.attributes?.price || 
      !data.attributes?.description || 
      !data.attributes?.condition
    ) {
      console.log("current user:", currentUser);
      Alert.alert('Posting Incomplete', 'All fields are required.');
      return;
    }

    if (galleryImages.length === 0) {
      Alert.alert('Photo Required', 'Please upload at least one photo to create this posting.');
      return;
    }
  
    const postData = {
      title: data.attributes.title,
      price: data.attributes.price,
      description: data.attributes.description,
      condition: data.attributes.condition,
    };
  
    try {
      let response = await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}`, { marketplace_posting: postData });
  
      setRefresh(true);
      setProfileRefresh(true);
      Alert.alert('Success', 'Posting updated successfully!');
    } catch (error) {
      console.log('Unable to update posting', error);
      Alert.alert('Error', 'An error occurred while updating the posting.');
    } finally {
      navigation.goBack(); // Navigate back after successful submission
    }
  };

  const uploadGalleryImage = async (uri) => {
    try {
      if (!postingId) {
        console.log('postingId is undefined');
        return;
      }
  
      let formData = new FormData();
      formData.append('gallery_photo', {
        uri,
        type: 'image/jpeg',
        name: `posting_${postingId}.jpg`,
      });
  
      // Upload image to Amazon S3 using postingId
      let response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/upload_gallery_photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImage = response.data; // e.g. the server returns the new image object
      setGalleryImages([...galleryImages, newImage]);
  
      console.log('Image uploaded:', response.data);
      fetchGalleryImages(true); // Optional: Refresh gallery images if needed
      setTimeout(() => {
        // Scroll to the newly added item (the last index)
        galleryEditRef.current?.scrollTo({
          index: galleryImages.length,
          animated: true,
        });
      }, 0);
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

      const galleryResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/gallery_photos`);
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
              await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/delete_gallery_photo/${photoId}`);
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
    if (postingId) {
      console.log('Fetching Posting for ID:', postingId);
      fetchPosting(postingId);
      fetchGalleryImages(true);
      setIsLoading(false);
    } else {
      console.error('postingId is undefined.');
      setIsLoading(false);
    }
  }, [postingId]);

  const { loading } = useContext(UserContext);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.backgroundContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentView}>
        <KeyboardAvoidingContainer style={styles.container} behavior="padding">
          <View style={styles.content}>
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.galleryInputContainer}>
              {Object.keys(galleryImages).length !== 0 ?
                <View style={styles.galleryContainer}>
                  <GalleryEdit
                    width={width}
                    ref={galleryEditRef}
                    key={galleryImages.length}
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
              {galleryImages.length != 6 ?
              <View style={styles.addImageContainer}>
                <TouchableOpacity style={styles.addImageButton} onPress={handleGalleryImageUpload}>
                  <Text style={styles.addImageText}>Upload Image To Posting</Text>
                </TouchableOpacity>
              </View>
              : null
              }
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
              <StyledTextInput
                placeholder="Posting Title"
                icon="clipboard-edit-outline"
                label="Posting Title:"
                value={data.attributes?.title} // Fallback to an empty string if undefined
                maxLength={45}
                labelStyle={{ fontSize: 18, color: 'white' }}
                onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, title: text } })}
              />
            </Animated.View>
            <View style={styles.paymentInfo}>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
                <StyledTextInput
                  placeholder="Price"
                  icon="currency-usd"
                  label="Price:"
                  value={data.attributes?.price}
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  keyboardType="numeric"
                  onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, price: text } })}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainerPayment}>
                <StyledSelectDropdown
                  listData={conditionList}
                  fieldPlaceholder="Condition"
                  label="Condition:"
                  value={data.attributes?.condition}
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  onSelect={(selectedItem) => setData({ ...data, attributes: { ...data.attributes, condition: selectedItem } })}
                />
              </Animated.View>
            </View>
            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
              <StyledTextInput
                placeholder="Description"
                icon="pencil-outline"
                multiline={true}
                maxLength={3000}
                label="Description:"
                value={data.attributes?.description}
                labelStyle={{ fontSize: 18, color: 'white' }}
                onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, description: text } })}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} style={styles.submitButtonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Update Posting</Text>
                <View style={styles.submitArrow}>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1600).duration(1000).springify()} style={styles.deleteButtonContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePosting}>
                <Text style={styles.deleteButtonText}>Remove Posting</Text>
                <View style={styles.deleteIcon}>
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
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
    marginBottom: -20,
    backgroundColor: '#3A4D39',
  },
  container: {
    paddingHorizontal: 10,
  },
  content: {
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
  galleryInputContainer: {
    width: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    backgroundColor: '#3A4D39',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#3A4D39',
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
    backgroundColor: '#3A4D39',
  },
  galleryPhotosNotFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  galleryPhotosNotFoundText: {
    textAlign: 'center',
    marginBottom: 60,
  },
  addImageContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  addImageButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    marginTop: -50,
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
    width: '95%',
    alignSelf: 'center',
    marginTop: 20,
  },
  contactInfoContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.6,
  },
  contactInfoDisclaimer: {
    letterSpacing: 1,
    marginVertical: 5,
    marginBottom: 10,
    fontSize: 14,
    color: '#ECE3CE',
  },
  contactInfoTitle: {
    letterSpacing: 1,
    marginVertical: 5,
    marginTop: 15,
    marginBottom: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});