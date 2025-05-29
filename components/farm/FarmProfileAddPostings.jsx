import React, { useState, useContext, useEffect } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from '../Containers/KeyboardAvoidingContainer';
import StyledTextInput from '../Inputs/StyledTextInput';
import StyledText from '../Texts/StyledText';
import StyledSwitch from '../Inputs/StyledSwitch';
import SkillsSelect from '../skills/SkillSelect';
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';

export default function FarmProfileAddPostings() {
  const [data, setData] = useState({
    title: '',
    salary: '',
    payment_type: '',
    duration: '',
    age_requirement: 0,
    offers_lodging: false,
    skill_requirements: [],
    description: '',
  });

  const [accommodationData, setAccommodationData] = useState({});
  
  const durationList = ['Full-Time', 'Part-Time', 'Seasonal', 'Contract'];
  const paymentTypeList = ['Hourly', 'Daily', 'Weeky', 'Monthly', 'Salary'];

  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser, setRefresh, refresh, setProfileRefresh, profileRefresh } = useContext(UserContext);

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({ ...data, skill_requirements: selectedSkills });
  };

  const fetchAccommodationData = () => {
    axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/accommodation`)
      .then((accommodationResponse) => {
        if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
          setAccommodationData(accommodationResponse.data.data.attributes);
        } else {
          console.log('No accommodations found for this farm.');
        }
      })
      .catch(error => {
        console.error('There was an error fetching the accommodations:', error);
      });
  };

  const handleSubmit = () => {
    // ----- client‑side completeness checks -----
    if (!data.title) {
      Alert.alert('Posting Incomplete', 'A Job Title is required for this Posting.');
      return;
    }
    if (!data.salary) {
      Alert.alert('Posting Incomplete', 'A Payment Amount is required for this Posting.');
      return;
    }
    if (!data.payment_type) {
      Alert.alert('Posting Incomplete', 'A Payment Type is required for this Posting.');
      return;
    }
    if (!data.duration) {
      Alert.alert('Posting Incomplete', 'A Duration is required for this Posting.');
      return;
    }
    if (!data.skill_requirements || data.skill_requirements.length === 0) {
      Alert.alert('Posting Incomplete', 'Skill Requirements are required for this Posting.');
      return;
    }
    if (!data.description) {
      Alert.alert('Posting Incomplete', 'A Description is required for this Posting.');
      return;
    }
  
    // ----- build the payload -----
    const postData = {
      title:             data.title,
      salary:            data.salary,
      payment_type:      data.payment_type,
      duration:          data.duration,
      age_requirement:   data.age_requirement,
      offers_lodging:    data.offers_lodging,
      skill_requirements:data.skill_requirements,
      description:       data.description,
    };
  
    // ----- send it -----
    axios
      .post(`${baseUrl}/api/v1/users/${currentUser.id}/farms/postings`, { posting: postData })
      .then(response => {
        console.log(response.data);
        setRefresh(true);
        setProfileRefresh(true);
        // you might want to navigate away or clear the form here
      })
      .catch(error => {
        if (
          error.response &&
          error.response.status === 422 &&
          Array.isArray(error.response.data?.errors)
        ) {
          const messages = error.response.data.errors;
          const containsProfanity = messages.some(m =>
            m.toLowerCase().includes('prohibited word')
          );
  
          Alert.alert(
            containsProfanity ? 'Prohibited Language' : 'Validation Error',
            messages[0],            // or messages.join('\n') for all
          );
        } else {
          console.log('Unable to update posting', error);
          Alert.alert('Error', 'Unable to update posting. Please try again.');
        }
      });
  };

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

  useEffect(() => {
    fetchAccommodationData();
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Job Title"
            icon="clipboard-edit-outline"
            label="Job Title:"
            maxLength={45}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, title: text })}
          />
        </Animated.View>
        <View style={styles.paymentInfo}>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
            <StyledTextInput
              placeholder="Amount"
              icon="currency-usd"
              label="Payment Amount:"
              labelStyle={{ fontSize: 18, color: 'white' }}
              keyboardType="numeric"
              onChangeText={(text) => setData({ ...data, salary: text })}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
            <StyledSelectDropdown
              listData={paymentTypeList}
              fieldPlaceholder="Payment Type"
              label="Payment Type:"
              labelStyle={{ fontSize: 18, color: 'white' }}
              onSelect={(selectedItem) => setData({ ...data, payment_type: selectedItem })}
            />
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={durationList}
            fieldPlaceholder="Duration"
            label="Duration:"
            onSelect={(selectedItem) => setData({ ...data, duration: selectedItem })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}>
          <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 10, fontSize: 18 }}>Relevant Skills:</Text>
          <SkillsSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
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
        {accommodationData.housing || accommodationData.meals || accommodationData.transportation ?
          <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.inputContainer}>
            <StyledSwitch
              placeholder="Offers Accommodations"
              icon="home-outline"
              label="Offers Accommodations:"
              value={data.offers_lodging}
              onValueChange={(newValue) => setData({ ...data, offers_lodging: newValue })}
            />
            {data.offers_lodging === false ?
              null
              :
              <View style={styles.accommodationsContainer}>
                <Text style={styles.accommodationTitle}>
                  <StyledText big bold style={styles.accommodationTitle}>
                    Accommodations Offered:
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small>
                    Offers Housing: {accommodationData.housing ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small>
                    Offers Meals: {accommodationData.meals ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small>
                    Offers Transportation: {accommodationData.transportation ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationDisclaimer}>
                  <Text>
                    If you would like to change these selections, please visit the edit profile page.
                  </Text>
                </Text>
              </View>
            }
          </Animated.View>
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
  );
}

const styles = StyleSheet.create({
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
  accommodationsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 30,
    backgroundColor: '#4F6F52',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  accommodationTitle: {
    letterSpacing: 1,
    fontSize: 15,
    paddingBottom: 5,
  },
  accommodationListItem: {
    letterSpacing: 1,
    marginVertical: 5,
    fontSize: 13,
  },
  accommodationDisclaimer: {
    letterSpacing: 1,
    marginVertical: 5,
    marginTop: 15,
    fontSize: 12,
    color: '#ECE3CE',
  },
});

