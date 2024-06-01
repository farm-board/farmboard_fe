import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../contexts/UserContext';
import StyledSelectDropdown from '../components/Inputs/StyledSelectDropdown';
import Avatar from '../components/Profile/Avatar';

const FeedScreen = () => {
  const [postings, setPostings] = useState([]);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [postingProfilePhoto, setPostingProfilePhoto] = useState(null);
  const [modalPostingVisible, setModalPostingVisible] = useState(false);
  const [modalFilterVisible, setModalFilterVisible] = useState(false);
  const [selectedCompensationTypes, setSelectedCompensationTypes] = useState([]);
  const [selectedStateTypes, setSelectedStateTypes] = useState([]);
  const [selectedDurationTypes, setSelectedDurationTypes] = useState([]);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [activeTab, setActiveTab] = useState('Description');
  const [expanded, setExpanded] = useState(false);
  const [appliedPostings, setAppliedPostings] = useState(new Set());
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
  const compensationTypes = ['Hourly', 'Salary'];

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = () => {
    axios.get(`http://localhost:4000/api/v1/feed`)
      .then((response) => {
        setPostings(response.data.data);
        setFilteredPostings(response.data.data);
        setSearchResults(response.data.data); // Initialize search results with all postings
        // Fetch applied postings for the current user
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
      const response = await axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings/${selectedPosting.id}/apply`);
      if (response.status === 200) {
        alert("Application submitted successfully!");
        setAppliedPostings(prev => new Set(prev).add(selectedPosting.id));
      } else {
        alert(response.data.error || "There was an issue submitting the application.");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        alert("You have already applied to this posting.");
      } else {
        console.error("Network error:", error);
        alert("Network error occurred. Please try again later.");
      }
    }
  };

  const handleProfileRedirect = (farmId) => {
    navigation.navigate("Farm Profile View", { farmId: selectedPosting?.attributes.farm_id });
    setModalPostingVisible(false);
  }

  const fetchPostingProfileImage = (farmId) => {
    console.log('Fetching posting profile photo for farm:', farmId);
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/${farmId}/profile_info`)
      .then((response) => {
        console.log('Posting profile photo:', response.data.attributes.image_url);
        setPostingProfilePhoto(response.data.attributes.image_url);
      })
      .catch(error => {
        console.error('There was an error fetching the posting profile photo:', error);
      });
  };

  const renderPostingItem = ({ item }) => (
    <View style={styles.postingItem}>
      <View style={styles.headerContainer}>
        <View style={styles.companyLogoContainer}>
          {/* Placeholder for company logo */}
          <MaterialCommunityIcons name="barn" size={32} color="#AD110F"/>
        </View>
        <View style={styles.companyInfoContainer}>
          <Text style={styles.companyName}>{item.attributes.farm_name}</Text>
        </View>
      </View>
      <View style={styles.titleAndSalaryContainer}>
        <Text style={styles.postingTitle}>{item.attributes.title}</Text>
        <Text style={styles.postingSalary}>${item.attributes.salary} / {item.attributes.payment_type}</Text>
      </View>
      <Text style={styles.postingDescription}>
        {item.attributes.description.length > 100 
          ? item.attributes.description.substring(0, 100) + '...' 
          : item.attributes.description}
      </Text>
      <Text style={styles.postingDate}>Posted: {new Date(item.attributes.created_at).toLocaleDateString()}</Text>
      <View style={styles.locationAndButtonContainer}>
        <Text style={styles.postingLocation}>{item.attributes.farm_city}, {"\n"}{item.attributes.farm_state}</Text>
        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={() => { 
            setSelectedPosting(item); 
            setModalPostingVisible(true); 
            fetchPostingProfileImage(item.attributes.farm_id);
          }}>
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalPostingVisible}
      onRequestClose={() => {
        setModalPostingVisible(!modalPostingVisible);
        setPostingProfilePhoto(null);
      }}
    >
      <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalPostingVisible(false)}
        >
          <MaterialCommunityIcons name="close" size={25} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleProfileRedirect(selectedPosting?.attributes.farm_id)}>
          <View style={styles.logoContainer}>
            <Avatar uri={postingProfilePhoto}/>
          </View>
          <Text style={styles.modalSubTitle}>{selectedPosting?.attributes.farm_name}</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{selectedPosting?.attributes.title}</Text>
  
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>${selectedPosting?.attributes.salary} / {selectedPosting?.attributes.payment_type}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{selectedPosting?.attributes.duration}</Text>
          </View>
        </View>
  
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="timer" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{selectedPosting?.attributes.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="cash" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>Payment Type</Text>
            <Text style={styles.infoValue}>{selectedPosting?.attributes.payment_type}</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="map-marker" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{selectedPosting?.attributes.farm_city}</Text>
            <Text style={styles.infoValue}>{selectedPosting?.attributes.farm_state}</Text>
          </View>
        </View>
  
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'Description' && styles.activeToggleButton]}
            onPress={() => setActiveTab('Description')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'Description' && styles.activeToggleButtonText]}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'Required Skills' && styles.activeToggleButton]}
            onPress={() => setActiveTab('Required Skills')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'Required Skills' && styles.activeToggleButtonText]}>Required Skills</Text>
          </TouchableOpacity>
        </View>
  
        {activeTab === 'Description' ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.sectionText}>{selectedPosting?.attributes.description}</Text>
          </View>
        ) : (
          <View style={styles.skillsSectionContainer}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
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
        )}
  
        {currentUser.role_type !== 'farm' && (
          <View style={styles.applyButtonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={applyToPosting}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
              <View style={styles.applyArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
              </View>
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
        <View style={styles.filterContainer}>
          <View style={styles.filterModalContainer}>
            <View style={styles.filterHeader}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersButtonText}>Clear</Text>
              </TouchableOpacity>
              <Text style={styles.filterModalTitle}>Filter Postings</Text>
              <TouchableOpacity
                style={styles.filterCloseButton}
                onPress={() => setModalFilterVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptionTop}>
              <Text style={styles.filterOptionLabel}>Compensation Type</Text>
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
          </View>
        </View>
      </Modal>
      {searchResults.length === 0 ? (
        <Text style={styles.noResultsText}>No positions match search parameters</Text>
      ) : (
        <FlatList
          data={searchResults} // Use searchResults instead of filteredPostings
          renderItem={renderPostingItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
      {renderPostingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    padding: 20,
    backgroundColor: '#3A4D39',
    minHeight: '100%',
    alignItems: 'center',
  },
  filterModalContainer: {
    backgroundColor: '#3A4D39',
    borderRadius: 35,
    padding: 20,
    paddingBottom: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: "100%",
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  filterCloseButton: {
    backgroundColor: '#333',
    borderRadius: 30,
    padding: 10,
    alignSelf: 'flex-end',
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 30,
    padding: 10,
    top: 60,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    backgroundColor: '#333',
    fontWeight: 'bold',
    color: 'white',
    paddingTop: 25,
  },
  logoContainer: {
    marginTop: 40,
    paddingRight: 20,
    paddingTop: 20,  
    borderRadius: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  filterModalTitle: {
    fontSize: 18,
    top: 5,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#4F6F52',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin: 5,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: 'white',
  },
  infoValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggleButton: {
    backgroundColor: '#4F6F52',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
  },
  activeToggleButtonText: {
    color: 'white',
  },
  skillsSectionContainer: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  sectionContainer: {
    paddingHorizontal: 5,
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    letterSpacing: 1, 
    color: 'white',
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBubble: {
    backgroundColor: '#4F6F52',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 7,
    marginRight: 10,
  },
  skillText: {
    color: '#fff',
    fontSize: 14,
  },
  applyButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 130,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
    padding: 20,
    paddingTop: 20,
    marginBottom: -35,
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
    color: 'white',
    marginBottom: 15,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogoContainer: {
    marginRight: 10,
  },
  companyInfoContainer: {
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  titleAndSalaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  postingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  postingSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  postingDate: {
    fontSize: 12,
    color: '#999',
  },
  locationAndButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postingLocation: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  detailsButton: {
    backgroundColor: '#4F6F52',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#FFF',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    marginVertical: 10,
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
  showMoreButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  showMoreButtonText: {
    color: '#3A4D39',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    width: '100%',
    padding: 10,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: 'white',
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    top: 5,
  },
  applyArrow: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 15,
    top: 13,
  },
  noResultsText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});


export default FeedScreen;
