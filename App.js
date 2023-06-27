import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Navigation from './navigation/navigation';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Navigation />
  );
}