import React from 'react';
import { Text, View, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const CustomAlert = ({ message, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => onClose()}
    >
      <View style={styles.container}>
        <View style={styles.alert}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={() => onClose()} style={styles.button}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alert: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A4D39',
  },
});

export default CustomAlert;