import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAiUsageThunk, deleteAiUsageThunk } from '../../store/slices/aiUsageSlice';
import { AiUsageStackParamList, AiUsageRecord } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LightColors } from '../../theme/colors';
import { formatHours, formatPercent } from '../../utils/helpers';

type Props = NativeStackScreenProps<AiUsageStackParamList, 'AiUsageList'>;

const AiUsageListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { records, isLoading, pagination } = useAppSelector(s => s.aiUsage);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchAiUsageThunk({ limit: 20 })); }, []);

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchAiUsageThunk({})); setRefreshing(false); };

  const handleDelete = (record: AiUsageRecord) => {
    Alert.alert('Delete Record', 'Delete this AI usage record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteAiUsageThunk(record.id)) },
    ]);
  };

  const renderItem = ({ item }: { item: AiUsageRecord }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AiUsageDetail', { recordId: item.id })}>
      <View style={styles.cardTop}>
        <View style={styles.topLeft}>
          <Text style={styles.jiraId}>{item.jiraId || 'No Story'}</Text>
          <Text style={styles.phase}>{item.sdlcPhase}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={[styles.aiBadge, { backgroundColor: item.usedAi ? `${LightColors.success}18` : `${LightColors.error}18` }]}>
            <Text style={[styles.aiBadgeText, { color: item.usedAi ? LightColors.success : LightColors.error }]}>
              {item.usedAi ? '🤖 AI Used' : '❌ No AI'}
            </Text>
          </View>
          <StatusBadge status={item.status} size="sm" />
        </View>
      </View>

      <Text style={styles.projectName}>{item.projectName}</Text>
      {item.toolUsed && <Text style={styles.tool}>🔧 {item.toolUsed}</Text>}

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatHours(item.estimatedTime)}</Text>
          <Text style={styles.metricLabel}>Estimated</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatHours(item.actualTimeSpent)}</Text>
          <Text style={styles.metricLabel}>Actual</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: LightColors.success }]}>{formatHours(item.actualEffortSaved)}</Text>
          <Text style={styles.metricLabel}>Saved</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: LightColors.success }]}>{formatPercent(item.actualEffortSavedPct)}</Text>
          <Text style={styles.metricLabel}>% Saved</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AiUsageForm', { recordId: item.id })}>
          <Text style={styles.editText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
          <Text style={{ color: LightColors.error, fontSize: 13 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addFab} onPress={() => navigation.navigate('AiUsageForm', {})}>
        <Text style={styles.addFabText}>＋ Log AI Usage</Text>
      </TouchableOpacity>
      {pagination && <Text style={styles.countText}>{pagination.total} records</Text>}
      {isLoading && !refreshing ? <LoadingSpinner /> : records.length === 0 ? (
        <EmptyState icon="🤖" title="No AI Usage Records" message="Start logging your AI usage to track productivity"
          actionLabel="Log AI Usage" onAction={() => navigation.navigate('AiUsageForm', {})} />
      ) : (
        <FlatList
          data={records} renderItem={renderItem} keyExtractor={i => i.id}
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
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  topLeft: { flex: 1 },
  topRight: { alignItems: 'flex-end', gap: 4 },
  jiraId: { fontSize: 14, fontWeight: '800', color: LightColors.primary },
  phase: { fontSize: 12, color: LightColors.textSecondary, marginTop: 2 },
  aiBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  aiBadgeText: { fontSize: 11, fontWeight: '700' },
  projectName: { fontSize: 13, color: LightColors.textSecondary, marginBottom: 4 },
  tool: { fontSize: 12, color: LightColors.info, marginBottom: 10 },
  metrics: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: LightColors.background, borderRadius: 10, padding: 12, marginBottom: 10 },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 16, fontWeight: '800', color: LightColors.text },
  metricLabel: { fontSize: 10, color: LightColors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: LightColors.divider, paddingTop: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: LightColors.background },
  editText: { fontSize: 13, color: LightColors.primary, fontWeight: '500' },
  deleteBtn: { backgroundColor: `${LightColors.error}12` },
});

export default AiUsageListScreen;
