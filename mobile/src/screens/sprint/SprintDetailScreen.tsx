import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSprintsThunk } from '../../store/slices/sprintSlice';
import { SprintStackParamList } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<SprintStackParamList, 'SprintDetail'>;

const SprintDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { sprintId } = route.params;
  const { sprints } = useAppSelector(s => s.sprints);
  const sprint = sprints.find(s => s.id === sprintId);

  if (!sprint) return <View style={styles.container}><Text>Sprint not found</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.projectCode}>{sprint.projectCode}</Text>
          <StatusBadge status={sprint.status} />
        </View>
        <Text style={styles.sprintName}>{sprint.sprintName}</Text>
        <Text style={styles.projectName}>{sprint.projectName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sprint Details</Text>
        {[
          { label: 'Start Date', value: formatDate(sprint.startDate) },
          { label: 'End Date', value: formatDate(sprint.endDate) },
          { label: 'Jira Sprint ID', value: sprint.jiraSprintId || '—' },
          { label: 'Velocity', value: sprint.velocity ? `${sprint.velocity} pts` : '—' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
        {sprint.goal && (
          <View style={styles.goalBox}>
            <Text style={styles.goalLabel}>🎯 Sprint Goal</Text>
            <Text style={styles.goalText}>{sprint.goal}</Text>
          </View>
        )}
      </View>

      <AppButton title="✏️ Edit Sprint" variant="outline" onPress={() => navigation.navigate('SprintForm', { sprintId: sprint.id })} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { backgroundColor: LightColors.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  projectCode: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  sprintName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  projectName: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: LightColors.text, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  rowLabel: { fontSize: 13, color: LightColors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '600', color: LightColors.text },
  goalBox: { marginTop: 12, backgroundColor: LightColors.background, borderRadius: 10, padding: 14 },
  goalLabel: { fontSize: 13, fontWeight: '700', color: LightColors.primary, marginBottom: 6 },
  goalText: { fontSize: 14, color: LightColors.text, lineHeight: 22 },
});

export default SprintDetailScreen;
