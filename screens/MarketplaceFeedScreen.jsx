import React, { useState, useEffect, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView, Pressable, ActivityIndicator, Dimensions, Image, Linking, Alert } from 'react-native';
import Gallery from '../components/Feed/Gallery';
import { UserContext } from '../contexts/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MarketplacePostingAvatar from '../components/Profile/MarketplacePostingAvatar';
import axios from 'axios';
import { baseUrl } from '../config';
import StyledText from '../components/Texts/StyledText'
import StyledSelectDropdown from '../components/Inputs/StyledSelectDropdown';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const iosAdmobBanner = "ca-app-pub-2707002194546287/9827918081";
const iosAdmobInterstitial = "ca-app-pub-2707002194546287/7809604308";

const MarketplaceFeedScreen = () => {
  const [postings, setPostings] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [allPagesFetched, setAllPagesFetched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [postingProfilePhoto, setPostingProfilePhoto] = useState(null);
  const [modalPostingVisible, setModalPostingVisible] = useState(false);
  const [modalFilterVisible, setModalFilterVisible] = useState(false);
  const [modalNoUserVisible, setModalNoUserVisible] = useState(false);
  const [hasShownNoUserModal, setHasShownNoUserModal] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [selectedConditionTypes, setSelectedConditionTypes] = useState([]);
  const [selectedStateTypes, setSelectedStateTypes] = useState([]);
  const [selectedMinimumPrice, setSelectedMinimumPrice] = useState('');
  const [displayedMinimumPrice, setDisplayedMinimumPrice] = useState('');
  const [selectedMaximumPrice, setSelectedMaximumPrice] = useState('');
  const [displayedMaximumPrice, setDisplayedMaximumPrice] = useState('');
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const conditionTypes = ['New', 'Used: Like New', 'Used: Good', 'Used: Fair', 'Used: Bad'];

  const stateTypes = [
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
  ]

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

  const fetchPostings = (page) => {
    if (allPagesFetched) return;
    setLoadingNextPage(true)
    axios.get(`${baseUrl}/api/v1/marketplace_feed?page=${page}`)
      .then((response) => {
        if (response.data.data.length === 0) {
          setLoadingNextPage(false);
          setAllPagesFetched(true);
          return;
        }
  
        const sortedPostings = response.data.data.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at));
        setPostings(prevPostings => {
          const newPostings = [...prevPostings, ...sortedPostings];
          return newPostings.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at)); // Sort the postings again
        })
        setFilteredPostings(prevPostings => {
          const newPostings = [...prevPostings, ...sortedPostings];
          return newPostings.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at)); // Sort the filtered postings again
        });
        setSearchResults(prevPostings => {
          const newPostings = [...prevPostings, ...sortedPostings];
          return newPostings.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at)); // Sort the search results again
        });
        setLoadingNextPage(false);
      })
      .catch(error => {
        console.error('There was an error fetching the postings:', error);
        setLoadingNextPage(false);
      });
  };

  const fetchGalleryImages = (postingId, userId) => {
    console.log('Fetching gallery images for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/users/${userId}/marketplace_postings/${postingId}/gallery_photos`)
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
  
    // Filter by condition types
    if (selectedConditionTypes.length > 0) {
      filtered = filtered.filter(posting => {
        console.log("Item Condition:", posting.attributes.condition);
        return selectedConditionTypes.includes(posting.attributes.condition);
      });
      console.log("Filtered by Item Condition Types:", filtered.length);
    }
  
    // Filter by state types
    if (selectedStateTypes.length > 0) {
      filtered = filtered.filter(posting => {
        console.log("Item State:", posting.attributes.user_state);
        return selectedStateTypes.includes(posting.attributes.user_state);
      });
      console.log("Filtered by Item State Types:", filtered.length);
    }
  
    // Filter by minimum price
    if (selectedMinimumPrice !== '') {
      const minPrice = parseFloat(selectedMinimumPrice); // Convert to float
      filtered = filtered.filter(posting => {
        const itemPrice = parseFloat(posting.attributes.price); // Convert item price to float
        console.log("Item Price:", itemPrice, "Min Price:", minPrice);
        return itemPrice >= minPrice; // Include items with price >= min price
      });
      console.log("Filtered by an Item's Minimum Price:", filtered.length);
    }
  
    // Filter by maximum price
    if (selectedMaximumPrice !== '') {
      const maxPrice = parseFloat(selectedMaximumPrice); // Convert to float
      filtered = filtered.filter(posting => {
        const itemPrice = parseFloat(posting.attributes.price); // Convert item price to float
        console.log("Item Price:", itemPrice, "Max Price:", maxPrice);
        return itemPrice <= maxPrice; // Include items with price <= max price
      });
      console.log("Filtered by an Item's Maximum Price:", filtered.length);
    }
  
    setFilteredPostings(filtered); // Update the filtered postings
    setSearchResults(filtered); // Update search results to match filtered postings
    setModalFilterVisible(false); // Close the modal
  };

  const clearFilters = () => {
    setSelectedMaximumPrice('');
    setSelectedMinimumPrice('');
    setSelectedConditionTypes([]);
    setSelectedStateTypes([]);
    setSearchTerm('');
    setFilteredPostings(postings);
    setSearchResults(postings);
    setModalFilterVisible(false);
  };

  const handlePostingCreate = () => {
    navigation.push('Add Marketplace Posting', {sourceStack: 'Marketplace'});
  }

  const handleManagePostingsRedirect = () => {
    navigation.push('Manage Marketplace Postings', {sourceStack: 'Marketplace'});
  }

  const fetchPostingProfileImage = (postingId) => {
    console.log('Fetching posting profile photo for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/marketplace_postings/${postingId}/user_image`)
      .then((response) => {
        console.log('Posting profile photo:', response.data.image_url);
        setPostingProfilePhoto(response.data.image_url);
      })
      .catch(error => {
        console.error('There was an error fetching the posting profile photo:', error);
      });
  };

  const formatPrice = (value) => {
    if (!value) return '';
    // Split value into integer and decimal parts
    const [integer, decimal] = value.split('.');
    const formattedInteger = new Intl.NumberFormat('en-US').format(integer);
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger; // Add back the decimal part if it exists
  };

  const handlePriceChange = (text, type) => {
    // Allow only numeric values and at most one decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    const validValue = numericValue.split('.').length <= 2 ? numericValue : numericValue.slice(0, -1);

    // Format the number with commas and decimals
    const formattedValue = formatPrice(validValue);

    if (type === 'min') {
      setSelectedMinimumPrice(validValue); // Save raw numeric value for min
      setDisplayedMinimumPrice(validValue ? `$ ${formattedValue}` : ''); // Add '$' for display with commas and decimals
    } else if (type === 'max') {
      setSelectedMaximumPrice(validValue); // Save raw numeric value for max
      setDisplayedMaximumPrice(validValue ? `$ ${formattedValue}` : ''); // Add '$' for display with commas and decimals
    }
  };

  const renderPostingItem = ({ item }) => (
    <TouchableOpacity onPress={() => { 
      console.log('Selected Posting:', item);
      setSelectedPosting(item);
      setModalPostingVisible(true);
      fetchGalleryImages(item.id, item.attributes.user_id);
      fetchPostingProfileImage(item.id, item.attributes.user_id);
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

  const handleProfileRedirect = (marketplacePostingId) => {
    navigation.navigate("Marketplace Profile View", { marketplacePostingId: selectedPosting?.id });
    setModalPostingVisible(false);
  }

  const InlineAd = () => {
    return (
      <View style={{ height: isAdLoaded ? 'auto' : 0, alignItems: 'center', justifyContent: 'space-evenly', paddingTop: 10 }}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : iosAdmobBanner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['Agriculture', 'Farming', 'Crops', 'Livestock', 'Farm Equipment', 'Tractors', 'Irrigation', 'Seeds', 'Harvesting', 'Rural Life', 'Farm Supplies', 'Farm Finance', 'Dairy Farming', 'Poultry Farming'],
          networkExtras: {
            collapsible: 'bottom',
          },
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
        
      />
    </View>
    );
  };

  
const handlePhoneCall = () => {
  Alert.alert(
    "Open Phone App",
    `You will be taken out of the app to call ${selectedPosting?.attributes.user_phone}. Do you want to continue?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => {
          Linking.openURL(`tel:${selectedPosting?.attributes.user_phone}`).catch((err) =>
            console.warn('Failed to open phone app:', err)
          );
        },
      },
    ]
  );
};

const handleEmail = () => {
  Alert.alert(
    "Open Email App",
    `You will be taken out of the app to send an email to ${selectedPosting?.attributes.user_email}. Do you want to continue?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => {
          Linking.openURL(`mailto:${selectedPosting?.attributes.user_email}`).catch((err) =>
            console.warn('Failed to open email app:', err)
          );
        },
      },
    ]
  );
};

  const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : iosAdmobInterstitial;
  const [loaded, setLoaded] = useState(false);
  const [interstitial, setInterstitial] = useState(null);
  const [adShown, setAdShown] = useState(false);

  useEffect(() => {
    const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      keywords: ['Agriculture', 'Farming', 'Crops', 'Livestock', 'Farm Equipment', 'Tractors', 'Irrigation', 'Seeds', 'Harvesting', 'Rural Life', 'Farm Supplies', 'Farm Finance', 'Dairy Farming', 'Poultry Farming'],
      requestNonPersonalizedAdsOnly: true,
    });

    setInterstitial(interstitialAd);

    const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      setLoaded(true);
    });

    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      setLoaded(false);
      interstitialAd.load(); // Load a new ad after the current one is closed
    });

    interstitialAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [adUnitId]);

  const handleAdShow = async () => {
    if (interstitial && loaded && !adShown) {
      try {
        const lastShown = await AsyncStorage.getItem('lastAdShown');
        const now = Date.now();
        if (!lastShown || (now - parseInt(lastShown, 10)) > 15 * 60 * 1000) {
          interstitial.show().then(() => {
            console.log('Interstitial ad shown');
            setAdShown(true); // Mark the ad as shown
            AsyncStorage.setItem('lastAdShown', now.toString()); // Store the current time
          }).catch((error) => {
            console.error('Failed to show interstitial ad', error);
          });
        } else {
          console.log('Ad shown less than 15 minutes ago');
        }
      } catch (error) {
        console.error('Error accessing AsyncStorage', error);
      }
    } else {
      console.log('Interstitial ad not loaded yet or already shown');
    }
  };

  // Uncomment this if you want to show the full screen ad when the screen is focused

  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log('Screen focused, resetting adShown');
  //     setAdShown(false); // Reset adShown when the screen is focused
  //     // Run handleAdShow immediately when screen is focused
  //     handleAdShow();
  //   }, [loaded]) // Add loaded to dependencies
  // );

  // useEffect(() => {
  //   if (!adShown) {
  //     const timeoutId = setTimeout(() => {
  //       handleAdShow();
  //     }, 1000); // Check once after 1 second

  //     return () => clearTimeout(timeoutId); // Cleanup the timeout on unmount
  //   }
  // }, [loaded, adShown]); // Run when `loaded` or `adShown` changes

  useEffect(() => {
    if (!currentUser && !hasShownNoUserModal) {
      setModalNoUserVisible(true);
      setHasShownNoUserModal(true);
    }
  }, [currentUser, hasShownNoUserModal]);

  const renderNoUserModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalNoUserVisible}
      onRequestClose={() => {
        setModalNoUserVisible(false);
      }}
    >
      <View style={styles.noUserModalContainer}>
        <View style={styles.noUserModalView}>
          <Text style={styles.noUserModalTitle}>Login or sign up to access all features.</Text>
          <Text style={styles.modalDescription}>Please login or create an account to unlock full access to the application. As a guest, you can browse existing job and marketplace postings, but you won’t be able to create or apply to listings, manage marketplace items, or view detailed contact information.  </Text>
          <TouchableOpacity style={styles.noUserModalLoginButton} onPress={() => {navigation.navigate('Login'); setModalNoUserVisible(false)}}>
            <Text style={styles.noUserModalLoginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noUserModalButton} onPress={() => setModalNoUserVisible(false)}>
            <Text style={styles.noUserModalButtonText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
      {/* Top-level container */}
      <View style={styles.modalWrapper}>
        {/* Fixed close button bar */}
        <View style={styles.closeButtonBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalPostingVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={35} color="white" />
          </TouchableOpacity>
        </View>
  
        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={styles.modalContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.galleryContainer}>
            <Gallery width={screenWidth} galleryImages={galleryImages} />
          </View>
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{selectedPosting?.attributes.title}</Text>
            <Text style={styles.modalSubTitle}>${selectedPosting?.attributes.price}</Text>
  
            <View style={styles.separatorLine} />
            {/* Seller Info */}
            <View style={styles.sellerInfoSectionContainer}>
              <View style={styles.rowContainer}>
                <Text style={styles.sectionTitle2}>Seller Information</Text>
                {currentUser ?
                <TouchableOpacity onPress={() => handleProfileRedirect(selectedPosting?.id)}>
                  <Text style={styles.sellerDetailsText}>Seller Profile</Text>
                </TouchableOpacity>
                : 
                <TouchableOpacity onPress={() => {setModalNoUserVisible(true); setModalPostingVisible(false)}}>
                  <Text style={styles.sellerDetailsText}>Seller Profile</Text>
                </TouchableOpacity>
                }
              </View>
              <View style={styles.posterInfoContainer}>
                <MarketplacePostingAvatar uri={postingProfilePhoto} />
                <View style={styles.posterInfoTextContainer}>
                  <Text style={styles.posterInfoTextName}>
                    {selectedPosting?.attributes.user_name}
                  </Text>
                  <Text style={styles.posterInfoTextLocation}>
                    {selectedPosting?.attributes.user_city},{' '}
                    {selectedPosting?.attributes.user_state}
                  </Text>
                </View>
              </View>
            </View>
  
            {/* Contact Info */}
            {currentUser ? 
            <View style={styles.sectionContainerContactInfo}>
              {selectedPosting?.attributes.user_email && (
                <TouchableOpacity onPress={handleEmail}>
                  <View style={styles.itemRow}>
                    <MaterialCommunityIcons name="email" size={25} color="white" />
                    <StyledText bold style={styles.contactInfoText}>
                      Email:
                    </StyledText>
                    <StyledText style={styles.contactInfoText2}>
                      {selectedPosting?.attributes.user_email}
                    </StyledText>
                  </View>
                </TouchableOpacity>
              )}
              {selectedPosting?.attributes.user_phone && (
                <TouchableOpacity onPress={handlePhoneCall}>
                  <View style={styles.itemRow2}>
                    <MaterialCommunityIcons name="phone" size={25} color="white" />
                    <StyledText bold style={styles.contactInfoText}>
                      Phone:
                    </StyledText>
                    <StyledText style={styles.contactInfoText2}>
                      {selectedPosting?.attributes.user_phone}
                    </StyledText>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            : null }
            <View style={styles.separatorLine} />
  
            {/* Description */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>
                {selectedPosting?.attributes.description}
              </Text>
            </View>
  
            <View style={styles.separatorLine} />
  
            {/* Details */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.itemRow}>
                <StyledText style={styles.conditionText}>Condition</StyledText>
                <StyledText bold style={styles.conditionText}>
                  {selectedPosting?.attributes.condition}
                </StyledText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      {/* <InlineAd /> */}
      <View style={styles.itemRow3}>
        {currentUser ?
        <TouchableOpacity style={styles.addPostingButton} onPress={handleManagePostingsRedirect}>
          <Text style={styles.addPostingText}>Manage Postings</Text>
        </TouchableOpacity>
        :
        <TouchableOpacity style={styles.addPostingButton} onPress={() => setModalNoUserVisible(true)}>
          <Text style={styles.addPostingText}>Manage Postings</Text>
        </TouchableOpacity>
        }
        {currentUser ?
        <TouchableOpacity style={styles.deleteAllPostingsButton} onPress={handlePostingCreate}>
          <Text style={styles.deleteAllPostingsText}>Sell Item</Text>
        </TouchableOpacity>
        :
        <TouchableOpacity style={styles.deleteAllPostingsButton} onPress={() => setModalNoUserVisible(true)}>
          <Text style={styles.deleteAllPostingsText}>Sell Item</Text>
        </TouchableOpacity>
        }
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an Item..."
          value={searchTerm}
          onChangeText={(text) => handleSearch(text)} // Use handleSearch directly
        />
        <TouchableOpacity onPress={() => setModalFilterVisible(true)}>
          <MaterialCommunityIcons name="filter" size={32} color="white" />
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
              <Text style={styles.filterOptionLabel}>Price</Text>
              <View style={styles.priceItemRow}>
                <TextInput
                  style={styles.priceInputLeft}
                  placeholder="Min Price"
                  keyboardType="numeric"
                  value={displayedMinimumPrice} // Display formatted min price
                  onChangeText={(text) => handlePriceChange(text, 'min')} // Handle min price changes
                />
                <TextInput
                  style={styles.priceInputRight}
                  placeholder="Max Price"
                  keyboardType="numeric"
                  value={displayedMaximumPrice} // Display formatted max price
                  onChangeText={(text) => handlePriceChange(text, 'max')} // Handle max price changes
                />
              </View>
            </View>
            <View style={styles.filterOption}>
              <Text style={styles.filterOptionLabel}>Item Condition</Text>
              <StyledSelectDropdown
                label=""
                value={selectedConditionTypes}
                listData={conditionTypes}
                onSelect={(value) => setSelectedConditionTypes(value)}
                fieldPlaceholder="Select"
              />
            </View>
            <View style={styles.filterOption}>
              <Text style={styles.filterOptionLabel}>Location By State</Text>
              <StyledSelectDropdown
                label=""
                value={selectedStateTypes}
                listData={stateTypes}
                onSelect={(value) => setSelectedStateTypes(value)}
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
        <Text style={styles.noResultsText}>No postings match the search parameters...</Text>
      ) : (
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
      )}
      {renderPostingModal()}
      {renderNoUserModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
    paddingHorizontal: 15, // Adjust for padding between items
  },
  postingItem: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addPostingButton: {
    backgroundColor: 'white',
    alignSelf: 'start',
    padding: 10,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    minWidth: '48.5%',
  },
  deleteAllPostingsButton: {
    backgroundColor: '#ffb900',
    alignSelf: 'end',
    padding: 10,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    minWidth: '48.5%',
  },
  addPostingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  deleteAllPostingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  modalWrapper: {
    flex: 1,
    backgroundColor: '#3A4D39', // Modal background
  },
  closeButtonBar: {
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
  closeButton: {
    borderRadius: 30,
    top: 20,
    zIndex: 1, // Ensure the button is above everything
  },
  modalContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#3A4D39',
    minHeight: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5, // Ensure there's no unnecessary large margin here
    marginTop: -60,     // Ensure marginTop is not pushing the title down
  },
  noUserModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
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
  itemRow3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
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
    marginHorizontal: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginRight: 10,
  },
  priceInputLeft: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    fontSize: 20,
    marginRight: 10,
  },
  priceInputRight: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    fontSize: 20,
  },
  filterContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  filterOptionTop: {
    minWidth: '95%',
    marginTop: 10,
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
  filterModalTitle: {
    fontSize: 18,
    top: 5,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
  noUserModalContainer: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  noUserModalView: {
    borderRadius: 15,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#3A4D39',
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: "100%",
  },
  noUserModalLoginButton: {
    backgroundColor: '#ffb900',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 50,
    margin: 10,
    borderRadius: 50,
    width: '90%',
  },
  noUserModalLoginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  noUserModalButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 50,
    margin: 10,
    borderRadius: 50,
    width: '90%',
  },
  noUserModalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  noUserModalButtonArrow: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 10,
    top: 6,
  },
});

export default MarketplaceFeedScreen;