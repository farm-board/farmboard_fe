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
        loop={false}
        height={width / 2}
        data={galleryImages}
        style={styles.gallery}
        mode={galleryImages.length > 1 ? "parallax" : null}
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
              <MaterialCommunityIcons name="close" size={24} color={"white"} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  gallery: {
    marginVertical: 20,
    marginTop: 20,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15, 
    padding: 10, 
    backgroundColor: "#3A4D39", 
    borderRadius: 24,
  },
  addImageButton: {
    backgroundColor: 'white',
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