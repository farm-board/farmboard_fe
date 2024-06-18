import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Avatar from '../Profile/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/theme';
import StyledText from '../Texts/StyledText';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmployeeProfile() {
  const navigation = useNavigation();
  const { currentUser, setUserAvatar, profileRefresh, setProfileRefresh } = useContext(UserContext);
  const [employee, setEmployee] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]); 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [expanded, setExpanded] = useState(false); 
  const [selectedTab, setSelectedTab] = useState('Experience'); // New state for toggle

  const fetchEmployeeData = async (refresh) => {
    setLoading(true);
  
    try {
      if (!refresh) {
        const cachedEmployee = await AsyncStorage.getItem('employee');
        if (cachedEmployee !== null) {
          console.log('Loaded employee data from cache');
          setEmployee(JSON.parse(cachedEmployee));
        } else {
          const employeeResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`);
          console.log('Fetched employee data from API:', employeeResponse.data.data);
          setEmployee(employeeResponse.data.data.attributes);
          await AsyncStorage.setItem('employee', JSON.stringify(employeeResponse.data.data.attributes));
        }
      } else {
        const employeeResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`);
        console.log('Refreshed employee data from API:', employeeResponse.data.data);
        setEmployee(employeeResponse.data.data.attributes);
        await AsyncStorage.setItem('employee', JSON.stringify(employeeResponse.data.data.attributes));
      }
  
      const cachedProfilePhoto = await AsyncStorage.getItem('employee_profile_photo');
      const hasFetchedProfilePhotoBefore = await AsyncStorage.getItem('hasFetchedEmployeeProfilePhoto');
  
      if (cachedProfilePhoto !== null && !refresh && hasFetchedProfilePhotoBefore === 'true') {
        console.log('Loaded profile photo from cache');
        setProfilePhoto(cachedProfilePhoto);
        setUserAvatar(cachedProfilePhoto);
      } else {
        try {
          const imageResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/image`);
          console.log('Fetched profile photo from API:', imageResponse.data.image_url);
          setProfilePhoto(imageResponse.data.image_url);
          setUserAvatar(imageResponse.data.image_url);
          await AsyncStorage.setItem('employee_profile_photo', imageResponse.data.image_url);
        } catch (error) {
          console.log('Error fetching profile photo:', error);
          setProfilePhoto(null);
          setUserAvatar(null);
          await AsyncStorage.setItem('hasFetchedEmployeeProfilePhoto', 'false'); // Set to 'false' on error
        }
        await AsyncStorage.setItem('hasFetchedEmployeeProfilePhoto', 'true'); // Set to 'true' once at the end
      }
  
      // Fetch experiences data
      const cachedExperiences = await AsyncStorage.getItem('experiences');
      if (cachedExperiences !== null && !refresh) {
        console.log('Loaded experiences data from cache');
        setExperiences(JSON.parse(cachedExperiences));
      } else {
        const experiencesResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences`);
        console.log('Fetched experiences data from API:', experiencesResponse.data.data);
        setExperiences(experiencesResponse.data.data);
        await AsyncStorage.setItem('experiences', JSON.stringify(experiencesResponse.data.data));
      }
  
      // Fetch references data
      const cachedReferences = await AsyncStorage.getItem('references');
      if (cachedReferences !== null && !refresh) {
        console.log('Loaded references data from cache');
        setReferences(JSON.parse(cachedReferences));
      } else {
        const referenceResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references`);
        console.log('Fetched references data from API:', referenceResponse.data.data);
        setReferences(referenceResponse.data.data);
        await AsyncStorage.setItem('references', JSON.stringify(referenceResponse.data.data));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  
    setLoading(false);
  };
  
  useEffect(() => {
    if (profileRefresh) {
      fetchEmployeeData(profileRefresh);
      setProfileRefresh(false);
    }
  }, [profileRefresh]); // Trigger on refresh changes
  
  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focus, profileRefresh:', profileRefresh);
      fetchEmployeeData(profileRefresh);
      if (profileRefresh) {
        setProfileRefresh(false);
        console.log('Profile data fetched and profileRefresh reset to false');
      }
    }, [profileRefresh])
  );

  if (loading) {
    return <Text>Loading...</Text>; // Render loading indicator
  }

  const onEditButtonPress = () => {
    navigation.navigate("Edit Profile");
  }

  const goToFeedScreen = () => {
    navigation.navigate('Feed'); // Navigate to the Feed screen
  }

  const renderContent = () => {
    if (selectedTab === 'Experience') {
      return (
        <View style={styles.subContentContainerFour}>
          <View style={styles.experienceWrapper}>
            {experiences.length === 0 ? (
              <Text style={styles.noContentText}>
                You have not added any work experience. To add work experience, click the edit pencil in the top right hand corner.
              </Text>
            ) : (
              experiences
                .sort((a, b) => new Date(b.attributes.ended_at) - new Date(a.attributes.ended_at))
                .slice(0, 3)
                .map((experience, index) => (
                  <View key={index} style={[styles.experienceContainer, styles.experienceBox]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.experienceLabel}>{experience.attributes.company_name}</Text>
                    </View>
                    <Text style={styles.label}>Employment:</Text>
                    <Text style={styles.experienceCompany}>
                      <Text>{`${experience.attributes.started_at} to ${experience.attributes.ended_at}`}</Text>
                    </Text>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.experienceCompany}>
                      <Text>{experience.attributes.description}</Text>
                    </Text>
                  </View>
                ))
            )}
          </View>
        </View>
      );
    } else if (selectedTab === 'References') {
      return (
        <View style={styles.subContentContainerFour}>
          <View style={styles.experienceWrapper}>
            {references.length === 0 ? (
              <Text style={styles.noContentText}>
                You have not added any references. To add references, click the edit pencil in the top right hand corner.
              </Text>
            ) : (
              references
                .slice(0, 3)
                .map((reference, index) => (
                  <View key={index} style={[styles.referenceContainer, styles.experienceBox]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.experienceLabel}>{`${reference.attributes.first_name} ${reference.attributes.last_name}`}</Text>
                    </View>
                    <View style={styles.referenceContent}>
                      <Text style={styles.label}>Contact:</Text>
                      {reference.attributes.phone && (
                        <Text style={styles.referenceDetail}>Phone: {reference.attributes.phone}</Text>
                      )}
                      {reference.attributes.email && (
                        <Text style={styles.referenceDetail}>Email: {reference.attributes.email}</Text>
                      )}
                      <Text style={styles.label}>Relationship:</Text>
                      <Text style={styles.referenceDetail}>{reference.attributes.relationship}</Text>
                    </View>
                  </View>
                ))
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSectionContainer}>
        <TouchableOpacity style={styles.editButton} onPress={onEditButtonPress}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={25}
            color="white"
          />
        </TouchableOpacity>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={profilePhoto} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.name}>
            <StyledText big tanColor style={styles.name}>
              {`${employee.first_name} ${employee.last_name}`}
            </StyledText>
          </Text>
          <Text style={styles.location}>
            <StyledText tanColor style={styles.location}>
              {`${employee.city}, ${employee.state}`}
            </StyledText>
          </Text>
        </View>
      </View>
      <View style={styles.subContentContainerTwo}>
        <StyledText big tanColor style={styles.sectionTitle}>Skills</StyledText>
        <View style={styles.skillContainer}>
          {employee.skills && employee.skills.slice(0, expanded ? employee.skills.length : 5).map((skill, index) => (
            <View key={index} style={styles.skillBubble}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        {employee.skills && employee.skills.length > 5 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreButton}>
            <Text style={styles.showMoreButtonText}>{expanded ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.subContentContainer}>
        <StyledText big tanColor style={styles.sectionTitle}>About</StyledText>
        <StyledText small tanColor style={styles.sectionText}>{employee.bio}</StyledText>
      </View>
      <View style={styles.subContentContainerThree}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, selectedTab === 'Experience' && styles.toggleButtonSelected]}
            onPress={() => setSelectedTab('Experience')}
          >
            <Text style={[styles.toggleButtonText, selectedTab === 'Experience' && styles.toggleButtonTextSelected]}>Experience</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, selectedTab === 'References' && styles.toggleButtonSelected]}
            onPress={() => setSelectedTab('References')}
          >
            <Text style={[styles.toggleButtonText, selectedTab === 'References' && styles.toggleButtonTextSelected]}>References</Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    height: '100%',
  },
  topSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 10,
  },
  rightContent: {
    flex: 3,
    marginLeft: 10,
    marginTop: 15,
  },
  avatarContainer: {
    paddingTop: 20,
    marginBottom: 5,
    alignItems: 'center',
    marginLeft: -15,
  },
  name: {
    textAlign: 'right',
    letterSpacing: 1,
    paddingBottom: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  subContentContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    backgroundColor: '#3A4D39',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    minWidth: '100%',
    paddingBottom: 15,
    marginBottom: 10,
  },
  subContentContainerTwo: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    backgroundColor: '#3A4D39',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    minWidth: '100%',
    paddingBottom: 15,
    marginBottom: 10,
  },
  subContentContainerThree: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    paddingTop: 10,
  },
  subContentContainerFour: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    paddingBottom: 15,
    marginBottom: 10,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  location: {
    textAlign: 'right',
    letterSpacing: 1,
    paddingBottom: 5,
    fontSize: 16,
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingTop: 5,
    color: 'white',
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  skillBubble: {
    backgroundColor: '#4F6F52',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showMoreButton: {
    backgroundColor: '#333',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  showMoreButtonText: {
    color: 'white',
    fontSize: 18,
  },
  experienceWrapper: {
    justifyContent: 'space-between',
  },
  experienceContainer: {
    minWidth: '100%',
    backgroundColor: '#4F6F52', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE3CE',
    marginTop: 5,
    padding: 10,
    marginBottom: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  experienceBox: {
    padding: 10,
    marginBottom: 10,
  },
  labelContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 5,
    paddingBottom: 5,
  },
  experienceLabel: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    paddingBottom: 2,
    paddingTop: 2,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    paddingBottom: 2,
    paddingTop: 2,
  },
  editButton: {
    backgroundColor: "#4F6F52",
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    right: 15,
    top: 15,
  },
  experienceCompany: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
  },
  referenceContainer: {
    minWidth: '100%',
    backgroundColor: '#4F6F52', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE3CE',
    marginTop: 5,
    padding: 10,
    marginBottom: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  referenceHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 5,
    paddingBottom: 5,
  },
  referenceName: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    paddingBottom: 2,
    paddingTop: 2,
    textAlign: 'center',
  },
  referenceContent: {
  },
  referenceLabel: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    paddingBottom: 2,
    paddingTop: 2,
  },
  referenceDetail: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
  },
  feedButton: {
    backgroundColor: colors.highlight,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#333',
    marginBottom: 10,
    marginVertical: 5,
    
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#333',
  },
  toggleButtonSelected: {
    backgroundColor: '#FFB900',
  },
  toggleButtonText: {
    fontSize: 18,
    color: 'white',
  },
  toggleButtonTextSelected: {
    fontWeight: 'bold',
    color: '#333',
  },
  noContentText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
});