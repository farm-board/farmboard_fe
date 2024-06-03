import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../config/theme";
import Carousel from 'react-native-reanimated-carousel';


const Gallery = ({
  width,
  galleryImages,
  ...props
}) => {
  return (
    <View>
      <Carousel
        loop={false}
        width={width}
        height={width / 2}
        data={galleryImages}
        scrollAnimationDuration={1000}
        mode={galleryImages.length > 1 ? "parallax" : null} // Set mode to null if there's only one image
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        style={styles.gallery}
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.url }} style={{width: '100%', height: '100%' }} />
          </View>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  gallery: {
    
  },
});

export default Gallery;