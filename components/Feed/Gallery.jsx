import React, { useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../config/theme";
import Carousel from 'react-native-reanimated-carousel';


const Gallery = ({
  width,
  galleryImages,
  ...props
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);  // Track current index

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
        loop={false}
        width={width}
        height={width}
        data={galleryImages}
        scrollAnimationDuration={1000}
        mode={galleryImages.length > 1 ? "normal-horizontal" : null} // Set mode to null if there's only one image
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        style={styles.gallery}
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.url }} style={{width: '90%', height: '90%', borderRadius: 15, }} />
          </View>
        )}
        onSnapToItem={(index) => setCurrentIndex(index)}  // Track current index
      />
      <View style={styles.dotContainer}>
        {renderDots()}
      </View>
    </View>
  );
};


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
});

export default Gallery;