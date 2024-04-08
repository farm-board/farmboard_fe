import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../config/theme";
import Carousel from 'react-native-reanimated-carousel';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const GalleryEdit = ({
  width,
  galleryImages,
  handleDeleteImage,
  handleGalleryImageUpload,
  ...props
}) => {
  return (
    <View>
      <Carousel
        width={width}
        height={width / 2}
        data={galleryImages}
        style={styles.gallery}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.url }} style={{width: '100%', height: '100%' }} />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => handleDeleteImage(item.id)}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.highlight} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  gallery: {
    marginVertical: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15, 
    padding: 10, 
    backgroundColor: "#739072", 
    borderRadius: 24,
  },
  addImageButton: {
    backgroundColor: '#ECE3CE',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    width: '80%',
  },
  addImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
});

export default GalleryEdit;