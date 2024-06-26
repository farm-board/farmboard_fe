import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { colors } from "../../config/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import placeholder from "./../../assets/images/FarmProfilePlaceholder.png";

const AvatarEdit = ({
  uri,
  style,
  imgStyle,
  onPress,
  onButtonPress,
  aviOnly = false,
  ...props
}) => {
  return (
    <View
      style={[styles.container, { marginBottom: aviOnly ? 0 : 15 }, style]}
      {...props}
    >
      <TouchableOpacity onPress={onPress}>
        <Image
          source={uri ? { uri } : require('../../assets/images/FarmProfilePlaceholder.png')}
          style={[
            styles.image,
            aviOnly && { height: 35, width: 35, borderWidth: 0 },
            imgStyle,
          ]}
        />

        {!aviOnly && (
          <TouchableOpacity style={styles.editButton} onPress={onButtonPress}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={30}
              color={colors.accent}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
    shadowRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.2,
  },
  image: {
    borderRadius: 75,
    width: 150,
    height: 150,
    borderColor: "white",
    borderWidth: 5,
  },
  editButton: {
    backgroundColor: colors.secondary,
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    right: 5,
    bottom: 5,
  },
});

export default AvatarEdit;
