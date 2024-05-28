import { useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { colors } from "../../config/theme";
import StyledText from "../Texts/StyledText";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const onIOS = Platform.OS == "ios";

const StyledTextInput = ({ label, icon, style, value, multiline, labelStyle, ...props }) => {
  const [inputBackgroundColor, setInputBackgroundColor] = useState(colors.secondary);

  const customOnBlur = () => {
    props?.onBlur && props.onBlur();
    setInputBackgroundColor(colors.secondary);
  };

  const customOnFocus = () => {
    props?.onFocus && props.onFocus();
    setInputBackgroundColor(colors.highlight);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <StyledText style={[styles.label, labelStyle]}>{label}</StyledText>
      </View>
      <View style={styles.inputContainer}>
        {icon && (
          <MaterialCommunityIcons name={icon} size={30} color={colors.accent} style={styles.leftIcon} />
        )}
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
              paddingLeft: icon ? 50 : 15,
            },
            style,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 5,
  },
  inputContainer: {
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    left: 15,
    top: onIOS ? 18 : 20,
    zIndex: 1,
  },
  inputField: {
    borderRadius: 15,
    fontSize: 16,
    height: 60,
    marginVertical: 3,
  },
  multilineInputField: {
    height: onIOS ? 118 : 132,
    textAlignVertical: "top",
    paddingTop: onIOS ? 20 : 15,
    paddingBottom: onIOS ? 20 : 15,
  },
  label: {
    fontSize: 14,
    color: '#000',
  },
});

export default StyledTextInput;