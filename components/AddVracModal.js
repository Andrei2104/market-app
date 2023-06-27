import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { supabase } from '../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

const distribData = [
    { key: '1', value: 'Fox' },
    { key: '2', value: 'Agil' },
    { key: '3', value: 'Caroli' },
    { key: '4', value: 'Banat Bun' },
]

const AddVracModal = ({ navigation }) => {
    const [selectedDistrib, setSelectedDistrib] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [inputQuantity, setInputQuantity] = useState('1');
    const [dateQuantityInputs, setDateQuantityInputs] = useState([{ date: '', quantity: '1' }]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [submitMessage, setSubmitMessage] = useState('');
    const [showSubmitMessage, setShowSubmitMessage] = useState(false);
    const [productNames, setProductNames] = useState([]);

    useEffect(() => {
        checkFormValidity();
    }, [selectedName, selectedDistrib, dateQuantityInputs]);

    const checkFormValidity = () => {
        const isValid =
        selectedName !== '' &&
        selectedDistrib !== '' &&
            dateQuantityInputs.every(
                (input) =>
                    input.date !== '' &&
                    input.quantity !== '' &&
                    parseInt(input.quantity) > 0
            );
        setIsFormValid(isValid);
    };

    const onFilterProducts = async (selectedDropdownValue) => {
        if (selectedDropdownValue !== null) {
          setSelectedDistrib(selectedDropdownValue);
          try {
            const { data, error } = await supabase
              .from('Produse')
              .select('nume')
              .eq('categorie', selectedDropdownValue)
              .order('nume', { ascending: true });
      
            if (error) {
              throw error;
            }
      
            const names = data.map((item) => item.nume);
            setProductNames(names);
          } catch (error) {
            console.log(error);
          }
        }
      };

    const handlePlus = (index) => {
        setDateQuantityInputs((prevInputs) => {
            const updatedInputs = [...prevInputs];
            const newQuantity = parseInt(updatedInputs[index].quantity) + 1;
            updatedInputs[index].quantity = isNaN(newQuantity) ? '1' : String(newQuantity);
            return updatedInputs;
        });
    };

    const handleMinus = (index) => {
        setDateQuantityInputs((prevInputs) => {
            const updatedInputs = [...prevInputs];
            const newQuantity = parseInt(updatedInputs[index].quantity) - 1;
            updatedInputs[index].quantity = newQuantity > 0 ? String(newQuantity) : '1';
            return updatedInputs;
        });
    };

    const addDateQuantityInput = () => {
        setDateQuantityInputs((prevInputs) => [...prevInputs, { date: '', quantity: '' }]);
    };

    const submitHandler = async () => {
        try {
            if (isFormValid) {
                const { data, error } = await supabase
                    .from('Produse')
                    .insert({ nume: selectedName, categorie: selectedDistrib })
                    .select('product_id')
                    .single();

                if (error) throw error;

                const productID = data?.product_id;

                if (!productID) {
                    throw new Error('Failed to retrieve product_id');
                }

                const insertPromises = dateQuantityInputs.map(async (input) => {
                    await supabase.from('Inventory').insert({
                        product_id: productID,
                        data_expirare: convertDateFormat(input.date),
                        cantitate: parseInt(input.quantity),
                        distribuitor: selectedDistrib,
                    });
                });

                await Promise.all(insertPromises);
                setSubmitMessage('Produsul a fost adaugat');
            } else {
                setSubmitMessage('Produsul nu a fost adaugat');
            }
        } catch (error) {
            setSubmitMessage('Produsul nu a fost adaugat');
        }

        setShowSubmitMessage(true);
    };

    const closeModal = () => {
        setShowSubmitMessage(false);
        navigation.goBack();
    };

    const convertDateFormat = (inputDate) => {
        const parts = inputDate.split('.');
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        return formattedDate;
    };

    const handleDateQuantityChange = (text, index, type) => {
        setDateQuantityInputs((prevInputs) => {
            const updatedInputs = [...prevInputs];
            updatedInputs[index][type] = text;
            return updatedInputs;
        });
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${day}.${month}.${year}`;
            handleDateQuantityChange(formattedDate, selectedDateIndex, 'date');
        }
    };

    const showDatepicker = (index) => {
        setSelectedDateIndex(index);
        setShowDatePicker(true);
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.label}>Distribuitor:</Text>
                <View style={styles.dropdownContainer}>
                    <SelectList
                        setSelected={onFilterProducts}
                        data={distribData}
                        save="value"
                    />
                </View>
                <Text style={styles.label}>Nume produs:</Text>
                <View style={styles.dropdownContainer}>
                    <SelectList
                    setSelected={setSelectedName}
                    data={productNames.map((name, index) => ({ key: index.toString(), value: name }))}
                    save='value'
                    />
                </View>
                {dateQuantityInputs.map((input, index) => (
                    <View key={index}>
                        <Text style={styles.label}>Data expirarii:</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => showDatepicker(index)}
                        >
                            <Text style={styles.dateText}>
                                {input.date !== ''
                                    ? input.date
                                    : 'Selecteaza data'}
                            </Text>
                            <MaterialIcons name="date-range" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.label}>Cantitate:</Text>
                        <View style={styles.quantityContainer}>
                            <TextInput
                                style={styles.quantityInput}
                                value={input.quantity}
                                placeholder='1'
                                onChangeText={(text) => {
                                    setInputQuantity(text);
                                    checkFormValidity();
                                    setDateQuantityInputs((prevInputs) => {
                                        const updatedInputs = [...prevInputs];
                                        updatedInputs[index].quantity = text;
                                        return updatedInputs;
                                    });
                                }}
                                keyboardType="numeric"
                            />
                            <View style={styles.quantityButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.quantityButton, styles.quantityButtonTop]}
                                    onPress={() => handlePlus(index)}
                                >
                                    <MaterialIcons name="keyboard-arrow-up" style={styles.buttonIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quantityButton, styles.quantityButtonBottom]}
                                    onPress={() => handleMinus(index)}
                                >
                                    <MaterialIcons name="keyboard-arrow-down" style={styles.buttonIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {index === dateQuantityInputs.length - 1 && (
                            <TouchableOpacity style={styles.addButton} onPress={addDateQuantityInput}>
                                <Text style={styles.buttonText}>Adauga data si cantitate</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.addButton, !isFormValid && styles.disabledButton]}
                        onPress={submitHandler}
                        disabled={!isFormValid}
                    >
                        <Text style={styles.buttonText}>Adauga</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Inchide</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            <Modal visible={showSubmitMessage} animationType="fade" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.submitMessage}>{submitMessage}</Text>
                        <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
    },
    quantityButtonsContainer: {
        flexDirection: 'column',
        marginLeft: 16,
    },
    quantityButton: {
        backgroundColor: '#3f51b5',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quantityButtonTop: {
        marginBottom: 4,
    },
    quantityButtonBottom: {
        marginTop: 4,
    },
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonIcon: {
        color: '#fff',
        fontSize: 24,
    },
    addButton: {
        backgroundColor: '#00b300',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 16,
        marginRight: 8,
    },
    closeButton: {
        backgroundColor: '#cc0000',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 16,
        marginRight: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20
    },
    dateText: {
        flex: 1,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitMessage: {
        marginTop: 10,
        color: 'green',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeModalButton: {
        marginTop: 20,
        backgroundColor: '#3f51b5',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    dropdownContainer: {
        width: '70%',
        marginBottom: 20,
    }
});

export default AddVracModal;