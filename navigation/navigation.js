import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../src/screens/HomeScreen";
import AddModal from "../components/AddModal";
import ProductsList from "../components/ProductsList";
import CodeScanner from "../components/CodeScanner";
import ProductDetails from "../components/ProductDetails";
import AddVracModal from "../components/AddVracModal";

const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='Home' component={HomeScreen} />
                <Stack.Screen name='Adauga Produs' component={AddModal} options={{ presentation: 'modal' }} />
                <Stack.Screen name='Lista Produse' component={ProductsList} />
                <Stack.Screen name='Code Scanner' component={CodeScanner} options={{presentation: 'modal'}} />
                <Stack.Screen name='Detalii Produs' component={ProductDetails} options={{presentation: 'modal'}} />
                <Stack.Screen name='Adauga Vrac' component={AddVracModal} options={{presentation: 'modal'}} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation;