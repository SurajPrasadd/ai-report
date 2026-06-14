import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { LightColors, DarkColors } from '../theme/colors';
import { getInitials } from '../utils/helpers';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProjectNavigator from './ProjectNavigator';
import EmployeeListScreen from '../screens/employee/EmployeeListScreen';
import SprintNavigator from './SprintNavigator';
import JiraNavigator from './JiraNavigator';
import AiUsageNavigator from './AiUsageNavigator';
import ExcelExportScreen from '../screens/excel/ExcelExportScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { isDarkMode } = useAppSelector(s => s.theme);
  const colors = isDarkMode ? DarkColors : LightColors;

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.surface }}>
      {/* Profile header */}
      <View style={[styles.profileSection, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>
            {user ? getInitials(user.firstName, user.lastName) : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'User'}</Text>
        <Text style={styles.userRole}>{user?.role} • {user?.employeeId}</Text>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.divider} />
      <DrawerItem
        label={isDarkMode ? '☀️  Light Mode' : '🌙  Dark Mode'}
        onPress={() => dispatch(toggleTheme())}
        labelStyle={{ color: colors.text }}
      />
      <DrawerItem
        label="🚪  Logout"
        onPress={() => dispatch(logoutThunk())}
        labelStyle={{ color: colors.error }}
      />
    </DrawerContentScrollView>
  );
};

const MainNavigator: React.FC = () => {
  const { isDarkMode } = useAppSelector(s => s.theme);
  const colors = isDarkMode ? DarkColors : LightColors;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: { backgroundColor: colors.surface },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen}
        options={{ drawerLabel: '📊  Dashboard', title: 'AI Productivity' }} />
      <Drawer.Screen name="Projects" component={ProjectNavigator}
        options={{ drawerLabel: '📁  Projects', title: 'Projects', headerShown: false }} />
      <Drawer.Screen name="Employees" component={EmployeeListScreen}
        options={{ drawerLabel: '👥  Employees', title: 'Employees' }} />
      <Drawer.Screen name="Sprints" component={SprintNavigator}
        options={{ drawerLabel: '🏃  Sprints', title: 'Sprints', headerShown: false }} />
      <Drawer.Screen name="JiraStories" component={JiraNavigator}
        options={{ drawerLabel: '📋  Jira Stories', title: 'Jira Stories', headerShown: false }} />
      <Drawer.Screen name="AiUsage" component={AiUsageNavigator}
        options={{ drawerLabel: '🤖  AI Usage', title: 'AI Usage', headerShown: false }} />
      <Drawer.Screen name="ExcelExport" component={ExcelExportScreen}
        options={{ drawerLabel: '📊  Excel Export', title: 'Excel Export' }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  profileSection: { padding: 20, paddingTop: 40, paddingBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 22, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8, marginHorizontal: 16 },
});

export default MainNavigator;
