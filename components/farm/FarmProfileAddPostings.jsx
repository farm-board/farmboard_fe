import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import StyledSwitch from '../Inputs/StyledSwitch';
import SkillsSelect from '../skills/SkillSelect';
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';


export default function FarmProfileAddPostings() {
  const [data, setData] = useState({
    attributes: {
      title: '',
      salary: '',
      payment_type: '',
      duration: '',
      age_requirement: 0,
      offers_lodging: false,
      skill_requirements: [],
      description: '',
    }
  });

  const [accommodationData, setAccommodationData] = useState({});
  
  const durationList = [ "Full-Time", "Part-Time", "Seasonal", "Contract"];

  const paymentTypeList = [ "Hourly", "Salary"];

  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = useContext(UserContext);

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems, selectedSkills) => {
    setSelectedItems(selectedItems);
    setData({...data, attributes: { ...data.attributes, skill_requirements: selectedSkills}});
  }

  const fetchAccommodationData = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`)
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
    const postData = {
      posting: {
        attributes: { ...data.attributes }
      }
    };
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings`, postData)
    .then(response => {
      console.log(response.data);
      if (route.params.sourceStack === 'Profile') {
        navigation.navigate('Profile');
      } else if (route.params.sourceStack === 'Home') {
        navigation.navigate('Home');
      }
    })
    .catch(error => {
      console.log('Unable to add posting', error);
    })
  }

  useEffect(() => {
    fetchAccommodationData();
  }
  , []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Job Title"
            icon="account-outline"
            label="Job Title:"
            onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, title: text } })}
          />
        </Animated.View>
        <View style={styles.paymentInfo}>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
            <StyledTextInput
              placeholder="Salary"
              icon="city-variant-outline"
              label="Payment Amount:"
              keyboardType="numeric"
              onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, salary: text } })}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainerPayment}>
            <StyledSelectDropdown
              listData={paymentTypeList}
              fieldPlaceholder="Payment Type"
              label="Payment Type:"
              onSelect={(selectedItem) => {
                setData({ ...data, attributes: { ...data.attributes, payment_type: selectedItem } });
              }}
            />
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSelectDropdown
            listData={durationList}
            fieldPlaceholder="Duration"
            label="Duration:"
            onSelect={(selectedItem) => {
              setData({ ...data, attributes: { ...data.attributes, duration: selectedItem } });
            }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
           <StyledTextInput
            placeholder="Age Requirement"
            icon="longitude"
            label="Age Requirement:"
            onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, age_requirement: text } })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} >
        <Text style={{ alignSelf: 'flex-start', color: 'white', marginBottom: 5 }}>Relevant Skills:</Text>
            <SkillsSelect selectedItems={selectedItems} onSelectedItemsChange={onSelectedItemsChange} />
        </Animated.View>
        { accommodationData.housing || accommodationData.meals || accommodationData.transportation ?
          <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()}style={styles.inputContainer}>
            <StyledSwitch
              placeholder="Offers Accommodations"
              icon="home-outline"
              label="Offers Accommodations:"
              value={data.attributes.offers_lodging}
              onValueChange={(newValue) => setData({ ...data, attributes: { ...data.attributes, offers_lodging: newValue } })}
            />
            {data.attributes.offers_lodging === false ? 
              null 
              : 
              <View style={styles.accommodationsContainer}>
                <Text style={styles.accommodationTitle}>
                  <StyledText big bold style={styles.accommodationTitle}>
                    Accommodations Offered:
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small >
                    Offers Housing: {accommodationData.housing ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small >
                    Offers Meals: {accommodationData.meals ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationListItem}>
                  <StyledText small >
                    Offers Transporation: {accommodationData.transportation ? "Yes" : "No"}
                  </StyledText>
                </Text>
                <Text style={styles.accommodationDisclaimer}>
                  <Text >
                    If you would like to change these selections, please visit the edit profile page.
                  </Text>
                </Text>
              </View>
            }
          </Animated.View>
        : null}
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
        <StyledTextInput
          placeholder="Description"
          icon="pencil-outline"
          multiline={true}
          label="Description:"
          onChangeText={(text) => setData({ ...data, attributes: { ...data.attributes, description: text } })}
        />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Posting</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  );
};

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
    marginBottom: 25,
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

