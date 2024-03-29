import { useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { colors } from "../../config/theme";
import StyledText from "../Texts/StyledText";

// icon
import { MaterialCommunityIcons } from "@expo/vector-icons";

const onIOS = Platform.OS == "ios";

const StyledTextInput = ({ label, icon, style, value, multiline, ...props }) => {
  const [inputBackgroundColor, setInputBackgroundColor] = useState(
    colors.secondary
  );

  const customOnBlur = () => {
    props?.onBlur;
    setInputBackgroundColor(colors.secondary);
  };

  const customOnFocus = () => {
    props?.onFocus;
    setInputBackgroundColor(colors.highlight);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftIcon}>
        <MaterialCommunityIcons name={icon} size={30} color={colors.accent} />
      </View>

      <StyledText small>{label} </StyledText>

      <TextInput
        placeholderTextColor={colors.placeholder}
        {...props}
        onBlur={customOnBlur}
        onFocus={customOnFocus}
        multiline={multiline}
        numberOfLines={multiline && 5}
        value={value}
        style={[
          styles.inputField,
          multiline && styles.multilineInputField,

          {
            color: colors.tint,
            borderColor: colors.gray1,
            backgroundColor: inputBackgroundColor,
            paddingRight: 15,
          },
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  leftIcon: {
    left: 15,
    top: onIOS ? 34 : 36,
    position: "absolute",
    zIndex: 1,
  },
  inputField: {
    paddingLeft: 55,
    paddingRight: 55,
    borderRadius: 15,
    fontSize: 16,
    height: 60,
    marginVertical: 3,
    marginBottom: 20,
  },
  multilineInputField: {
    height: onIOS ? 118 : 132,
    textAlignVertical: "top",
    paddingTop: onIOS ? 20 : 15,
    paddingBottom: onIOS ? 20 : 15,
  },
  row: {
    flexDirection: "row",
  },
});

export default StyledTextInput;
