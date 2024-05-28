import { StyleSheet, View } from "react-native";
import { colors } from "../../config/theme";
import StyledText from "../Texts/StyledText";
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StyledSelectDropdown = ({ label, style, value, listData, onSelect, fieldPlaceholder, labelStyle, ...props }) => {
  return (
    <View style={styles.container}>
       <StyledText style={[styles.label, labelStyle]}>{label}</StyledText>
    <SelectDropdown
      data={listData}
      onSelect={onSelect}
      defaultValue={value}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View style={styles.dropdownButtonStyle}>
            <StyledText style={styles.dropdownButtonTxtStyle}>
              {selectedItem || fieldPlaceholder }
            </StyledText>
            <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
            <StyledText style={styles.dropdownItemTxtStyle}>{item}</StyledText>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={styles.dropdownMenuStyle}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dropdownButtonStyle: {
    width: "100%",
    height: 60,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  label: {
    marginBottom: 5,
    color: 'white',
    fontSize: 18,
  },
});

export default StyledSelectDropdown;