import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJiraByIdThunk } from '../../store/slices/jiraSlice';
import { JiraStackParamList } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';

type Props = NativeStackScreenProps<JiraStackParamList, 'JiraDetail'>;

const JiraDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { storyId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedStory, isLoading } = useAppSelector(s => s.jira);

  useEffect(() => { dispatch(fetchJiraByIdThunk(storyId)); }, [storyId]);

  if (isLoading || !selectedStory) return <LoadingSpinner fullScreen />;
  const s = selectedStory;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.jiraId}>{s.jiraId}</Text>
          <StatusBadge status={s.status} />
        </View>
        <Text style={styles.summary}>{s.summary}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.priority}>⚡ {s.priority}</Text>
          {s.storyPoints != null && s.storyPoints > 0 && <Text style={styles.points}>{s.storyPoints} pts</Text>}
        </View>
      </View>

      <View style={styles.card}>
        {[
          { label: 'Project', value: s.projectName },
          { label: 'Sprint', value: s.sprintName || '—' },
          { label: 'Assignee', value: s.assigneeName || '—' },
          { label: 'Reporter', value: s.reporter || '—' },
          { label: 'Epic', value: s.epicKey || '—' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || '—'}</Text>
          </View>
        ))}
      </View>

      {s.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.bodyText}>{s.description}</Text>
        </View>
      )}
      {s.acceptanceCriteria && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acceptance Criteria</Text>
          <Text style={styles.bodyText}>{s.acceptanceCriteria}</Text>
        </View>
      )}

      <View style={styles.btns}>
        <AppButton title="✏️ Edit" variant="outline" onPress={() => navigation.navigate('JiraForm', { storyId: s.id })} style={{ flex: 1 }} />
        <AppButton title="🤖 Log AI Usage" onPress={() => navigation.navigate('JiraList')} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { backgroundColor: LightColors.primary, borderRadius: 16, padding: 20, marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  jiraId: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  summary: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 26, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 12 },
  priority: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  points: { fontSize: 13, fontWeight: '700', color: '#fff' },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: LightColors.text, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  rowLabel: { fontSize: 13, color: LightColors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '600', color: LightColors.text, textAlign: 'right', flex: 1, marginLeft: 16 },
  bodyText: { fontSize: 14, color: LightColors.text, lineHeight: 24 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

export default JiraDetailScreen;
