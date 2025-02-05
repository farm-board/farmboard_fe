import { StyleSheet, Image, View } from "react-native";
import { colors } from "../../config/theme";

const MarketplacePostingAvatar = ({
  uri,
  style,
  imgStyle,
  aviOnly = false,
  ...props
}) => {
  return (
    <View
      style={[styles.container, { marginBottom: aviOnly ? 0 : 15 }, style]}
      {...props}
    >
        <Image
          source={uri ? { uri } : require('../../assets/images/FarmProfilePlaceholder.png')}
          style={[
            styles.image,
            aviOnly && { height: 35, width: 35, borderWidth: 0 },
            imgStyle,
          ]}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  image: {
    borderRadius: 75,
    width: 75,
    height: 75,
    borderColor: "white",
    borderWidth: 5,
  },
});

export default MarketplacePostingAvatar;