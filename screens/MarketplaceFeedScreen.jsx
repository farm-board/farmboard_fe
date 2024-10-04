import React, { useState, useEffect, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Modal, ScrollView, Pressable, ActivityIndicator, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { baseUrl } from '../config';

const MarketplaceFeedScreen = () => {
  const [postings, setPostings] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [allPagesFetched, setAllPagesFetched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingNextPage, setLoadingNextPage] = useState(false);

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
        });
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
    setModalFilterVisible(false);
  };

  const handlePostingCreate = () => {
    navigation.push('Add Marketplace Posting', {sourceStack: 'Marketplace'});
  }

  const renderPostingItem = ({ item }) => (
    <View style={styles.postingItem}>
      <View style={styles.headerContainer}>
        <View style={styles.companyLogoContainer}>
        <Image
          source={item.attributes.images}
          style={[
            styles.image,
            { height: 35, width: 35, borderWidth: 0 },
          ]}
        />
        </View>
      </View>
      <View style={styles.titleAndSalaryContainer}>
        <Text style={styles.postingTitle}>{item.attributes.title}</Text>
        <Text style={styles.postingSalary}>${item.attributes.price}</Text>
      </View>
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addPostingButton} onPress={handlePostingCreate}>
        <Text style={styles.addPostingText}>Create New Marketplace Posting</Text>
      </TouchableOpacity>
      {searchResults.length === 0 ? (
        <Text style={styles.noResultsText}>No positions match search parameters</Text>
      ) : (
        <View style={styles.postingsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderPostingItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            onEndReached={fetchNextPage}
            onEndReachedThreshold={0.8}
            ListFooterComponent={ListEndLoader}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addPostingButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    minWidth: '100%',
  },
  addPostingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  image: {
    borderRadius: 75,
    width: 150,
    height: 150,
    borderColor: "white",
    borderWidth: 5,
  },
})

export default MarketplaceFeedScreen;