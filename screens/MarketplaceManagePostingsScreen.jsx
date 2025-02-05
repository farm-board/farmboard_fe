import React, { useState, useEffect, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView, Pressable, ActivityIndicator, Dimensions, Image } from 'react-native';
import Gallery from '../components/Feed/Gallery';
import { UserContext } from '../contexts/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MarketplacePostingAvatar from '../components/Profile/MarketplacePostingAvatar';
import axios from 'axios';
import { baseUrl } from '../config';
import StyledText from '../components/Texts/StyledText'

export default function MarketplaceManagePostingsScreen() {
  const [postings, setPostings] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [allPagesFetched, setAllPagesFetched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [postingProfilePhoto, setPostingProfilePhoto] = useState(null);
  const [modalPostingVisible, setModalPostingVisible] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setAllPagesFetched(false);
      setPage(1);
      setPostings([]);
      setFilteredPostings([]);
      setSearchResults([]);
      fetchPostings(1);
    }, [])
  );

  const fetchPostings = async (refresh) => {
    try {
      // Skip the cache check when refresh is true
      if (!refresh) {
        const cachedPostings = await AsyncStorage.getItem(`marketplace_postings${currentUser.id}`);
        if (cachedPostings !== null) {
          return JSON.parse(cachedPostings);
        }
      }
  
      const postingsResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings`);
      const sortedPostings = postingsResponse.data.data.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at));
      const postingsData = { ...postingsResponse, data: { ...postingsResponse.data, data: sortedPostings } };
  
      await AsyncStorage.setItem(`marketplace_postings${currentUser.id}`, JSON.stringify(postingsData.data.data));
      console.log('Fetched user marketplace postings:', postingsData.data.data);
      setSearchResults(postingsData.data.data);
    } catch (error) {
      console.error("There was an error fetching the user's marketplace postings:", error);
    }
  };

  const fetchGalleryImages = (postingId) => {
    console.log('Fetching gallery images for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/gallery_photos`)
      .then((response) => {
        console.log('Gallery Images:', response.data.gallery_photos);
        setGalleryImages(response.data.gallery_photos);
      })
      .catch(error => {
        console.error('There was an error fetching the gallery images:', error);
      });
  };

  const fetchNextPage = () => {
    if (!loadingNextPage && !allPagesFetched) { // Add the allPagesFetched check here
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPostings(nextPage);
    }
  };

  const ListEndLoader = () => {
    if (loadingNextPage) {
      // If the next page is being loaded, render an ActivityIndicator
      return <ActivityIndicator size="large" />;
    } else {
      // Otherwise, render nothing
      return null;
    }
  };

  const handlePostingCreate = () => {
    navigation.push('Add Marketplace Posting', {sourceStack: 'Marketplace'});
  };

  const fetchPostingProfileImage = (postingId) => {
    console.log('Fetching posting profile photo for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/user_image`)
      .then((response) => {
        console.log('Posting profile photo:', response.data.image_url);
        setPostingProfilePhoto(response.data.image_url);
      })
      .catch(error => {
        console.error('There was an error fetching the posting profile photo:', error);
      });
  };

  const handleEditPosting = (postingId) => {
    setModalPostingVisible(false);
    console.log('Editing Posting:', postingId);
    navigation.push('Edit Marketplace Posting', { postingId, sourceStack: 'Marketplace' });
  };

  const renderPostingItem = ({ item }) => (
    <TouchableOpacity onPress={() => { 
      console.log('Selected Posting:', item);
      setSelectedPosting(item);
      setModalPostingVisible(true);
      fetchGalleryImages(item.id);
      fetchPostingProfileImage(item.id);
    }}>
      <View style={[styles.postingItem, { width: (screenWidth / 2) - 20 }]}>
        <Image
          source={item.attributes.images ? { uri: item.attributes.images } : require('../assets/images/FarmProfilePlaceholder.png')}
          style={[
            { width: '100%', height: 150 },
          ]}
        />
        <View style={styles.titleAndPriceContainer}>
          <Text style={styles.postingSalary}>${item.attributes.price}</Text>
          <Text style={styles.postingTitle}>
            {item.attributes.title.length > 16
            ? item.attributes.title.substring(0, 16) + '...'
            : item.attributes.title}
          </Text>
        </View>
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
        setPostingProfilePhoto(null);
      }}
    >
      <View style={styles.modalWrapper}>
        <View style={styles.editButtonBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalPostingVisible(false)}
          >
            <MaterialCommunityIcons name="arrow-left" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditPosting(selectedPosting.id)}
          >
            <StyledText style={styles.editText}>edit</StyledText>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.galleryContainer}>
            <Gallery
              width={screenWidth}
              galleryImages={galleryImages}
            />
          </View>
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{selectedPosting?.attributes.title}</Text>
            <Text style={styles.modalSubTitle}>${selectedPosting?.attributes.price}</Text>
    
            <View style={styles.separatorLine} />
    
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{selectedPosting?.attributes.description}</Text>
              </View>

            <View style={styles.separatorLine} />

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.itemRow}>
                <StyledText style={styles.conditionText}>Condition</StyledText>
                <StyledText bold style={styles.conditionText}>{selectedPosting?.attributes.condition}</StyledText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addPostingButton} onPress={handlePostingCreate}>
        <Text style={styles.addPostingText}>Create New Marketplace Posting</Text>
      </TouchableOpacity>
      {searchResults.length === 0 ? (
        <Text style={styles.noResultsText}>You do not currently have any active postings. Click the button above to create a new posting.</Text>
      ) : (
        <View>
          <Text style={styles.noResultsText}>{searchResults.length} Active Postings</Text>
          <FlatList
            data={searchResults}
            renderItem={renderPostingItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            onEndReached={fetchNextPage}
            onEndReachedThreshold={0.8}
            ListFooterComponent={ListEndLoader}
          />
        </View>
      )}
      {renderPostingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
    paddingHorizontal: 15, // Adjust for padding between items
    paddingBottom: 140,
  },
  TopHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    textAlign: 'center',
  },
  postingItem: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addPostingButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    minWidth: '100%',
  },
  deleteAllPostingsButton: {
    backgroundColor: 'red',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: '100%',
  },
  addPostingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  deleteAllPostingsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  titleAndPriceContainer: {
    padding: 10,
  },
  postingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  postingSalary: {
    fontSize: 14,
    color: '#000',
  },
  modalContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#3A4D39',
    minHeight: '100%',
    alignItems: 'flex-start', 
    justifyContent: 'flex-start',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: '#3A4D39', // Modal background
  },
  closeButton: {
    position: 'absolute',
    borderRadius: 30,
    top: 60,
    left: 20,
    zIndex: 1,
  },
  editButtonBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 105,
    backgroundColor: '#3A4D39', // Background for the close button bar
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 10, // Ensure it stays above the ScrollView
    paddingHorizontal: 20,
  },
  editButton: {
    position: 'absolute',
    borderRadius: 30,
    top: 60,
    right: 20,
    zIndex: 1,
  },
  editText: {
    color: 'white',
    fontSize: 18,
    position: 'absolute',
    top: 5,
    right: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5, // Ensure there's no unnecessary large margin here
    marginTop: -60,     // Ensure marginTop is not pushing the title down
  },
  modalContentContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  modalSubTitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionContainer: {
    marginTop: 15,
    marginBottom: 10,
    width: '100%',
  },
  sectionContainerContactInfo: {
    marginTop: 5,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 15,
    letterSpacing: 1, 
    color: 'white',
  },
  galleryContainer: {
    marginTop: 110,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'white',
    marginTop: 10,
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemRow2: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
  },
  editIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  conditionText: {
    color: 'white',
    marginTop: 5,
    fontSize: 18,
    paddingRight: 30,
  },
  contactInfoText: {
    color: 'white',
    marginTop: 2,
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
  },
  contactInfoText2: {
    color: 'white',
    marginTop: 2,
    marginRight: 90,
    fontSize: 18,
  },
  sellerInfoSectionContainer: {
    marginTop: 15,
    marginBottom: -5,
    width: '100%',
  },
  posterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterInfoTextContainer: {
    marginLeft: 10,
    marginBottom: 15,
  },
  posterInfoTextName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  posterInfoTextLocation: {
    fontSize: 18,
    color: 'white',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sellerDetailsText: {
    fontSize: 16,
    color: '#8EF9F3',
  },
  contactInfoButton: {
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  contactinfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
});
