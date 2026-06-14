import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployeesThunk } from '../../store/slices/employeeSlice';
import api from '../../services/api';
import { ProjectStackParamList, Employee } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { getInitials } from '../../utils/helpers';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ManagerMapping'>;

const ManagerMappingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();
  const { employees, isLoading } = useAppSelector(s => s.employees);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeesThunk({ role: 'PM', limit: 50 }));
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const r = await api.get(`/projects/manager/history/${projectId}`);
      setHistory(r.data.data || []);
      const current = r.data.data?.find((h: any) => h.is_active);
      if (current) setSelected(current.manager_id);
    } catch {}
  };

  const handleAssign = async () => {
    if (!selected) return Alert.alert('Error', 'Please select a manager');
    setSaving(true);
    try {
      await api.post('/projects/manager/assign', { projectId, managerId: selected, assignedDate: new Date() });
      Alert.alert('Success', 'Manager assigned successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to assign manager');
    } finally { setSaving(false); }
  };

  const pms = employees.filter(e => e.role === 'PM' || e.role === 'Admin');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Project Manager</Text>
      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={pms}
          keyExtractor={e => e.id}
          renderItem={({ item }: { item: Employee }) => (
            <TouchableOpacity
              style={[styles.empItem, selected === item.id && styles.empItemSelected]}
              onPress={() => setSelected(item.id)}
            >
              <View style={[styles.avatar, selected === item.id && { backgroundColor: LightColors.primary }]}>
                <Text style={[styles.avatarText, selected === item.id && { color: '#fff' }]}>
                  {getInitials(item.firstName, item.lastName)}
                </Text>
              </View>
              <View style={styles.empInfo}>
                <Text style={[styles.empName, selected === item.id && { color: LightColors.primary }]}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.empRole}>{item.employeeId} • {item.role}</Text>
              </View>
              {selected === item.id && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          )}
        />
      )}

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Assignment History</Text>
          {history.slice(0, 3).map((h: any, i: number) => (
            <Text key={i} style={styles.historyItem}>• {h.manager_name} — {h.assigned_date?.split('T')[0]}</Text>
          ))}
        </View>
      )}

      <AppButton title="Assign Manager" onPress={handleAssign} loading={saving} style={styles.assignBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: LightColors.text, marginBottom: 12 },
  empItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  empItemSelected: { borderColor: LightColors.primary, backgroundColor: `${LightColors.primary}08` },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: LightColors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: LightColors.primary },
  empInfo: { flex: 1 },
  empName: { fontSize: 15, fontWeight: '600', color: LightColors.text },
  empRole: { fontSize: 12, color: LightColors.textSecondary },
  checkIcon: { fontSize: 20, color: LightColors.primary, fontWeight: '800' },
  historySection: { marginTop: 12, padding: 14, backgroundColor: LightColors.surface, borderRadius: 10 },
  historyTitle: { fontSize: 13, fontWeight: '700', color: LightColors.textSecondary, marginBottom: 8 },
  historyItem: { fontSize: 12, color: LightColors.textSecondary, marginBottom: 4 },
  assignBtn: { marginTop: 12 },
});

export default ManagerMappingScreen;
