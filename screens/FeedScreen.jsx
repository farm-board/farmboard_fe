import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../contexts/UserContext';
import StyledSelectDropdown from '../components/Inputs/StyledSelectDropdown';

const FeedScreen = () => {
  const [postings, setPostings] = useState([]);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalPostingVisible, setModalPostingVisible] = useState(false);
  const [modalFilterVisible, setModalFilterVisible] = useState(false);
  const [selectedCompensationTypes, setSelectedCompensationTypes] = useState([]);
  const [selectedStateTypes, setSelectedStateTypes] = useState([]);
  const [selectedDurationTypes, setSelectedDurationTypes] = useState([]);
  const compensationTypes = ['Hourly', 'Salary'];
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();
  const durationTypes = ['Part-Time', 'Full-Time', 'Seasonal', 'Contract'];
  const stateTypes = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"];

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = () => {
    axios.get(`http://localhost:4000/api/v1/feed`)
      .then((response) => {
        setPostings(response.data.data);
        setFilteredPostings(response.data.data);
        setSearchResults(response.data.data); // Initialize search results with all postings
      })
      .catch(error => {
        console.error('There was an error fetching the postings:', error);
      });
  };

  const handleSearch = (term = searchTerm) => {
    setSearchTerm(term); // Update the search term state

    const filtered = filteredPostings.filter(posting => {
      return posting.attributes.title.toLowerCase().includes(term.toLowerCase());
    });

    setSearchResults(filtered); // Update search results state
  };

  const applyFilters = () => {
    let filtered = [...postings]; // Make a copy of the original postings array

    console.log("Initial filtered length:", filtered.length);

    if (selectedCompensationTypes.length > 0) {
      filtered = filtered.filter(posting =>
        selectedCompensationTypes.includes(posting.attributes.payment_type)
      );
      console.log("Filtered by compensation types:", filtered.length);
    }

    if (selectedStateTypes.length > 0) {
      filtered = filtered.filter(posting => {
        console.log("Selected State Types:", selectedStateTypes);
        console.log("Farm state:", posting.attributes.farm_state);
        return selectedStateTypes.includes(posting.attributes.farm_state);
      });
      console.log("Filtered by state types:", filtered.length);
    }

    if (selectedDurationTypes.length > 0) {
      filtered = filtered.filter(posting =>
        selectedDurationTypes.includes(posting.attributes.duration)
      );
      console.log("Filtered by duration types:", filtered.length);
    }

    setFilteredPostings(filtered);
    setSearchResults(filtered); // Update search results to match filtered postings
    setModalFilterVisible(false);
  };

  const clearFilters = () => {
    setSelectedCompensationTypes([]);
    setSelectedStateTypes([]);
    setSelectedDurationTypes([]);
    setSearchTerm('');
    setFilteredPostings(postings);
    setSearchResults(postings);
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
      // Check if the user has already applied to this posting
      if (selectedPosting && selectedPosting.applied) {
        alert("You have already applied to this posting.");
        return;
      }

      const response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings/${selectedPosting.id}/apply`);
      if (response.status === 200) {
        // Application submitted successfully
        alert("Application submitted successfully!");

        // Update the selectedPosting to mark it as applied
        setSelectedPosting(prevPosting => ({ ...prevPosting, applied: true }));
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

  const handleProfileRedirect = (farmId) => {
    navigation.navigate("Farm Profile View", { farmId: selectedPosting?.attributes.farm_id });
    setModalPostingVisible(false);
  }

  const renderPostingItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setSelectedPosting(item);
      setModalPostingVisible(true);
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

  const renderPostingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalPostingVisible}
      onRequestClose={() => {
        setModalPostingVisible(!modalPostingVisible);
      }}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalPostingVisible(false)}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <View style={styles.midModalTwoContainer}>
          <Text style={styles.modalTwoTitle}>Position</Text>
          <Text style={styles.modalTwoDetails}>{selectedPosting?.attributes.title}</Text>
        </View>
        <View style={styles.midModalContainer}>
          <Text style={styles.modalTitle}>Location</Text>
          <TouchableOpacity onPress={() => handleProfileRedirect(selectedPosting?.attributes.farm_id)}>
            <Text style={styles.modalDetails}>
              {selectedPosting?.attributes.farm_name}</Text>
            <Text style={styles.modalDetails}>{selectedPosting?.attributes.farm_city}, {selectedPosting?.attributes.farm_state}
            </Text>
          </TouchableOpacity>
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
        {currentUser.role_type !== 'farm' && (
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={applyToPosting}>
              <Text style={styles.submitButtonText}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.TopHeading}>Job Postings</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a job..."
          value={searchTerm}
          onChangeText={(text) => handleSearch(text)} // Use handleSearch directly
        />
        <TouchableOpacity onPress={() => setModalFilterVisible(true)}>
          <MaterialCommunityIcons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalFilterVisible}
        onRequestClose={() => {
          setModalFilterVisible(!modalFilterVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalFilterVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.filterOptionTop}>
            <Text style={styles.filterOptionLabel}>Compensation Type:</Text>
            <StyledSelectDropdown
              label=""
              value={selectedCompensationTypes}
              listData={compensationTypes}
              onSelect={(value) => setSelectedCompensationTypes(value)}
              fieldPlaceholder="Select"
            />
          </View>
          <View style={styles.filterOption}>
            <Text style={styles.filterOptionLabel}>State:</Text>
            <StyledSelectDropdown
              label=""
              value={selectedStateTypes}
              listData={stateTypes} // Provide your list of locations here
              onSelect={(value) => setSelectedStateTypes(value)}
              fieldPlaceholder="Select"
            />
          </View>
          <View style={styles.filterOption}>
            <Text style={styles.filterOptionLabel}>Duration:</Text>
            <StyledSelectDropdown
              label=""
              value={selectedDurationTypes}
              listData={durationTypes} // Provide your list of duration types here
              onSelect={(value) => setSelectedDurationTypes(value)}
              fieldPlaceholder="Select"
            />
          </View>
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={applyFilters}>
              <Text style={styles.submitButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <FlatList
        data={searchResults} // Use searchResults instead of filteredPostings
        renderItem={renderPostingItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {renderPostingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F6F52',
    padding: 20,
    paddingTop: 20,
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
    marginBottom: 5,
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
  filterOptionTop: {
    minWidth: '95%',
    marginTop: 20,
  },
  filterOption: {
    minWidth: '95%',
  },
  filterOptionLabel: {
    color: '#ECE3CE',
    fontSize: 18,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECE3CE',
    marginTop: 20,
  },
  clearFiltersButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ECE3CE',
    textAlign: 'center',
  },
});


export default FeedScreen;