import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { supabase } from '../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from 'react-native';

const AddModal = ({ navigation }) => {
    const [inputBarcode, setInputBarcode] = useState('');
    const [inputName, setInputName] = useState('');
    const [inputDistrib, setInputDistrib] = useState('');
    const [inputQuantity, setInputQuantity] = useState('1');
    const [dateQuantityInputs, setDateQuantityInputs] = useState([{ date: '', quantity: '1' }]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [submitMessage, setSubmitMessage] = useState('');
    const [showSubmitMessage, setShowSubmitMessage] = useState(false);
    const [inputCategory, setInputCategory] = useState('');

    useEffect(() => {
        checkFormValidity();
    }, [inputBarcode, inputName, inputDistrib, dateQuantityInputs, inputCategory]);

    const checkFormValidity = () => {
        const isValid =
            inputBarcode !== '' &&
            inputName !== '' &&
            inputDistrib !== '' &&
            inputCategory !== '' &&
            dateQuantityInputs.every(
                (input) =>
                    input.date !== '' &&
                    input.quantity !== '' &&
                    parseInt(input.quantity) > 0
            );
        setIsFormValid(isValid);
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
        setDateQuantityInputs((prevInputs) => [...prevInputs, { date: '', quantity: '1' }]);
    };

    const submitHandler = async () => {
        try {
          if (isFormValid) {
            const { data: existingProducts, error: productSelectError } = await supabase
              .from('Produse')
              .select('product_id')
              .eq('cod_bare', inputBarcode);
      
            if (productSelectError) throw productSelectError;
      
            if (existingProducts.length > 0) {
              const productID = existingProducts[0].product_id;
              const insertPromises = dateQuantityInputs.map(async (input) => {
                await supabase.from('Inventory').insert({
                  product_id: productID,
                  data_expirare: convertDateFormat(input.date),
                  cantitate: parseInt(input.quantity),
                  distribuitor: inputDistrib,
                });
              });
              await Promise.all(insertPromises);
              setSubmitMessage('Produsul a fost adaugat');
            } else {
              const { data: newProduct, error: insertError } = await supabase
                .from('Produse')
                .insert({ nume: inputName, cod_bare: inputBarcode, categorie: inputCategory });
      
              if (insertError) throw insertError;
      
              const { data: insertedProduct, error: selectError } = await supabase
                .from('Produse')
                .select('product_id')
                .eq('cod_bare', inputBarcode);
      
              if (selectError) throw selectError;
      
              const productID = insertedProduct[0].product_id;
      
              if (!productID) {
                throw new Error('Failed to retrieve product_id');
              }
      
              const insertPromises = dateQuantityInputs.map(async (input) => {
                await supabase.from('Inventory').insert({
                  product_id: productID,
                  data_expirare: convertDateFormat(input.date),
                  cantitate: parseInt(input.quantity),
                  distribuitor: inputDistrib,
                });
              });
      
              await Promise.all(insertPromises);
              setSubmitMessage('Produsul a fost adaugat');
            }
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

    const handleBarcodeScanned = async (barcode) => {
        setInputBarcode(barcode);

        try {
            const { data: productData, error: productSelectError } = await supabase
                .from('Produse')
                .select('nume, categorie')
                .eq('cod_bare', barcode)
                .single();

            if (productSelectError) throw productSelectError;

            if (productData) {
                setInputName(productData.nume);
                setInputCategory(productData.categorie);
            }
        } catch (error) {
            console.log(error);
        }
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
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() =>
                        navigation.navigate('Code Scanner', {
                            onBarcodeScanned: handleBarcodeScanned,
                        })
                    }
                >
                    <Text style={styles.buttonText}>Scaneaza</Text>
                </TouchableOpacity>
                <Text style={styles.label}>Cod de bare:</Text>
                <TextInput
                    style={styles.input}
                    value={inputBarcode}
                    onChangeText={(text) => {
                        setInputBarcode(text);
                        checkFormValidity();
                    }}
                />
                <Text style={styles.label}>Nume produs:</Text>
                <TextInput
                    style={styles.input}
                    value={inputName}
                    onChangeText={(text) => {
                        setInputName(text);
                        checkFormValidity();
                    }}
                />
                <Text style={styles.label}>Categorie:</Text>
                <TextInput
                    style={styles.input}
                    value={inputCategory}
                    onChangeText={(text) => {
                        setInputCategory(text);
                        checkFormValidity();
                    }}
                />
                <Text style={styles.label}>Distribuitor:</Text>
                <TextInput
                    style={styles.input}
                    value={inputDistrib}
                    onChangeText={(text) => {
                        setInputDistrib(text);
                        checkFormValidity();
                    }}
                />
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
                            <TouchableOpacity style={[styles.addButton, styles.buttonMargin]} onPress={addDateQuantityInput}>
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
        paddingBottom: 0,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    scanButton: {
        backgroundColor: '#3f51b5',
        padding: 8,
        borderRadius: 10,
        marginBottom: 16,
        alignItems: 'center',
        width: '60%',
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 20,
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
        marginBottom: 20
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
    buttonMargin: {
        marginBottom: 20
    }
});

export default AddModal;