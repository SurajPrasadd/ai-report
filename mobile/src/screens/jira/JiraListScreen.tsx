import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJiraStoriesThunk, syncJiraStoriesThunk } from '../../store/slices/jiraSlice';
import { JiraStackParamList, JiraStory } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LightColors } from '../../theme/colors';
import { truncate } from '../../utils/helpers';

type Props = NativeStackScreenProps<JiraStackParamList, 'JiraList'>;

const PRIORITY_COLOR: Record<string, string> = {
  Highest: '#D32F2F', High: '#F57C00', Medium: '#1976D2', Low: '#388E3C', Lowest: '#757575',
};

const JiraListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { stories, isLoading, isSyncing, pagination } = useAppSelector(s => s.jira);
  const { projects } = useAppSelector(s => s.projects);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchJiraStoriesThunk({ limit: 20 })); }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setTimeout(() => dispatch(fetchJiraStoriesThunk({ search: text, limit: 20 })), 400);
  };

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchJiraStoriesThunk({})); setRefreshing(false); };

  const handleSync = () => {
    if (!projects.length) return Alert.alert('No Projects', 'No projects available to sync');
    const p = projects[0];
    if (!p.jiraProjectKey) return Alert.alert('No Jira Key', 'Project does not have a Jira project key configured');
    Alert.alert('Sync from Jira', `Sync stories for project ${p.projectCode}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sync', onPress: () => dispatch(syncJiraStoriesThunk({ projectId: p.id, jiraProjectKey: p.jiraProjectKey! })) },
    ]);
  };

  const renderItem = ({ item }: { item: JiraStory }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JiraDetail', { storyId: item.id })}>
      <View style={styles.cardTop}>
        <View style={styles.jiraIdRow}>
          <Text style={styles.jiraId}>{item.jiraId}</Text>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] || '#757575' }]} />
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
      <View style={styles.cardBottom}>
        {item.assigneeName && <Text style={styles.assignee}>👤 {item.assigneeName}</Text>}
        {item.sprintName && <Text style={styles.sprint}>🏃 {item.sprintName}</Text>}
        {item.storyPoints != null && item.storyPoints > 0 && <Text style={styles.points}>{item.storyPoints} pts</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search Jira ID or summary..." value={search} onChangeText={handleSearch} placeholderTextColor={LightColors.placeholder} />
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={isSyncing}>
          <Text style={styles.syncText}>{isSyncing ? '⟳' : '🔄'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('JiraForm', {})}>
          <Text style={styles.addText}>＋</Text>
        </TouchableOpacity>
      </View>
      {pagination && <Text style={styles.countText}>{pagination.total} stories</Text>}
      {isLoading && !refreshing ? <LoadingSpinner /> : stories.length === 0 ? (
        <EmptyState icon="📋" title="No Jira Stories" message="Create stories or sync from Jira"
          actionLabel="Create Story" onAction={() => navigation.navigate('JiraForm', {})} />
      ) : (
        <FlatList
          data={stories} renderItem={renderItem} keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[LightColors.primary]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  topBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: LightColors.surface, elevation: 2 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.background, borderRadius: 10, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: LightColors.text },
  syncBtn: { backgroundColor: `${LightColors.info}18`, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  syncText: { fontSize: 18 },
  addBtn: { backgroundColor: LightColors.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  countText: { fontSize: 12, color: LightColors.textSecondary, paddingHorizontal: 16, paddingVertical: 6 },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jiraIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jiraId: { fontSize: 13, fontWeight: '800', color: LightColors.primary },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  summary: { fontSize: 14, fontWeight: '600', color: LightColors.text, lineHeight: 22, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  assignee: { fontSize: 12, color: LightColors.textSecondary },
  sprint: { fontSize: 12, color: LightColors.textSecondary },
  points: { fontSize: 12, fontWeight: '700', color: LightColors.secondary, marginLeft: 'auto' },
});

export default JiraListScreen;
