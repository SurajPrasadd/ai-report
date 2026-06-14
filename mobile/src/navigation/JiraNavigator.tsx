import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JiraStackParamList } from '../types';
import { LightColors } from '../theme/colors';
import JiraListScreen from '../screens/jira/JiraListScreen';
import JiraDetailScreen from '../screens/jira/JiraDetailScreen';
import JiraFormScreen from '../screens/jira/JiraFormScreen';

const Stack = createNativeStackNavigator<JiraStackParamList>();

const JiraNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: LightColors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="JiraList" component={JiraListScreen} options={{ title: 'Jira Stories' }} />
    <Stack.Screen name="JiraDetail" component={JiraDetailScreen} options={{ title: 'Story Details' }} />
    <Stack.Screen name="JiraForm" component={JiraFormScreen} options={({ route }) => ({ title: route.params?.storyId ? 'Edit Story' : 'New Story' })} />
  </Stack.Navigator>
);

export default JiraNavigator;
