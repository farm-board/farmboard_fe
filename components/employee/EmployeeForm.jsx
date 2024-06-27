import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { baseUrl } from '../../config';

export default function EmployeeForm() {
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
    phone: '',
    email: '',
    image: null,
  });

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({ ...data, skills: selectedSkills });
  };

  const navigation = useNavigation();
  const { currentUser, setSetupComplete } = useContext(UserContext);

  const validateForm = () => {
    const missingFields = [];
    if (!data.first_name) missingFields.push('First Name');
    if (!data.last_name) missingFields.push('Last Name');
    if (!data.city) missingFields.push('City');
    if (!data.state) missingFields.push('State');
    if (!data.zip_code) missingFields.push('Zip Code');
    if (!data.phone && !data.email) missingFields.push('Phone or Email');

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please fill out the following fields: ${missingFields.join(', ')} to create a profile`);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/employees`, { employee: { ...data, setup_complete: true } })
        .then(response => {
          console.log(response.data);
          setSetupComplete(true);
        })
        .catch(error => {
          console.log('Unable to register user', error);
        });
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

      // Upload image to Amazon S3
      let response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/employees/upload_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Unable to upload image', error);
    }
  };

  const fetchProfileImage = async () => {
    try {
      let response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/image`);
      setData({ ...data, image: response.data.image_url });
    } catch (error) {
      console.log('Unable to fetch profile image', error);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.Text>
          <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
            Fill in your details to get started with your Profile:
          </StyledText>
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.mb3}>
          <AvatarEdit uri={data.image} onButtonPress={() => setModalVisible(true)} style={styles.avatarEdit} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="First Name"
            icon="account-outline"
            label="First Name:"
            maxLength={25}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, first_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Last Name"
            icon="account-outline"
            label="Last Name:"
            maxLength={25}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, last_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="City"
            icon="city-variant-outline"
            label="City:"
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, city: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={states}
            fieldPlaceholder="State"
            label="State:"
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onSelect={(selectedItem) => {
              setData({ ...data, state: selectedItem });
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Zip Code"
            icon="longitude"
            label="Zip Code:"
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            keyboardType="numeric"
            maxLength={5}
            onChangeText={(text) => {
              // Ensure that only numbers are entered
              const numericText = text.replace(/[^0-9]/g, '');
              setData({...data, zip_code: numericText})
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Phone"
            icon="phone"
            label="Phone number that potential employers can contact you at:"
            maxLength={10}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            keyboardType="numeric"
            onChangeText={(text) => setData({ ...data, phone: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Email"
            icon="email"
            label="Email that potential employers can contact you at:"
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, email: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Bio"
            icon="pencil-outline"
            multiline={true}
            maxLength={255}
            label="Bio:"
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, bio: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
          <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5, fontSize: 18 }}>Relevant Skills:</Text>
          <SkillSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              Submit
            </Text>
            <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    width: '100%',
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
});
