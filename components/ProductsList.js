import { useEffect, useState } from "react";
import { Text, FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../supabaseClient";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const ProductsList = ({ route, navigation }) => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { props } = route.params;

    useEffect(() => {
        if (props !== null) {
            fetchProducts();
        }
    }, [props]);


    const fetchProducts = async () => {
        try {
            let { data: inventoryData, error: inventoryError } = await supabase
                .from("Inventory")
                .select("inventory_id, product_id, data_expirare, cantitate, distribuitor")
                .limit(1000)
                .order("data_expirare", { ascending: true });

            let { data: productsData, error: productsError } = await supabase
                .from("Produse")
                .select("product_id, nume, cod_bare")
                .limit(1000);

            if (inventoryError || productsError) throw new Error("Failed to fetch data");

            const filteredData = inventoryData.filter((inventoryItem) => {
                const { data_expirare } = inventoryItem;
                const expirationDate = new Date(data_expirare);

                const currentDate = new Date();
                const nextDay = new Date();
                nextDay.setDate(currentDate.getDate() + 1);
                const maxExpirationDate = new Date();
                maxExpirationDate.setDate(currentDate.getDate() + 14);

                if (props === "Expira in 24h") {
                    return (
                        expirationDate >= currentDate && expirationDate <= nextDay
                    );
                } else if (props === "Expira in 2 saptamani") {
                    return (
                        expirationDate > nextDay && expirationDate <= maxExpirationDate
                    );
                }
                return true;
            });

            const selectedProducts = filteredData.flatMap((inventoryItem) => {
                const { inventory_id, product_id, cantitate, data_expirare, distribuitor } = inventoryItem;
                const product = productsData.find((product) => product.product_id === product_id);

                const expirationDates = Array.isArray(data_expirare) ? data_expirare : [data_expirare];

                return expirationDates.map((expirationDate) => ({
                    product_id,
                    nume: product.nume,
                    cod_bare: product.cod_bare,
                    data_expirare: format(new Date(expirationDate), "dd.MM.yyyy"),
                    cantitate: parseInt(cantitate, 10),
                    distribuitor: distribuitor,
                    inventory_id: inventory_id
                }));
            });

            setSelectedProducts(selectedProducts);
        } catch (error) {
            console.log(error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const renderItem = ({ item }) => {
        const handlePress = () => {
            navigation.navigate("Detalii Produs", { product: item });
        };

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={styles.row}>
                    <Text style={[styles.column, styles.columnSpacing]}>{item.nume}</Text>
                    <Text style={[styles.column, styles.columnSpacing]}>
                        {item.data_expirare}
                    </Text>
                    <Text style={styles.column}>{item.cod_bare}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.columnHeader}>Nume</Text>
                <Text style={styles.columnHeader}>Data expirarii</Text>
                <Text style={styles.columnHeader}>Cod de bare</Text>
            </View>
            <FlatList
                data={selectedProducts}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.product_id}_${index}`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 7,
        paddingTop: 16,
        backgroundColor: "#F5F5F5",
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        alignItems: 'center'
    },
    columnHeader: {
        flex: 1,
        fontWeight: "bold",
        color: "black",
        paddingHorizontal: 20
    },
    row: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
    },
    column: {
        flex: 1,
        color: "black",
    },
    columnSpacing: {
        marginRight: 20,
    },
});

export default ProductsList;