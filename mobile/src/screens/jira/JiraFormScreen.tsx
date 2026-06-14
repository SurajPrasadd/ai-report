import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createJiraStoryThunk, updateJiraStoryThunk } from '../../store/slices/jiraSlice';
import { JiraStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { JIRA_STATUSES, JIRA_PRIORITIES } from '../../utils/constants';

type Props = NativeStackScreenProps<JiraStackParamList, 'JiraForm'>;

const schema = yup.object({
  jiraId: yup.string().required('Jira ID is required'),
  summary: yup.string().required('Summary is required'),
  description: yup.string().optional(),
  acceptanceCriteria: yup.string().optional(),
  status: yup.string().default('To Do'),
  priority: yup.string().default('Medium'),
  storyPoints: yup.string().optional(),
  projectId: yup.string().required('Project is required'),
  sprintId: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const JiraFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { storyId } = route.params || {};
  const dispatch = useAppDispatch();
  const { selectedStory, isLoading } = useAppSelector(s => s.jira);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);
  const isEditing = !!storyId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { jiraId: '', summary: '', description: '', acceptanceCriteria: '', status: 'To Do', priority: 'Medium', storyPoints: '', projectId: '', sprintId: '' },
  });

  useEffect(() => {
    if (isEditing && selectedStory) {
      reset({ jiraId: selectedStory.jiraId, summary: selectedStory.summary, description: selectedStory.description || '', acceptanceCriteria: selectedStory.acceptanceCriteria || '', status: selectedStory.status, priority: selectedStory.priority, storyPoints: String(selectedStory.storyPoints || ''), projectId: selectedStory.projectId, sprintId: selectedStory.sprintId || '' });
    }
  }, [selectedStory]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, storyPoints: data.storyPoints ? parseInt(data.storyPoints) : 0 };
      if (isEditing) {
        await dispatch(updateJiraStoryThunk({ id: storyId!, data: payload })).unwrap();
        Alert.alert('Success', 'Story updated');
      } else {
        await dispatch(createJiraStoryThunk(payload)).unwrap();
        Alert.alert('Success', 'Story created');
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e || 'Failed'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? '✏️ Edit Story' : '📋 New Jira Story'}</Text>

      <Controller control={control} name="jiraId" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Jira ID" placeholder="e.g. CON-19253" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.jiraId?.message} required editable={!isEditing} autoCapitalize="characters" />
      )} />

      <Controller control={control} name="summary" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Summary" placeholder="User story summary" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.summary?.message} required multiline numberOfLines={2} />
      )} />

      <Text style={styles.label}>Project *</Text>
      <Controller control={control} name="projectId" render={({ field: { onChange, value } }) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {projects.map(p => (
            <TouchableOpacity key={p.id} style={[styles.chip, value === p.id && styles.chipActive]} onPress={() => onChange(p.id)}>
              <Text style={[styles.chipText, value === p.id && { color: '#fff' }]}>{p.projectCode}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )} />

      <Text style={styles.label}>Status</Text>
      <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
        <View style={styles.chipRow}>
          {JIRA_STATUSES.map(s => (
            <TouchableOpacity key={s} style={[styles.chip, value === s && styles.chipActive]} onPress={() => onChange(s)}>
              <Text style={[styles.chipText, value === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />

      <Text style={styles.label}>Priority</Text>
      <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
        <View style={styles.chipRow}>
          {JIRA_PRIORITIES.map(p => (
            <TouchableOpacity key={p} style={[styles.chip, value === p && styles.chipActive]} onPress={() => onChange(p)}>
              <Text style={[styles.chipText, value === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />

      <Controller control={control} name="storyPoints" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Story Points" placeholder="e.g. 5" value={value || ''} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" />
      )} />

      <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Description" placeholder="Story description..." value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
      )} />

      <Controller control={control} name="acceptanceCriteria" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Acceptance Criteria" placeholder="Given... When... Then..." value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
      )} />

      <View style={styles.btns}>
        <AppButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <AppButton title={isEditing ? 'Update' : 'Create'} onPress={handleSubmit(onSubmit)} loading={isLoading} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: LightColors.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: LightColors.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border, marginRight: 8 },
  chipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  chipText: { fontSize: 13, color: LightColors.textSecondary, fontWeight: '500' },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

export default JiraFormScreen;
