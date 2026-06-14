import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStatsThunk } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LightColors } from '../../theme/colors';
import { formatHours, formatPercent } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, aiUsageByProject, effortBySprint, isLoading } = useAppSelector(s => s.dashboard);
  const { user } = useAppSelector(s => s.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const loadData = useCallback(async () => {
    await dispatch(fetchDashboardStatsThunk(selectedProject ? { projectId: selectedProject } : {}));
  }, [dispatch, selectedProject]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Chart data
  const barData = {
    labels: effortBySprint.slice(0, 5).map(s => s.sprint_name?.split(' ')[1] || ''),
    datasets: [{
      data: effortBySprint.slice(0, 5).map(s => Number(s.total_effort_saved) || 0),
    }],
  };

  const pieData = aiUsageByProject.slice(0, 5).map((p, i) => ({
    name: p.project_code || p.project_name,
    population: Number(p.ai_percentage) || 0,
    color: [LightColors.chart1, LightColors.chart2, LightColors.chart3, LightColors.chart4, LightColors.chart5][i],
    legendFontColor: LightColors.textSecondary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: () => LightColors.textSecondary,
    style: { borderRadius: 16 },
  };

  if (isLoading && !stats) return <LoadingSpinner fullScreen message="Loading dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[LightColors.primary]} />}
    >
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Good {getTimeOfDay()}, {user?.firstName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Here's your AI productivity overview</Text>
      </View>

      {/* KPI Cards - Row 1 */}
      <View style={styles.cardsRow}>
        <StatCard title="Total Projects" value={stats?.totalProjects ?? 0} icon="📁" color={LightColors.primary} style={styles.halfCard} />
        <StatCard title="Total Employees" value={stats?.totalEmployees ?? 0} icon="👥" color={LightColors.secondary} style={styles.halfCard} />
      </View>

      {/* KPI Cards - Row 2 */}
      <View style={styles.cardsRow}>
        <StatCard title="Total Sprints" value={stats?.totalSprints ?? 0} icon="🏃" color={LightColors.accent} style={styles.halfCard} />
        <StatCard title="Jira Stories" value={stats?.totalJiraStories ?? 0} icon="📋" color={LightColors.info} style={styles.halfCard} />
      </View>

      {/* KPI Cards - Row 3 (AI Metrics) */}
      <View style={styles.cardsRow}>
        <StatCard
          title="AI Usage"
          value={formatPercent(stats?.aiUsagePercentage)}
          icon="🤖"
          color={LightColors.success}
          subtitle={`${stats?.aiUsedCount ?? 0} of ${stats?.totalRecords ?? 0} tasks`}
          style={styles.halfCard}
        />
        <StatCard
          title="Effort Saved"
          value={formatHours(stats?.effortSaved)}
          icon="⏱️"
          color={LightColors.chart5}
          subtitle="Total hours saved with AI"
          style={styles.halfCard}
        />
      </View>

      {/* AI Usage Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Adoption Rate</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Overall AI Usage</Text>
            <Text style={styles.progressValue}>{formatPercent(stats?.aiUsagePercentage)}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(stats?.aiUsagePercentage ?? 0, 100)}%`, backgroundColor: LightColors.success }]} />
          </View>
        </View>
      </View>

      {/* Bar Chart: Effort Saved by Sprint */}
      {effortBySprint.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Effort Saved by Sprint (hrs)</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
              yAxisSuffix="h"
              yAxisLabel=""
              showValuesOnTopOfBars
              style={{ borderRadius: 12 }}
            />
          </View>
        </View>
      )}

      {/* Pie Chart: AI Usage by Project */}
      {pieData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Usage by Project (%)</Text>
          <View style={styles.chartCard}>
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[0, 0]}
              absolute={false}
            />
          </View>
        </View>
      )}

      {/* Project breakdown list */}
      {aiUsageByProject.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Usage by Project</Text>
          {aiUsageByProject.map((project, index) => (
            <View key={index} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectCode}>{project.project_code}</Text>
                <Text style={styles.projectName} numberOfLines={1}>{project.project_name}</Text>
              </View>
              <View style={styles.projectStats}>
                <Text style={styles.projectPct}>{formatPercent(project.ai_percentage)}</Text>
                <Text style={styles.projectCount}>{project.ai_used}/{project.total_records}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 16, paddingBottom: 32 },
  welcomeSection: { marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: LightColors.text },
  welcomeSubtitle: { fontSize: 13, color: LightColors.textSecondary, marginTop: 2 },
  cardsRow: { flexDirection: 'row', marginBottom: 0 },
  halfCard: { flex: 1, margin: 4 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: LightColors.text, marginBottom: 12 },
  chartCard: { backgroundColor: LightColors.surface, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  progressCard: { backgroundColor: LightColors.surface, borderRadius: 12, padding: 16, elevation: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, color: LightColors.text, fontWeight: '500' },
  progressValue: { fontSize: 14, fontWeight: '700', color: LightColors.success },
  progressBar: { height: 10, backgroundColor: LightColors.divider, borderRadius: 5 },
  progressFill: { height: 10, borderRadius: 5 },
  projectRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: LightColors.surface, borderRadius: 10, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  projectInfo: { flex: 1 },
  projectCode: { fontSize: 12, fontWeight: '700', color: LightColors.primary },
  projectName: { fontSize: 13, color: LightColors.textSecondary, marginTop: 2 },
  projectStats: { alignItems: 'flex-end' },
  projectPct: { fontSize: 16, fontWeight: '800', color: LightColors.success },
  projectCount: { fontSize: 11, color: LightColors.textSecondary },
});

export default DashboardScreen;
