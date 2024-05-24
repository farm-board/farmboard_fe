import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Avatar from '../Profile/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/theme';
import StyledText from '../Texts/StyledText';

export default function EmployeeProfile() {
  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);
  const [employee, setEmployee] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]); 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [expanded, setExpanded] = useState(false); 
  const [selectedTab, setSelectedTab] = useState('Experience'); // New state for toggle

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
  
      try {
        // Fetch employee data
        const employeeResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`);
        setEmployee(employeeResponse.data.data.attributes);
      } catch (employeeError) {
        console.error('Error fetching employee data:', employeeError);
      }
  
      try {
        // Fetch experiences data
        const experiencesResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`);
        setExperiences(experiencesResponse.data.data);
      } catch (experiencesError) {
        console.error('Error fetching experiences data:', experiencesError);
      }
  
      try {
        // Fetch references data
        const referenceResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references`);
        setReferences(referenceResponse.data.data);
      } catch (referenceError) {
        console.error('Error fetching references data:', referenceError);
      }
  
      try {
        // Fetch profile photo
        const imageResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`);
        setProfilePhoto(imageResponse.data.image_url);
      } catch (imageError) {
        console.error('Error fetching profile photo:', imageError);
        setProfilePhoto(null); // Handle the absence of profile photo appropriately
      }
  
      setLoading(false);
    };
  
    fetchEmployeeData();
  }, [currentUser.id]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchEmployeeData = async () => {
        setLoading(true);
    
        try {
          // Fetch employee data
          const employeeResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`);
          setEmployee(employeeResponse.data.data.attributes);
        } catch (employeeError) {
          console.error('Error fetching employee data:', employeeError);
        }
    
        try {
          // Fetch experiences data
          const experiencesResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`);
          setExperiences(experiencesResponse.data.data);
        } catch (experiencesError) {
          console.error('Error fetching experiences data:', experiencesError);
        }
    
        try {
          // Fetch references data
          const referenceResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references`);
          setReferences(referenceResponse.data.data);
        } catch (referenceError) {
          console.error('Error fetching references data:', referenceError);
        }
    
        try {
          // Fetch profile photo
          const imageResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`);
          setProfilePhoto(imageResponse.data.image_url);
        } catch (imageError) {
          console.error('Error fetching profile photo:', imageError);
          setProfilePhoto(null); // Handle the absence of profile photo appropriately
        }
    
        setLoading(false);
      };
    
      fetchEmployeeData();
    }, [currentUser.id]) // Only trigger on currentUser.id changes
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
        <View style={styles.subContentContainer}>
          <View style={styles.experienceWrapper}>
            {experiences
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
              ))}
          </View>
        </View>
      );
    } else if (selectedTab === 'References') {
      return (
        <View style={styles.subContentContainer}>
          <View style={styles.experienceWrapper}>
            {references
              .slice(0, 3)
              .map((reference, index) => (
                <View key={index} style={[styles.referenceContainer, styles.experienceBox]}>
                  <View style={styles.referenceHeader}>
                    <Text style={styles.referenceName}>{`${reference.attributes.first_name} ${reference.attributes.last_name}`}</Text>
                  </View>
                  <View style={styles.referenceContent}>
                    <Text style={styles.referenceLabel}>Contact:</Text>
                    {reference.attributes.phone && (
                      <Text style={styles.referenceDetail}>Phone: {reference.attributes.phone}</Text>
                    )}
                    {reference.attributes.email && (
                      <Text style={styles.referenceDetail}>Email: {reference.attributes.email}</Text>
                    )}
                    <Text style={styles.referenceLabel}>Relationship:</Text>
                    <Text style={styles.referenceDetail}>{reference.attributes.relationship}</Text>
                  </View>
                </View>
              ))}
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
            color={colors.highlight}
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
    marginLeft: -30,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
  },
  contentContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  subContentContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    marginBottom: 5, // Add margin to the bottom of each section
  },
  subContentContainerTwo: {
    alignItems: 'flex-start',
    backgroundColor: '#3A4D39',
    minWidth: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    marginBottom: 5, 
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  location: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingTop: 10,
    color: 'white',
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
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
  referenceContainer: {
    minWidth: '100%',
    backgroundColor: '#4F6F52', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE3CE',
    marginTop: 5,
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
    textAlign: 'center',
  },
  referenceContent: {
    padding: 5,
  },
  referenceLabel: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    marginTop: 5,
  },
  referenceDetail: {
    color: 'white',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    backgroundColor: '#333',
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  toggleButtonSelected: {
    backgroundColor: '#4F6F52',
  },
  toggleButtonText: {
    fontSize: 18,
    color: 'white',
  },
  toggleButtonTextSelected: {
    fontWeight: 'bold',
    color: 'white',
  },
});



