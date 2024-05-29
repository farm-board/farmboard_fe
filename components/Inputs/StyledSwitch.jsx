import { useState } from "react";
import { StyleSheet, View, TextInput, Platform, Switch } from "react-native";
import { colors } from "../../config/theme";
import StyledText from "../Texts/StyledText";

// icon
import { MaterialCommunityIcons } from "@expo/vector-icons";

const onIOS = Platform.OS == "ios";
const StyledSwitch = ({ label, icon, style, value, onValueChange, multiline, ...props }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.leftIcon}>
          <MaterialCommunityIcons name={icon} size={30} color="white" />
        </View>

      </View>
        <StyledText big style={styles.text}>{label} </StyledText>
      <View style={styles.rightContent}>
        <Switch
          value={value}
          trackColor={{false: '#333', true: "#ffb900" }}
          thumbColor={colors.accent}
          onValueChange={onValueChange}
          style={styles.inputField}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    fontSize: 16,
    height: 60,
    marginTop: 10,
  },
  text: {
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 30,
  },
  leftIcon: {
    flex: 1,
    marginRight: 10,
  },
  rightContent: {
    flex: 1,
    alignItems: 'flex-end', // Add this line
  },
  inputField: {
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: colors.secondary,
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

export default StyledSwitch;
