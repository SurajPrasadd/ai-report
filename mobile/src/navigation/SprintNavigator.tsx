import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SprintStackParamList } from '../types';
import { LightColors } from '../theme/colors';
import SprintListScreen from '../screens/sprint/SprintListScreen';
import SprintDetailScreen from '../screens/sprint/SprintDetailScreen';
import SprintFormScreen from '../screens/sprint/SprintFormScreen';

const Stack = createNativeStackNavigator<SprintStackParamList>();

const SprintNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: LightColors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="SprintList" component={SprintListScreen} options={{ title: 'Sprints' }} />
    <Stack.Screen name="SprintDetail" component={SprintDetailScreen} options={{ title: 'Sprint Details' }} />
    <Stack.Screen name="SprintForm" component={SprintFormScreen} options={({ route }) => ({ title: route.params?.sprintId ? 'Edit Sprint' : 'New Sprint' })} />
  </Stack.Navigator>
);

export default SprintNavigator;
