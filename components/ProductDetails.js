import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView } from "react-native";
import { supabase } from "../supabaseClient";
import { format, parse } from "date-fns";
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProductDetails = ({ route }) => {
    const { product } = route.params;
    const [productDetails, setProductDetails] = useState(product);
    const [editMode, setEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        setEditedValues({
            nume: productDetails.nume,
            distribuitor: productDetails.distribuitor,
            cod_bare: productDetails.cod_bare,
            data_expirare: productDetails.data_expirare,
            cantitate: productDetails.cantitate,
        });
    }, [productDetails]);

    const handleEdit = () => {
        setEditMode(true);
        setEditedValues({
            nume: productDetails.nume,
            distribuitor: productDetails.distribuitor,
            cod_bare: productDetails.cod_bare,
            data_expirare: productDetails.data_expirare,
            cantitate: productDetails.cantitate,
        });
    };

    const handleDecreaseQuantity = () => {
        setEditedValues((prevValues) => ({
            ...prevValues,
            cantitate: prevValues.cantitate ? prevValues.cantitate - 1 : '0',
        }));
    };

    const handleIncreaseQuantity = () => {
        setEditedValues((prevValues) => ({
            ...prevValues,
            cantitate: prevValues.cantitate ? prevValues.cantitate + 1 : '1',
        }));
    };

    const handleSave = async () => {
        try {
            const parsedDate = parse(editedValues.data_expirare, "dd.MM.yyyy", new Date());

            if (isNaN(parsedDate)) {
                throw new Error("Invalid date format");
            }

            if (!productDetails.inventory_id) {
                throw new Error("Invalid inventory ID");
            }

            const formattedDate = format(parsedDate, "yyyy-MM-dd");

            const { data: inventoryData, error: inventoryError } = await supabase
                .from("Inventory")
                .update({
                    data_expirare: formattedDate,
                    cantitate: editedValues.cantitate,
                    distribuitor: editedValues.distribuitor,
                })
                .eq("inventory_id", productDetails.inventory_id);

            if (inventoryError) {
                throw new Error(inventoryError.message);
            }

            const { data: produseData, error: produseError } = await supabase
                .from("Produse")
                .update({
                    nume: editedValues.nume,
                    cod_bare: editedValues.cod_bare,
                })
                .eq("product_id", product.product_id);

            if (produseError) {
                throw new Error(produseError.message);
            }

            setProductDetails({
                ...productDetails,
                nume: editedValues.nume,
                distribuitor: editedValues.distribuitor,
                cod_bare: editedValues.cod_bare,
                data_expirare: format(parsedDate, "dd.MM.yyyy"),
                cantitate: editedValues.cantitate,
            });

            setEditMode(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancel = () => {
        setEditedValues((prevValues) => ({
            ...prevValues,
            data_expirare: prevValues.data_expirare
                ? new Date(prevValues.data_expirare)
                : null,
        }));
        setEditMode(false);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = format(selectedDate, "dd.MM.yyyy");
            setEditedValues((prevValues) => ({
                ...prevValues,
                data_expirare: formattedDate,
            }));
        }
    };

    const renderDatePicker = () => {
        if (showDatePicker) {
            return (
                <DateTimePicker
                    value={editedValues.data_expirare ? new Date(editedValues.data_expirare).toISOString() : new Date().toISOString()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            );
        }
        return null;
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
        if (editedValues.data_expirare) {
            const [day, month, year] = editedValues.data_expirare.split('.');
            const selectedDate = new Date(`${year}-${month}-${day}`);
            setEditedValues({ ...editedValues, data_expirare: selectedDate });
        }
    };


    return (
        <KeyboardAvoidingView>
            <ScrollView
                contentContainerStyle={styles.detailsContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.labelValueContainer}>
                    <Text style={styles.label}>Nume:</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={editedValues.nume}
                            onChangeText={(text) =>
                                setEditedValues({ ...editedValues, nume: text })
                            }
                        />
                    ) : (
                        <Text style={styles.value}>{productDetails.nume}</Text>
                    )}
                </View>

                <View style={styles.labelValueContainer}>
                    <Text style={styles.label}>Distribuitor:</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={editedValues.distribuitor}
                            onChangeText={(text) =>
                                setEditedValues({ ...editedValues, distribuitor: text })
                            }
                        />
                    ) : (
                        <Text style={styles.value}>{productDetails.distribuitor}</Text>
                    )}
                </View>

                <View style={styles.labelValueContainer}>
                    <Text style={styles.label}>Cod de bare:</Text>
                    {editMode ? (
                        <TextInput
                            keyboardType="numeric"
                            style={styles.input}
                            value={editedValues.cod_bare}
                            onChangeText={(text) =>
                                setEditedValues({ ...editedValues, cod_bare: text })
                            }
                        />
                    ) : (
                        <Text style={styles.value}>{productDetails.cod_bare}</Text>
                    )}
                </View>

                <View style={styles.labelValueContainer}>
                    <Text style={styles.label}>Data expirarii:</Text>
                    {editMode ? (
                        <View>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={showDatepicker}
                            >
                                <Text style={styles.dateText}>
                                    {editedValues.data_expirare ? editedValues.data_expirare.toString() : 'Selecteaza data'}
                                </Text>
                                <MaterialIcons name="date-range" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.value}>{productDetails.data_expirare}</Text>
                    )}
                </View>

                <View style={styles.labelValueContainer}>
                    <Text style={styles.label}>Cantitate:</Text>
                    {editMode ? (
                        <View style={styles.quantityContainer}>
                            <TextInput
                                keyboardType="numeric"
                                style={styles.input}
                                value={editedValues.cantitate ? editedValues.cantitate.toString() : ''}
                                onChangeText={(text) =>
                                    setEditedValues({
                                        ...editedValues,
                                        cantitate: text ? parseInt(text, 10) || 0 : undefined,
                                    })
                                }
                            />
                            <View style={styles.quantityButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.quantityButton, styles.quantityButtonTop]}
                                    onPress={handleIncreaseQuantity}
                                >
                                    <MaterialIcons name="keyboard-arrow-up" style={styles.buttonIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quantityButton, styles.quantityButtonBottom]}
                                    onPress={handleDecreaseQuantity}
                                >
                                    <MaterialIcons name="keyboard-arrow-down" style={styles.buttonIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.value}>{productDetails.cantitate}</Text>
                    )}
                </View>

                {editMode ? (
                    <View style={styles.editModeButtonsContainer}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Salveaza</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.buttonText}>Inchide</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            {showDatePicker && <DateTimePicker
                value={new Date(editedValues.data_expirare)}
                mode="date"
                display="default"
                onChange={handleDateChange}
            />}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        width: "100%",
    },
    detailsContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        width: "100%",
    },
    labelValueContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 30,
        alignItems: "center",
    },
    label: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 10,
    },
    value: {
        fontSize: 18,
    },
    input: {
        width: 200,
        height: 40,
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 4,
        paddingHorizontal: 8,
        fontSize: 18,
        textAlign: 'center'
    },
    editButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 12,
        width: "80%",
        marginTop: 16,
    },
    editModeButtonsContainer: {
        flexDirection: "row",
        width: "100%",
        marginTop: 16,
        justifyContent: 'center'
    },
    saveButton: {
        backgroundColor: "#00b300",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        marginRight: 12
    },
    closeButton: {
        backgroundColor: "#cc0000",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: 230,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        textAlign: 'center'
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
    },
    quantityButtonTop: {
        marginBottom: 4,
    },
    quantityButtonBottom: {
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 25
    },
    buttonIcon: {
        color: '#fff',
        fontSize: 24,
    },
});

export default ProductDetails;