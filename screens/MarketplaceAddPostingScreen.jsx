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
    images: '',
    phone: '',
    email: '',
  });
  const conditionList = ['New', 'Used: Like New', 'Used: Good', 'Used: Fair', 'Used: Bad'];
  const [galleryImages, setGalleryImages] = useState([]);
  const [marketplacePostingId, setMarketplacePostingId] = useState('');
  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  const route = useRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, setRefresh, refresh, setProfileRefresh, profileRefresh } = useContext(UserContext);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true); 

  const handleDeletePosting = async () => {
    if (marketplacePostingId) {
      try {
        await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}`);
        console.log('Posting deleted successfully');
      } catch (error) {
        console.error('Error deleting posting:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    console.log('userData:', userData);
  }, []);

  useEffect(() => {
    // Listen to `beforeRemove` event
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isSubmitting) {
        // If form is being submitted, allow the default behavior (i.e., don't show the discard alert)
        return;
      }
  
      if (marketplacePostingId) {
        // Prevent default behavior of leaving the screen
        e.preventDefault();
  
        // Ask the user if they want to delete the draft
        Alert.alert(
          'Discard Posting?',
          'Do you want to discard this posting?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: async () => {
                await handleDeletePosting();
                // After deletion, navigate back
                navigation.dispatch(e.data.action);
              }
            }
          ]
        );
      }
    });
  
    return unsubscribe; // Cleanup the event listener on unmount
  }, [navigation, isSubmitting, marketplacePostingId]);

  const fetchUserData = async () => {
    try {
      if (currentUser.role_type === 'employee') {
        const response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`);
        console.log('User data:', response.data.data);
        setUserData(response.data.data);
      } else if (currentUser.role_type === 'farm') {
        const response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
        console.log('User data:', response.data.data);
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false); // Ensure loading state is cleared
    }
  };

  const handleSubmit = async () => {
    if (!data.title || !data.price || !data.description || !data.condition) {
      console.log("current user:", currentUser)
      Alert.alert('Posting Incomplete', 'All fields are required.');
      return;
    }

    if (userData.marketplace_phone === null && !data.phone || userData.marketplace_email === null && !data.email) {
      Alert.alert('Contact Info Required', 'Please provide a phone number or email address.');
      return;
    }
  
    setIsSubmitting(true); // Set form submission state to true
  
    const postData = {
      title: data.title,
      price: data.price,
      description: data.description,
      condition: data.condition,
    };

    const contactData = {
      marketplace_phone: data.phone,
      marketplace_email: data.email,
    };

    try {
      if (userData.type === 'employee') {
        await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/employees`, { employee: contactData });
      }
      if (userData.type === 'farm') {
        await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/farms`, { farm: contactData });
      }

      let response = await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}`, { marketplace_posting: postData });
  
      setRefresh(true);
      setProfileRefresh(true);
      Alert.alert('Success', 'Posting created successfully!');
    } catch (error) {
      console.log('Unable to update posting', error);
      Alert.alert('Error', 'An error occurred while creating the posting.');
    } finally {
      setIsSubmitting(false); // Reset form submission state after submission
      navigation.goBack(); // Navigate back after successful submission
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
              await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}/delete_gallery_photo/${photoId}`);
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

  const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

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
                    width={width / 1.05}
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
                  icon="currency-usd"
                  label="Price:"
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  keyboardType="numeric"
                  onChangeText={(text) => setData({ ...data, price: text })}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainerPayment}>
                <StyledSelectDropdown
                  listData={conditionList}
                  fieldPlaceholder="Condition"
                  label="Condition:"
                  labelStyle={{ fontSize: 18, color: 'white' }}
                  onSelect={(selectedItem) => setData({ ...data, condition: selectedItem })}
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
                labelStyle={{ fontSize: 18, color: 'white' }}
                onChangeText={(text) => setData({ ...data, description: text })}
              />
            </Animated.View>
            {userData.attributes.marketplace_phone === null || userData.attributes.marketplace_email === null ?
              <>
                <Animated.View
                  entering={FadeInDown.delay(800).duration(1000).springify()}
                  style={styles.contactInfoContainer}
                >
                  <Text style={styles.contactInfoTitle}>
                    One of the following contact methods is required to create a posting:
                  </Text>
                  <StyledTextInput
                    placeholder="Phone"
                    icon="phone"
                    label="Phone:"
                    maxLength={14} // Adjust max length for formatted phone number
                    labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
                    keyboardType="numeric"
                    onChangeText={(text) => setData({ ...data, phone: formatPhoneNumber(text) })}
                  />
                  <StyledTextInput
                    placeholder="Email"
                    icon="email"
                    label="Email:"
                    labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
                    onChangeText={(text) => setData({ ...data, email: text })}
                  />
                  <Text style={styles.contactInfoDisclaimer}>
                    This will only need to be added once, but can be updated at any time in your profile settings.
                  </Text>
                </Animated.View>
              </>
              : null}
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
    marginBottom: -20,
    backgroundColor: '#3A4D39',
  },
  container: {
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
  galleryInputContainer: {
    width: '100%',
    marginBottom: 20,
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
  },
  addImageContainer: {
    width: '100%',
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
  galleryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '75%',
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