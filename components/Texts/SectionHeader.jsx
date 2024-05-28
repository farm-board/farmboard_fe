import { View, StyleSheet, TouchableOpacity } from "react-native";
import StyledText from "../Texts/StyledText";

const SectionHeader = ({ children, option, style, onPress }) => {
  return (
    <View style={[styles.sectionHead, style]}>
      <StyledText bold style={styles.headText}>
        {children}
      </StyledText>
      <TouchableOpacity onPress={onPress}>
        <StyledText small style={styles.optionText}>
          {option}
        </StyledText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: "row",
    marginBottom: 20,
  },
  headText: {
    flex: 1,
    color: "white",
  },
  optionText: {
    color: "white",
  },
});

export default SectionHeader;
