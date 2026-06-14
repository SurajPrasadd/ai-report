import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AiUsageStackParamList } from '../types';
import { LightColors } from '../theme/colors';
import AiUsageListScreen from '../screens/ai-usage/AiUsageListScreen';
import AiUsageDetailScreen from '../screens/ai-usage/AiUsageDetailScreen';
import AiUsageFormScreen from '../screens/ai-usage/AiUsageFormScreen';

const Stack = createNativeStackNavigator<AiUsageStackParamList>();

const AiUsageNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: LightColors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="AiUsageList" component={AiUsageListScreen} options={{ title: 'AI Usage' }} />
    <Stack.Screen name="AiUsageDetail" component={AiUsageDetailScreen} options={{ title: 'AI Usage Details' }} />
    <Stack.Screen name="AiUsageForm" component={AiUsageFormScreen} options={({ route }) => ({ title: route.params?.recordId ? 'Edit Record' : 'Log AI Usage' })} />
  </Stack.Navigator>
);

export default AiUsageNavigator;
