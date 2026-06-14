import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAiUsageByIdThunk } from '../../store/slices/aiUsageSlice';
import { AiUsageStackParamList } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { formatHours, formatPercent, formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<AiUsageStackParamList, 'AiUsageDetail'>;

const Row: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? '—'}</Text>
  </View>
);

const AiUsageDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recordId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedRecord, isLoading } = useAppSelector(s => s.aiUsage);

  useEffect(() => { dispatch(fetchAiUsageByIdThunk(recordId)); }, [recordId]);

  if (isLoading || !selectedRecord) return <LoadingSpinner fullScreen />;
  const r = selectedRecord;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.jiraId}>{r.jiraId || 'No Story'}</Text>
          <StatusBadge status={r.status} />
        </View>
        <Text style={styles.phase}>{r.sdlcPhase}</Text>
        <View style={[styles.aiBadge, { backgroundColor: r.usedAi ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)' }]}>
          <Text style={[styles.aiBadgeText, { color: r.usedAi ? LightColors.success : LightColors.error }]}>
            {r.usedAi ? '🤖 AI Was Used' : '❌ AI Not Used'}
          </Text>
        </View>
      </View>

      {/* Effort Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Effort Analysis</Text>
        <View style={styles.metricsGrid}>
          {[
            { label: 'Estimated', value: formatHours(r.estimatedTime), color: LightColors.info },
            { label: 'Actual', value: formatHours(r.actualTimeSpent), color: LightColors.warning },
            { label: 'Saved', value: formatHours(r.actualEffortSaved), color: LightColors.success },
            { label: '% Saved', value: formatPercent(r.actualEffortSavedPct), color: LightColors.success },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.metricBox}>
              <Text style={[styles.metricValue, { color }]}>{value}</Text>
              <Text style={styles.metricLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Usage Details</Text>
        <Row label="Project" value={r.projectName || '—'} />
        <Row label="Sprint" value={r.sprintName || '—'} />
        <Row label="Employee" value={r.employeeName || '—'} />
        <Row label="Tool Used" value={r.toolUsed || '—'} />
        <Row label="Prompt Count" value={r.promptCount} />
        <Row label="AI Usage Time" value={formatHours(r.aiUsageTime)} />
        <Row label="Review Time" value={formatHours(r.reviewTime)} />
        <Row label="Rework Time" value={formatHours(r.reworkTime)} />
        <Row label="Reporting Date" value={formatDate(r.reportingDate)} />
      </View>

      {/* Quality Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quality Metrics</Text>
        <Row label="Coverage" value={formatPercent(r.actualCoverage)} />
        <Row label="Accuracy" value={formatPercent(r.actualAccuracy)} />
        <Row label="TrueSDLC Coverage" value={formatPercent(r.trueSdlcCoverage)} />
        <Row label="TrueSDLC Accuracy" value={formatPercent(r.trueSdlcAccuracy)} />
        {r.coverageRemarks && <View style={styles.remarks}><Text style={styles.remarksLabel}>Coverage Remarks</Text><Text style={styles.remarksText}>{r.coverageRemarks}</Text></View>}
        {r.reasonForNotUsingAi && <View style={styles.remarks}><Text style={styles.remarksLabel}>Reason Not Using AI</Text><Text style={styles.remarksText}>{r.reasonForNotUsingAi}</Text></View>}
      </View>

      <AppButton title="✏️ Edit Record" variant="outline" onPress={() => navigation.navigate('AiUsageForm', { recordId: r.id })} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { backgroundColor: LightColors.primary, borderRadius: 16, padding: 20, marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jiraId: { fontSize: 18, fontWeight: '800', color: '#fff' },
  phase: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 10 },
  aiBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  aiBadgeText: { fontSize: 14, fontWeight: '700' },
  metricsCard: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  metricBox: { alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '800' },
  metricLabel: { fontSize: 12, color: LightColors.textSecondary, marginTop: 4 },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: LightColors.text, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  rowLabel: { fontSize: 13, color: LightColors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '600', color: LightColors.text },
  remarks: { marginTop: 12, backgroundColor: LightColors.background, borderRadius: 8, padding: 12 },
  remarksLabel: { fontSize: 12, fontWeight: '700', color: LightColors.info, marginBottom: 4 },
  remarksText: { fontSize: 13, color: LightColors.text, lineHeight: 20 },
});

export default AiUsageDetailScreen;
