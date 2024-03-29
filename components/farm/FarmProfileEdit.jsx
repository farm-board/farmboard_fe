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


export default function FarmProfileEdit() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState({
    name: '',
    state: '',
    city: '',
    zip_code: '',
    bio: '',
    image: null
  })

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`, { farm: data})
    .then(response => {
      console.log(response.data);
      navigation.push('Profile');
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

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`)
    ])
    .then(([farmResponse, imageResponse]) => {
      setData({
        ...data,
        name: farmResponse.data.data.attributes.name,
        state: farmResponse.data.data.attributes.state,
        city: farmResponse.data.data.attributes.city,
        zip_code: farmResponse.data.data.attributes.zip_code,
        bio: farmResponse.data.data.attributes.bio,
        image: imageResponse.data.image_url
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
        <Animated.Text >
          <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
            Edit your profile:
          </StyledText>
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
            <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit}/>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Name"
            icon="account-outline"
            label="Name:"
            value={data.name}
            onChangeText={(text) => setData({ ...data, name: text })}
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
          placeholder="Bio"
          icon="pencil-outline"
          multiline={true}
          label="Bio:"
          value={data.bio}
          onChangeText={(text) => setData({...data, bio: text})}
        />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
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
    paddingBottom: 25,
    paddingHorizontal: 10,
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
});

