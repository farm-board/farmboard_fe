import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Avatar from '../Profile/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import StyledText from '../Texts/StyledText'

export default function ViewEmployeeProfile() {
  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);
  const [employee, setEmployee] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Experience');

  const toggleContactModal = () => {
    setContactModalVisible(!contactModalVisible);
  };

  const route = useRoute();
  const { employeeId } = route.params;

  useEffect(() => {
    setLoading(true);
    axios.get(`https://farmboard-be-a01a77990d21.herokuapp.com/api/v1/users/${currentUser.id}/employees/${employeeId}/profile_info`)
      .then((employeeResponse) => {
        setEmployee(employeeResponse.data.attributes);
        setExperiences(employeeResponse.data.experiences);
        setReferences(employeeResponse.data.references);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the employee or experiences:', error);
        setLoading(false); // Set loading state to false in case of error
      });
  }, [currentUser.id]);

  if (loading) {
    return <Text>Loading...</Text>; // Render loading indicator
  }

  const handlePhoneCall = () => {
    Linking.openURL(`tel:${employee.phone}`);
  };

  const renderContactModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={contactModalVisible}
      onRequestClose={toggleContactModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Contact Information</Text>
          <TouchableOpacity onPress={handlePhoneCall}>
            <Text style={styles.contactInfo}>{`Phone: `}</Text>
            <Text style={styles.contactInfo}>{employee.phone}</Text>
          </TouchableOpacity>
          <Text style={styles.contactInfo}>{`Email: `}</Text>
          <Text style={styles.contactInfo}>{employee.email}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={toggleContactModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (selectedTab === 'Experience') {
      return (
        <View style={styles.subContentContainerFour}>
          <View style={styles.experienceWrapper}>
            {experiences.length === 0 ? (
              <Text style={styles.noContentText}>
                No experiences available.
              </Text>
            ) : (
              experiences
                .sort((a, b) => new Date(b.ended_at) - new Date(a.ended_at))
                .slice(0, 3)
                .map((experience, index) => (
                  <View key={index} style={[styles.experienceContainer, styles.experienceBox]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.experienceLabel}>{experience.company_name}</Text>
                    </View>
                    <Text style={styles.label}>Employment:</Text>
                    <Text style={styles.experienceCompany}>
                      <Text>{`${experience.started_at} to ${experience.ended_at}`}</Text>
                    </Text>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.experienceCompany}>
                      <Text>{experience.description}</Text>
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
                No references available.
              </Text>
            ) : (
              references
                .slice(0, 3)
                .map((reference, index) => (
                  <View key={index} style={[styles.experienceContainer, styles.experienceBox]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.experienceLabel}>{`${reference.first_name} ${reference.last_name}`}</Text>
                    </View>
                    <View style={styles.referenceContent}>
                      <Text style={styles.label}>Contact:</Text>
                      {reference.phone && (
                        <Text style={styles.referenceDetail}>Phone: {reference.phone}</Text>
                      )}
                      {reference.email && (
                        <Text style={styles.referenceDetail}>Email: {reference.email}</Text>
                      )}
                      <Text style={styles.label}>Relationship:</Text>
                      <Text style={styles.referenceDetail}>{reference.relationship}</Text>
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
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={employee.image_url} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.name}>
            <StyledText big bold tanColor style={styles.name} >
              {`${employee.first_name} ${employee.last_name}`}
            </StyledText>
          </Text>
          <Text style={styles.location}>
            <StyledText tanColor style={styles.location}>
              {`${employee.city}, ${employee.state}`}
            </StyledText>
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={toggleContactModal}>
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
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
      {contactModalVisible && renderContactModal()}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: '#4F6F52',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  contactInfo: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  contactButton: {
    backgroundColor: '#FFB900',
    borderRadius: 8,
    paddingVertical: 8,  
    paddingHorizontal: 8,  
    alignItems: 'center',
    marginTop: 10,  
  },
  contactButtonText: {
    color: '#333',
    fontSize: 14,  
    fontWeight: 'bold',
  },
});