import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import Avatar from "../Profile/Avatar";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';


export default function FarmForm() {
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


  const fetchProfileImage = async () => {
    try {
      let response = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`);
      setData({ ...data, image: response.data.image_url });
    } catch (error) {
      console.log('Unable to fetch profile image', error);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);

  return (
    <KeyboardAvoidingContainer style={{paddingTop: 10, paddingBottom: 25, paddingHorizontal: 10}}>
      <View className="flex items-center">
          <Animated.Text entering={FadeInUp.duration(1000).springify()} className="pb-10">
            <StyledText big className="text-center">
              Fill in your details to get started with your Farm Profile:
            </StyledText>
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="mb-3">
            <Avatar uri={data.image} onButtonPress={() => setModalVisible(true)} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Name"
              icon="account-outline"
              label="Name:"
              onChangeText={(text) => setData({...data, name: text})}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="City"
              icon="city-variant-outline"
              label="City:"
              onChangeText={(text) => setData({...data, city: text})}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="State"
              icon="star-box-outline"
              label="State:"
              onChangeText={(text) => setData({...data, state: text})}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="rounded-2xl w-full">
             <StyledTextInput
              placeholder="Zip Code"
              icon="longitude"
              label="Zip Code:"
              onChangeText={(text) => setData({...data, zip_code: text})}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <StyledTextInput
            placeholder="Bio"
            icon="pencil-outline"
            multiline={true}
            label="Bio:"
            onChangeText={(text) => setData({...data, bio: text})}
          />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
            <TouchableOpacity className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={handleSubmit}>
              <Text className="text-xl font-bold text-white text-center">
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

