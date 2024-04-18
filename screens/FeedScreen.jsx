import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../contexts/UserContext';

const FeedScreen = () => {
  const [postings, setPostings] = useState([]);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [expanded, setExpanded] = useState(false); 
  const [userId, setUserId] = useState(null);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = () => {
    axios.get(`http://localhost:4000/api/v1/feed`)
      .then((response) => {
        setPostings(response.data.data); 
        setFilteredPostings(response.data.data); 
      })
      .catch(error => {
        console.error('There was an error fetching the postings:', error);
      });
  };

  const handleSearch = (term = searchTerm) => { 
    const filtered = postings.filter(posting => {
      return (
        posting.attributes.farm_city.toLowerCase().includes(term.toLowerCase()) ||
        posting.attributes.farm_state.toLowerCase().includes(term.toLowerCase()) ||
        posting.attributes.title.toLowerCase().includes(term.toLowerCase()) ||
        posting.attributes.duration.toLowerCase().includes(term.toLowerCase()) 
      );
    });
    setFilteredPostings(filtered);
  };

  const calculateDaysAgo = (createdAt) => {
  
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - createdDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return `${differenceInDays} day(s) ago`;
  };

  const applyToPosting = async () => {
    try {
      const response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings/${selectedPosting.id}/apply`);
      if (response.status === 200) {
        // Application submitted successfully
        alert("Application submitted successfully!");
      } else {
        // Error handling for other response statuses
        console.error("Error submitting application:", response.data.error);
        alert("There was an issue submitting the application.");
      }
    } catch (error) {
      // Error handling for network errors
      console.error("Network error:", error);
      alert("Network error occurred. Please try again later.");
    }
  };

  const renderPostingItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setSelectedPosting(item);
      setModalVisible(true);
    }}>
      <View style={styles.postingItem}>
        <Text style={styles.postingTitle}>{item.attributes.title}</Text>
        <View style={styles.divider}></View>
        <Text style={styles.postingSalary}>Compensation:  
          <Text style={styles.postingSalaryAmount}> ${item.attributes.salary} / {item.attributes.payment_type}</Text>
        </Text>
        <Text style={styles.postingSalary}>Duration: {item.attributes.duration}</Text>
        <Text style={styles.postingLocation}>Location: {item.attributes.farm_city}, {item.attributes.farm_state}</Text>
        <Text style={styles.postingPosted}>Posted {calculateDaysAgo(item.attributes.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <View style={styles.midModalTwoContainer}>
      <Text style={styles.modalTwoTitle}>Position</Text>
      <Text style={styles.modalTwoDetails}>{selectedPosting?.attributes.title}</Text>
      </View>
        <View style={styles.midModalContainer}>
            <Text style={styles.modalTitle}>Location</Text>
            <Text style={styles.modalDetails}>{selectedPosting?.attributes.farm_name}</Text>
            <Text style={styles.modalDetails}>{selectedPosting?.attributes.farm_city}, {selectedPosting?.attributes.farm_state}
            </Text>
        </View>
        <View style={styles.midModalTwoContainer}>
            <Text style={styles.modalTwoTitle}>Compensation</Text>
            <Text style={styles.modalTwoDetails}>${selectedPosting?.attributes.salary} / {selectedPosting?.attributes.payment_type}</Text>
            <Text style={styles.modalTwoDetails}>{selectedPosting?.attributes.duration}</Text>
        </View>
        <View style={styles.midModalContainer}>
        <Text style={styles.modalTitle}>Required Skills</Text>
        <View style={styles.skillContainer}>
          {selectedPosting?.attributes.skill_requirements && selectedPosting?.attributes.skill_requirements.slice(0, expanded ? selectedPosting?.attributes.skill_requirements.length : 5).map((skill, index) => (
            <View key={index} style={styles.skillBubble}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        {selectedPosting?.attributes.skill_requirements && selectedPosting?.attributes.skill_requirements.length > 5 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreButton}>
            <Text style={styles.showMoreButtonText}>{expanded ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}
      </View>
        <View style={styles.midModalTwoContainer}>
            <Text style={styles.modalTwoTitle}>Job Description</Text>
            <Text style={styles.modalTwoDetails}>{selectedPosting?.attributes.description}</Text>
        </View>
        <View style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={applyToPosting}>
              <Text style={styles.submitButtonText}>
                Apply
              </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={30}
              color="#ECE3CE"
              onPress={() => navigation.push("Profile")}
            />
        </TouchableOpacity>
        <Text style={styles.TopHeading}>Job Postings</Text>
      <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by city, state, title, or duration"
        value={searchTerm}
        onChangeText={(text) => {
            setSearchTerm(text);
            handleSearch(text);
        }}
        />
      </View>
      <FlatList
        data={filteredPostings}
        renderItem={renderPostingItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F6F52',
    padding: 20,
    paddingTop: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 35,
    textAlign: 'center',
  },
  TopHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECE3CE',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  postingItem: {
    minWidth: '100%',
    padding: 10,
    backgroundColor: '#ECE3CE', 
    borderRadius: 10,
    marginBottom: 10,
  },
  postingTitle: {
    paddingBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  postingSalaryAmount: {
    fontSize: 16,
    color: '#3A4D39',
    textAlign: 'center',
  },
  postingPosted: {
    fontSize: 12,
    color: '#3A4D39',
    textAlign: 'right',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#3A4D39',
    marginBottom: 5,
  },
  filterOptions: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
  },
  filterButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  modalContainer: {
    paddingTop: 70,
    alignItems: 'center',
    backgroundColor: '#4F6F52',
    minHeight: '100%',
  },
  topModalContainer: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  midModalContainer: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    borderWidth: 5,
    borderColor: '#ECE3CE', 
    borderRadius: 20,
  },
  midModalTwoContainer: {
    backgroundColor: '#4F6F52',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4F6F52',
    marginBottom: 10,
  },
  modalDetails: {
    fontSize: 18,
    color: '#4F6F52',
    marginBottom: 5,
  },
  modalTwoTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ECE3CE',
    marginBottom: 10,
  },
  modalTwoDetails: {
    fontSize: 18,
    color: '#ECE3CE',
    marginBottom: 5,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  skillBubble: {
    backgroundColor: '#4F6F52',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#ECE3CE',
  },
  showMoreButton: {
    backgroundColor: '#ECE3CE',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  showMoreButtonText: {
    color: '#3A4D39',
    fontSize: 16,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  closeButton: {
    position: 'absolute',
    top: 37,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECE3CE',
  },
  submitButtonContainer: {
    width: '100%',
    padding: 10,
    marginBottom: 30,
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


export default FeedScreen;