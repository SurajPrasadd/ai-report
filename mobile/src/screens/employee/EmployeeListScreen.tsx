import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployeesThunk } from '../../store/slices/employeeSlice';
import { Employee } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LightColors } from '../../theme/colors';
import { getInitials } from '../../utils/helpers';

const EmployeeListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { employees, isLoading, pagination } = useAppSelector(s => s.employees);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((s = search) => {
    dispatch(fetchEmployeesThunk({ search: s, limit: 20 }));
  }, [dispatch, search]);

  useEffect(() => { load(); }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setTimeout(() => load(text), 400);
  };

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchEmployeesThunk({})); setRefreshing(false); };

  const getRoleColor = (role: string) => {
    const m: Record<string, string> = { Admin: '#9C27B0', PM: '#1976D2', Developer: '#388E3C', QA: '#FF6F00', BA: '#0288D1', Architect: '#D32F2F' };
    return m[role] || '#9E9E9E';
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: `${getRoleColor(item.role)}22` }]}>
        <Text style={[styles.avatarText, { color: getRoleColor(item.role) }]}>{getInitials(item.firstName, item.lastName)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}18` }]}>
            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
          </View>
        </View>
        <Text style={styles.empId}>{item.employeeId} • {item.email}</Text>
        {item.designation && <Text style={styles.designation}>{item.designation}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search employees..." value={search} onChangeText={handleSearch} placeholderTextColor={LightColors.placeholder} />
      </View>
      {pagination && <Text style={styles.countText}>{pagination.total} employees</Text>}
      {isLoading && !refreshing ? <LoadingSpinner /> : employees.length === 0 ? (
        <EmptyState icon="👥" title="No Employees Found" />
      ) : (
        <FlatList
          data={employees} renderItem={renderItem} keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[LightColors.primary]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.surface, margin: 12, borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: LightColors.text },
  countText: { fontSize: 12, color: LightColors.textSecondary, paddingHorizontal: 16, paddingBottom: 4 },
  list: { padding: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.surface, borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: LightColors.text },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  roleText: { fontSize: 11, fontWeight: '700' },
  empId: { fontSize: 12, color: LightColors.textSecondary },
  designation: { fontSize: 12, color: LightColors.primary, marginTop: 2 },
});

export default EmployeeListScreen;
