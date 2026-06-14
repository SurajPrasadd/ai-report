import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSprintsThunk, deleteSprintThunk } from '../../store/slices/sprintSlice';
import { SprintStackParamList, Sprint } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LightColors } from '../../theme/colors';
import { formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<SprintStackParamList, 'SprintList'>;

const SprintListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { sprints, isLoading, pagination } = useAppSelector(s => s.sprints);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchSprintsThunk({ limit: 20 })); }, []);

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchSprintsThunk({})); setRefreshing(false); };

  const handleDelete = (sprint: Sprint) => {
    Alert.alert('Delete Sprint', `Delete "${sprint.sprintName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteSprintThunk(sprint.id)) },
    ]);
  };

  const getDaysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'Ended';
    if (diff === 0) return 'Ends today';
    return `${diff}d left`;
  };

  const renderItem = ({ item }: { item: Sprint }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SprintDetail', { sprintId: item.id })}>
      <View style={styles.cardHeader}>
        <View style={styles.sprintInfo}>
          <Text style={styles.projectCode}>{item.projectCode}</Text>
          <StatusBadge status={item.status} size="sm" />
        </View>
        <Text style={styles.daysLeft}>{getDaysLeft(item.endDate)}</Text>
      </View>
      <Text style={styles.sprintName}>{item.sprintName}</Text>
      <Text style={styles.projectName}>{item.projectName}</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>📅 {formatDate(item.startDate)} — {formatDate(item.endDate)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SprintForm', { sprintId: item.id })}>
          <Text style={styles.editText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
          <Text style={{ color: LightColors.error, fontSize: 13 }}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addFab} onPress={() => navigation.navigate('SprintForm', {})}>
        <Text style={styles.addFabText}>＋ New Sprint</Text>
      </TouchableOpacity>
      {pagination && <Text style={styles.countText}>{pagination.total} sprints</Text>}
      {isLoading && !refreshing ? <LoadingSpinner /> : sprints.length === 0 ? (
        <EmptyState icon="🏃" title="No Sprints" message="Create your first sprint to get started"
          actionLabel="Create Sprint" onAction={() => navigation.navigate('SprintForm', {})} />
      ) : (
        <FlatList
          data={sprints} renderItem={renderItem} keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12, paddingTop: 52 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[LightColors.primary]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  addFab: { position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: LightColors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addFabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  countText: { fontSize: 12, color: LightColors.textSecondary, padding: 12, paddingBottom: 0 },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sprintInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  projectCode: { fontSize: 12, fontWeight: '700', color: LightColors.primary, backgroundColor: `${LightColors.primary}18`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  daysLeft: { fontSize: 12, color: LightColors.warning, fontWeight: '600' },
  sprintName: { fontSize: 17, fontWeight: '700', color: LightColors.text, marginBottom: 2 },
  projectName: { fontSize: 13, color: LightColors.textSecondary, marginBottom: 8 },
  dateRow: { marginBottom: 10 },
  dateText: { fontSize: 12, color: LightColors.textSecondary },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: LightColors.divider, paddingTop: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: LightColors.background },
  editText: { fontSize: 13, color: LightColors.primary, fontWeight: '500' },
  deleteBtn: { backgroundColor: `${LightColors.error}12` },
});

export default SprintListScreen;
