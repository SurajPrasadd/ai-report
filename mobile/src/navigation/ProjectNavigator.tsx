import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types';
import { LightColors } from '../theme/colors';
import ProjectListScreen from '../screens/project/ProjectListScreen';
import ProjectDetailScreen from '../screens/project/ProjectDetailScreen';
import ProjectFormScreen from '../screens/project/ProjectFormScreen';
import ManagerMappingScreen from '../screens/project/ManagerMappingScreen';
import EmployeeMappingScreen from '../screens/project/EmployeeMappingScreen';

const Stack = createNativeStackNavigator<ProjectStackParamList>();

const ProjectNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: LightColors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projects' }} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Details' }} />
    <Stack.Screen name="ProjectForm" component={ProjectFormScreen} options={({ route }) => ({ title: route.params?.projectId ? 'Edit Project' : 'New Project' })} />
    <Stack.Screen name="ManagerMapping" component={ManagerMappingScreen} options={{ title: 'Assign Manager' }} />
    <Stack.Screen name="EmployeeMapping" component={EmployeeMappingScreen} options={{ title: 'Team Members' }} />
  </Stack.Navigator>
);

export default ProjectNavigator;
