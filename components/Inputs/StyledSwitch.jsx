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
      <View style={styles.leftIcon}>
        <MaterialCommunityIcons name={icon} size={30} color={colors.highlight} />
      </View>

      <StyledText big style={styles.text}>{label} </StyledText>

      <Switch
        value={value}
        trackColor={{false: '#767577', true: colors.highlight }}
        thumbColor={colors.accent}
        onValueChange={onValueChange}
        style={styles.inputField}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    fontSize: 16,
    height: 60,
    marginVertical: 3,
    marginBottom: 20,
  },
  text: {
    textAlign: "center",
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  leftIcon: {
    marginRight: 10,
  },
  inputField: {
    borderRadius: 15,
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
