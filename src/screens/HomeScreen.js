import 'react-native-url-polyfill/auto';
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

const data = [
  { key: '1', value: 'Expira in 24h' },
  { key: '2', value: 'Expira in 2 saptamani' }
];

const HomeScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('');

  const onFilterProducts = (selectedDropdownValue) => {
    if (selectedDropdownValue !== null) {
      setSelected(selectedDropdownValue);
      navigation.navigate('Lista Produse', { props: selectedDropdownValue });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={() => navigation.navigate('Adauga Produs')}>
            <Text style={styles.buttonText}>Adauga produs</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={() => navigation.navigate('Adauga Vrac')}>
            <Text style={styles.buttonText}>Adauga Vrac</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.dropdownContainer}>
        <SelectList
          setSelected={onFilterProducts}
          data={data}
          save="value"
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: 40,
    width: '70%',
  },
  buttonView: {
    backgroundColor: '#00b300',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 16,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dropdownContainer: {
    width: '70%',
    marginBottom: 80,
  },
});