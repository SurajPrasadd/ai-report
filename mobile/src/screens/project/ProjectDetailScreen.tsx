import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProjectByIdThunk } from '../../store/slices/projectSlice';
import { ProjectStackParamList } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LightColors } from '../../theme/colors';
import { formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectDetail'>;

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedProject, isLoading } = useAppSelector(s => s.projects);

  useEffect(() => {
    dispatch(fetchProjectByIdThunk(projectId));
  }, [projectId]);

  if (isLoading || !selectedProject) return <LoadingSpinner fullScreen />;

  const p = selectedProject;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{p.projectCode}</Text>
          <StatusBadge status={p.status} />
        </View>
        <Text style={styles.name}>{p.projectName}</Text>
        {p.description && <Text style={styles.description}>{p.description}</Text>}
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project Details</Text>
        <DetailRow label="PM Name" value={p.pmName || '—'} />
        <DetailRow label="Start Date" value={formatDate(p.startDate)} />
        <DetailRow label="End Date" value={formatDate(p.endDate) || 'Ongoing'} />
        <DetailRow label="Jira Key" value={p.jiraProjectKey || '—'} />
        <DetailRow label="Created" value={formatDate(p.createdAt)} />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: '✏️ Edit Project', action: () => navigation.navigate('ProjectForm', { projectId: p.id }) },
            { label: '👤 Assign Manager', action: () => navigation.navigate('ManagerMapping', { projectId: p.id }) },
            { label: '👥 Team Members', action: () => navigation.navigate('EmployeeMapping', { projectId: p.id }) },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.actionItem} onPress={item.action}>
              <Text style={styles.actionItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { backgroundColor: LightColors.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  code: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: LightColors.text, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  detailLabel: { fontSize: 13, color: LightColors.textSecondary, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: LightColors.text, flex: 2, textAlign: 'right' },
  actionsCard: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, elevation: 2 },
  actionsGrid: { gap: 8 },
  actionItem: { backgroundColor: LightColors.background, borderRadius: 10, padding: 14 },
  actionItemText: { fontSize: 14, color: LightColors.primary, fontWeight: '600' },
});

export default ProjectDetailScreen;
