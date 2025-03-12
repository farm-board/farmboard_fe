import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../config/theme";
import Carousel from 'react-native-reanimated-carousel';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const GalleryEdit = forwardRef(({
  width,
  galleryImages,
  handleDeleteImage,
  handleGalleryImageUpload,
  ...props
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local ref to the Carousel itself
  const carouselRef = useRef(null);

  // Expose methods for the parent via the 'ref'
  useImperativeHandle(ref, () => ({
    scrollTo({ index, animated = true }) {
      // Call the Carousel's scroll method if it exists
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ index, animated });
      }
    },
  }));

  const renderDots = () => {
    return galleryImages.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          currentIndex === index ? styles.activeDot : styles.inactiveDot
        ]}
      />
    ));
  };

  return (
    <View>
      <Carousel
        // Attach the local carouselRef
        ref={carouselRef}

        key={galleryImages.length}
        data={galleryImages}
        loop={false}
        width={width}
        height={width}
        scrollAnimationDuration={1000}
        mode={galleryImages.length > 1 ? "normal-horizontal" : null}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        style={styles.gallery}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View>
            <Image
              source={{ uri: item.url }}
              style={{ width: '90%', height: '90%', borderRadius: 15 }}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => handleDeleteImage(item.id)}
            >
              <MaterialCommunityIcons name="close-thick" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.dotContainer}>
        {renderDots()}
      </View>
    </View>
  );
});


const styles = StyleSheet.create({
  gallery: {
  },
  dotContainer: {
    position: 'absolute',
    bottom: 85, // Adjust as needed
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 55, 
    padding: 10, 
    backgroundColor: "#3A4D39", 
    borderRadius: 24,
  },
});

export default GalleryEdit;