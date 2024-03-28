import React from 'react';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/theme';

const onIOS = Platform.OS == "ios";

const skills = [
    { name: 'Agriculture', id: 1,
      skills: [
          { name: 'Crop rotation planning', id: 100 },
          { name: 'Soil testing and analysis', id: 101 },
          { name: 'Pest and disease management', id: 102 },
          { name: 'Irrigation system maintenance', id: 103 },
        ]
    },
    { name: 'Livestock Type', id: 2,
      skills: [
          { name: 'Cattle', id: 200 },
          { name: 'Dairy Cattle', id: 201 },
          { name: 'Poultry', id: 202 },
          { name: 'Sheep', id: 203 },
          { name: 'Pigs', id: 204 },
          { name: 'Horses', id: 205 },
          { name: 'Other', id: 206 },
        ]
    },
    { name: 'Livestock Operations', id: 3,
      skills: [
          { name: 'Livestock Handling', id: 300 },
          { name: 'Animal Health Management', id: 301 },
          { name: 'Breeding and Reproduction', id: 302 },
          { name: 'Nutrition Management', id: 303 },
          { name: 'Facility Maintenance and Infrastructure', id: 304 },
        ]
    },
    { name: 'Equipment Operation and Maintenance', id: 4,
      skills: [
          { name: 'Heavy Machinery Operation', id: 400 },
          { name: 'Agriculture Machinery Operation', id: 401 },
          { name: 'Heavy Machinery Maintenance', id: 402 },
          { name: 'Routine Maintenance', id: 403 },
          { name: 'Equipment Calibration', id: 404 },
          { name: 'Welding and Fabrication', id: 405 },
          { name: 'Adaptability with New Technology', id: 406 },
        ]
    },
    { name: 'Hauling & Driving', id: 5,
      skills: [
          { name: 'Vehicle Maintenance', id: 500 },
          { name: 'Load Securing', id: 501 },
          { name: 'Navigation Skills', id: 502 },
          { name: 'Communication and Coordination', id: 503 },
          { name: 'Tractor Trailer - CDL', id: 504 },
          { name: 'Tractor Trailer - NO CDL', id: 505 },
          { name: 'Livestock Transportation', id: 506 },
        ]
    },
];

export default function SkillsSelect({ selectedItems, onSelectedItemsChange }) {
  const handleSelectedItemsChange = (selectedItems) => {
    const livestockTypeIds = skills.find(skill => skill.name === 'Livestock Type').skills.map(skill => skill.id);
    const livestockOperationsIds = skills.find(skill => skill.name === 'Livestock Operations').skills.map(skill => skill.id);
  
    const selectedLivestockTypeIds = selectedItems.filter(id => livestockTypeIds.includes(id));
    const selectedLivestockOperationsIds = selectedItems.filter(id => livestockOperationsIds.includes(id));
  
    if (selectedLivestockOperationsIds.length > 0 && selectedLivestockTypeIds.length === 0) {
      alert('Please select a Livestock Type before selecting Livestock Operations.');
      return;
    }
  
    const selectedSkills = skills
      .flatMap(skill => skill.skills) 
      .filter(skill => selectedItems.includes(skill.id))
      .map(skill => skill.name);
  
    onSelectedItemsChange(selectedItems, selectedSkills);
  };
  
    return (
    <View style={styles.container}>
     <View style={styles.leftIcon}>
        <MaterialCommunityIcons name={"tools"} size={30} color={colors.accent} />
      </View>
     <View style={{ paddingLeft: 40 }}>
      <SectionedMultiSelect
        items={skills}
        IconRenderer={Icon}
        selectChildren={true}
        modalWithSafeAreaView={true}
        colors={{primary: '#4F6F52', subText: '#000000'}}
        selectText="Select Skills"
        searchPlaceholderText="Search skills..."
        uniqueKey="id"
        subKey="skills"
        onSelectedItemsChange={handleSelectedItemsChange}
        selectedItems={selectedItems}
        styles={{
          chipContainer: styles.multiSelectChipContainer,
          chipText: styles.multiSelectChipText,
        }}
      />
      </View>
    </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#e2e8f0',
      minWidth: '100%',
      padding: 3,
      marginBottom: 15,
      borderRadius: 15,
    },
    multiSelectHeader: {
        height: 30,
        backgroundColor: '#098809'
    },
    multiSelectFooterText: {
        padding: 12,
        marginTop: 12,
        backgroundColor: '#eee'
      },
      multiSelectChipContainer: {
        borderWidth: 0,
        backgroundColor: '#FDEBD0',
        borderRadius: 8
      },
      multiSelectChipText: {
        color: '#222',
        fontSize: 14.5
      },
      leftIcon: {
        left: 15,
        top: 15,
        position: "absolute",
        zIndex: 1,
      },
  });

  function MultiSelectHeader() {
    return (
      <View style={styles.multiSelectHeader}></View>
    );
  }

  function MultiSelectFooter({ itemCount }) {
    return (
      <View>
        <Text
          style={styles.multiSelectFooterText}>
          {itemCount} skill(s) selected.</Text>
      </View>
    );
  }