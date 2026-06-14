import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProjectsThunk, deleteProjectThunk } from '../../store/slices/projectSlice';
import { ProjectStackParamList, Project } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { LightColors } from '../../theme/colors';
import { formatDate, truncate } from '../../utils/helpers';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectList'>;

const ProjectListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, pagination } = useAppSelector(s => s.projects);
  const { user } = useAppSelector(s => s.auth);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadProjects = useCallback(async (pageNum = 1, searchTerm = search) => {
    await dispatch(fetchProjectsThunk({ page: pageNum, limit: 10, search: searchTerm }));
  }, [dispatch, search]);

  useEffect(() => { loadProjects(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadProjects(1);
    setRefreshing(false);
  };

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      setPage(1);
      const timer = setTimeout(() => loadProjects(1, text), 400);
      return () => clearTimeout(timer);
    }, [loadProjects]
  );

  const handleDelete = (project: Project) => {
    if (!['Admin'].includes(user?.role || '')) return Alert.alert('Permission Denied', 'Only admins can delete projects');
    Alert.alert('Delete Project', `Delete "${project.projectName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await dispatch(deleteProjectThunk(project.id));
          Alert.alert('Success', 'Project deleted');
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.projectCode}</Text>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.projectName}>{item.projectName}</Text>
      {item.pmName && <Text style={styles.pmText}>PM: {item.pmName}</Text>}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>📅 {formatDate(item.startDate)} — {formatDate(item.endDate) || 'Ongoing'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ProjectForm', { projectId: item.id })}>
          <Text style={styles.actionText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ManagerMapping', { projectId: item.id })}>
          <Text style={styles.actionText}>👤 Manager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
          <Text style={[styles.actionText, { color: LightColors.error }]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search + Add */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={search}
            onChangeText={handleSearch}
            placeholderTextColor={LightColors.placeholder}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProjectForm', {})}>
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      {pagination && (
        <Text style={styles.countText}>{pagination.total} projects found</Text>
      )}

      {isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState icon="📁" title="No Projects Found" message="Create your first project to get started"
          actionLabel="Create Project" onAction={() => navigation.navigate('ProjectForm', {})} />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[LightColors.primary]} />}
          onEndReached={() => {
            if (pagination?.hasNext) {
              const next = page + 1;
              setPage(next);
              loadProjects(next);
            }
          }}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  topBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: LightColors.surface, elevation: 2 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: LightColors.background, borderRadius: 10, paddingHorizontal: 12 },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: LightColors.text },
  addBtn: { backgroundColor: LightColors.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  countText: { fontSize: 12, color: LightColors.textSecondary, paddingHorizontal: 16, paddingVertical: 8 },
  list: { padding: 12 },
  card: { backgroundColor: LightColors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codeBadge: { backgroundColor: `${LightColors.primary}18`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  codeText: { fontSize: 13, fontWeight: '700', color: LightColors.primary },
  projectName: { fontSize: 16, fontWeight: '700', color: LightColors.text, marginBottom: 4 },
  pmText: { fontSize: 13, color: LightColors.textSecondary, marginBottom: 8 },
  cardFooter: { marginBottom: 10 },
  dateText: { fontSize: 12, color: LightColors.textSecondary },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: LightColors.divider, paddingTop: 10, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: LightColors.background, borderRadius: 6 },
  actionText: { fontSize: 13, color: LightColors.primary, fontWeight: '500' },
  deleteBtn: { backgroundColor: `${LightColors.error}12` },
});

export default ProjectListScreen;
