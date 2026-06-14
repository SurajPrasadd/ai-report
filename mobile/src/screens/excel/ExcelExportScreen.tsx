import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { useAppSelector } from '../../store/hooks';
import { LightColors } from '../../theme/colors';
import AppButton from '../../components/common/AppButton';

const ExcelExportScreen: React.FC = () => {
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredSprints = selectedProject
    ? sprints.filter(s => s.projectId === selectedProject)
    : sprints;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {};
      if (selectedProject) params.projectId = selectedProject;
      if (selectedSprint) params.sprintId = selectedSprint;

      const response = await api.get('/excel/export/ai-report', {
        params,
        responseType: 'blob',
      });

      // In a real RN app, use react-native-fs + Share to save/share the file
      Alert.alert(
        '✅ Export Ready',
        'Your Excel report has been generated. In a production app, this would save to your device.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to generate the Excel report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📊 Excel Report Export</Text>
      <Text style={styles.subtitle}>Generate AI productivity reports in Excel format</Text>

      {/* Sheets info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Report Contents</Text>
        <View style={styles.sheetInfo}>
          <View style={styles.sheetBadge}><Text style={styles.sheetBadgeText}>Sheet 1</Text></View>
          <View style={styles.sheetDetails}>
            <Text style={styles.sheetName}>AI Summary</Text>
            <Text style={styles.sheetDesc}>Jira ID, User Story, Resource, AI Usage by SDLC phase</Text>
          </View>
        </View>
        <View style={styles.sheetInfo}>
          <View style={[styles.sheetBadge, { backgroundColor: `${LightColors.secondary}22` }]}>
            <Text style={[styles.sheetBadgeText, { color: LightColors.secondary }]}>Sheet 2</Text>
          </View>
          <View style={styles.sheetDetails}>
            <Text style={styles.sheetName}>Detailed AI Metrics</Text>
            <Text style={styles.sheetDesc}>Full metrics including effort saved, coverage, accuracy, and TrueSDLC data</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>🔧 Filters (Optional)</Text>

        <Text style={styles.filterLabel}>Filter by Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedProject === '' && styles.chipActive]}
            onPress={() => setSelectedProject('')}
          >
            <Text style={[styles.chipText, selectedProject === '' && { color: '#fff' }]}>All Projects</Text>
          </TouchableOpacity>
          {projects.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, selectedProject === p.id && styles.chipActive]}
              onPress={() => { setSelectedProject(p.id); setSelectedSprint(''); }}
            >
              <Text style={[styles.chipText, selectedProject === p.id && { color: '#fff' }]}>{p.projectCode}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Filter by Sprint</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedSprint === '' && styles.chipActive]}
            onPress={() => setSelectedSprint('')}
          >
            <Text style={[styles.chipText, selectedSprint === '' && { color: '#fff' }]}>All Sprints</Text>
          </TouchableOpacity>
          {filteredSprints.slice(0, 10).map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, selectedSprint === s.id && styles.chipActive]}
              onPress={() => setSelectedSprint(s.id)}
            >
              <Text style={[styles.chipText, selectedSprint === s.id && { color: '#fff' }]}>{s.sprintName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sample Columns Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>📋 Sheet 1 Columns</Text>
        {['Jira ID', 'User Story Summary', 'Resource Name', 'Used AI?', 'User Story Creation', 'Sol Document', 'Code Generation', 'Code Review', 'Unit Testing', 'Test Case Generation', 'Reason for not using AI'].map((col, i) => (
          <View key={i} style={styles.colRow}>
            <Text style={styles.colIndex}>{i + 1}</Text>
            <Text style={styles.colName}>{col}</Text>
          </View>
        ))}
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>📊 Sheet 2 Key Columns</Text>
        {['Project Name', 'PM Name', 'User Story ID', 'SDLC Phase', 'Tool Used', 'Estimated Time (Hrs)', 'Actual Effort Saved (Hrs)', 'Actual Effort Saved (%)', 'Actual Coverage', 'TrueSDLC Effort Saved %'].map((col, i) => (
          <View key={i} style={styles.colRow}>
            <Text style={styles.colIndex}>{i + 1}</Text>
            <Text style={styles.colName}>{col}</Text>
          </View>
        ))}
        <Text style={styles.andMore}>+ 26 more columns...</Text>
      </View>

      {/* Export Button */}
      <AppButton
        title={isExporting ? 'Generating Report...' : '📥 Export Excel Report'}
        onPress={handleExport}
        loading={isExporting}
        size="lg"
        style={styles.exportBtn}
      />

      <Text style={styles.footerNote}>
        The report includes all AI usage records with sample data matching the provided spreadsheet format.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: LightColors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: LightColors.textSecondary, marginBottom: 20 },
  infoCard: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: LightColors.text, marginBottom: 14 },
  sheetInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  sheetBadge: { backgroundColor: `${LightColors.primary}22`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 12 },
  sheetBadgeText: { fontSize: 12, fontWeight: '800', color: LightColors.primary },
  sheetDetails: { flex: 1 },
  sheetName: { fontSize: 14, fontWeight: '700', color: LightColors.text },
  sheetDesc: { fontSize: 12, color: LightColors.textSecondary, marginTop: 2, lineHeight: 18 },
  filterCard: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  filterTitle: { fontSize: 15, fontWeight: '700', color: LightColors.text, marginBottom: 14 },
  filterLabel: { fontSize: 13, fontWeight: '500', color: LightColors.textSecondary, marginBottom: 8 },
  chipScroll: { marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border, marginRight: 8 },
  chipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  chipText: { fontSize: 13, color: LightColors.textSecondary, fontWeight: '500' },
  previewCard: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  previewTitle: { fontSize: 15, fontWeight: '700', color: LightColors.text, marginBottom: 12 },
  colRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  colIndex: { width: 28, fontSize: 12, color: LightColors.textDisabled, fontWeight: '600' },
  colName: { fontSize: 13, color: LightColors.text },
  andMore: { fontSize: 12, color: LightColors.primary, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  exportBtn: { marginTop: 8, marginBottom: 16 },
  footerNote: { fontSize: 12, color: LightColors.textSecondary, textAlign: 'center', lineHeight: 18 },
});

export default ExcelExportScreen;
