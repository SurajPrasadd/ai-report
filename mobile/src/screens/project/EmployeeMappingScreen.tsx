import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployeesThunk } from '../../store/slices/employeeSlice';
import api from '../../services/api';
import { ProjectStackParamList } from '../../types';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LightColors } from '../../theme/colors';
import { getInitials } from '../../utils/helpers';
import { PROJECT_ROLES } from '../../utils/constants';

type Props = NativeStackScreenProps<ProjectStackParamList, 'EmployeeMapping'>;

const EmployeeMappingScreen: React.FC<Props> = ({ route }) => {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector(s => s.employees);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedRole, setSelectedRole] = useState('Developer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeesThunk({ limit: 100 }));
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const r = await api.get(`/projects/employee/team/${projectId}`);
      setTeamMembers(r.data.data || []);
    } catch {}
  };

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedRole) return;
    setLoading(true);
    try {
      await api.post('/projects/employee/assign', { employeeId: selectedEmployee, projectId, role: selectedRole });
      await loadTeam();
      setShowModal(false);
      Alert.alert('Success', 'Employee assigned to project');
    } catch { Alert.alert('Error', 'Failed to assign employee'); }
    finally { setLoading(false); }
  };

  const handleRemove = (employeeId: string, name: string) => {
    Alert.alert('Remove Employee', `Remove ${name} from this project?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await api.delete(`/projects/employee/${employeeId}/${projectId}`);
          await loadTeam();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{teamMembers.length} Team Members</Text>
        <AppButton title="＋ Add" onPress={() => setShowModal(true)} size="sm" />
      </View>

      <FlatList
        data={teamMembers}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitials}>{getInitials(item.employee_name?.split(' ')[0] || '', item.employee_name?.split(' ')[1] || '')}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.employee_name}</Text>
              <Text style={styles.memberEmail}>{item.email}</Text>
            </View>
            <View style={styles.memberRight}>
              <StatusBadge status={item.role} size="sm" />
              <TouchableOpacity onPress={() => handleRemove(item.employee_id, item.employee_name)} style={styles.removeBtn}>
                <Text style={{ color: LightColors.error, fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No team members yet. Add employees to this project.</Text>}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Assign Employee</Text>
            <Text style={styles.modalLabel}>Select Employee</Text>
            <FlatList
              data={employees}
              style={{ maxHeight: 200 }}
              keyExtractor={e => e.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.empOption, selectedEmployee === item.id && styles.empOptionSelected]} onPress={() => setSelectedEmployee(item.id)}>
                  <Text style={styles.empOptionText}>{item.firstName} {item.lastName} ({item.role})</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={styles.modalLabel}>Select Role</Text>
            <View style={styles.roleRow}>
              {PROJECT_ROLES.map(r => (
                <TouchableOpacity key={r} style={[styles.roleChip, selectedRole === r && styles.roleChipActive]} onPress={() => setSelectedRole(r)}>
                  <Text style={[styles.roleChipText, selectedRole === r && { color: '#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtns}>
              <AppButton title="Cancel" variant="outline" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
              <AppButton title="Assign" onPress={handleAssign} loading={loading} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background, padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: LightColors.text },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.surface, borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: `${LightColors.primary}18`, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  memberInitials: { fontSize: 16, fontWeight: '700', color: LightColors.primary },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: LightColors.text },
  memberEmail: { fontSize: 12, color: LightColors.textSecondary },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  removeBtn: { padding: 4 },
  emptyText: { textAlign: 'center', color: LightColors.textSecondary, marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: LightColors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: LightColors.text, marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: LightColors.textSecondary, marginBottom: 8, marginTop: 12 },
  empOption: { padding: 12, borderRadius: 8, marginBottom: 4, backgroundColor: LightColors.background },
  empOptionSelected: { backgroundColor: `${LightColors.primary}18`, borderWidth: 1.5, borderColor: LightColors.primary },
  empOptionText: { fontSize: 14, color: LightColors.text },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border },
  roleChipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  roleChipText: { fontSize: 13, color: LightColors.textSecondary, fontWeight: '500' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
});

export default EmployeeMappingScreen;
