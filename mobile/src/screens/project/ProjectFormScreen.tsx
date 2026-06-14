import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProjectThunk, updateProjectThunk, fetchProjectByIdThunk } from '../../store/slices/projectSlice';
import { ProjectStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { PROJECT_STATUSES } from '../../utils/constants';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectForm'>;

const schema = yup.object({
  projectCode: yup.string().required('Project code is required').max(20),
  projectName: yup.string().required('Project name is required').max(255),
  description: yup.string().optional(),
  status: yup.string().oneOf(PROJECT_STATUSES).default('Active'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().optional(),
  jiraProjectKey: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const ProjectFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params || {};
  const dispatch = useAppDispatch();
  const { selectedProject, isLoading } = useAppSelector(s => s.projects);
  const isEditing = !!projectId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { projectCode: '', projectName: '', status: 'Active', startDate: '', description: '', endDate: '', jiraProjectKey: '' },
  });

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectByIdThunk(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (isEditing && selectedProject) {
      reset({
        projectCode: selectedProject.projectCode,
        projectName: selectedProject.projectName,
        description: selectedProject.description || '',
        status: selectedProject.status,
        startDate: selectedProject.startDate?.split('T')[0] || '',
        endDate: selectedProject.endDate?.split('T')[0] || '',
        jiraProjectKey: selectedProject.jiraProjectKey || '',
      });
    }
  }, [selectedProject]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await dispatch(updateProjectThunk({ id: projectId!, data })).unwrap();
        Alert.alert('Success', 'Project updated successfully');
      } else {
        await dispatch(createProjectThunk(data)).unwrap();
        Alert.alert('Success', 'Project created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err || 'Operation failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? '✏️ Edit Project' : '📁 Create New Project'}</Text>

      <Controller control={control} name="projectCode" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Project Code" placeholder="e.g. CON" value={value} onChangeText={onChange} onBlur={onBlur}
          error={errors.projectCode?.message} autoCapitalize="characters" required editable={!isEditing} />
      )} />

      <Controller control={control} name="projectName" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Project Name" placeholder="Enter project name" value={value} onChangeText={onChange} onBlur={onBlur}
          error={errors.projectName?.message} required />
      )} />

      <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Description" placeholder="Project description..." value={value || ''} onChangeText={onChange} onBlur={onBlur}
          multiline numberOfLines={3} />
      )} />

      <Text style={styles.fieldLabel}>Status *</Text>
      <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
        <View style={styles.statusRow}>
          {PROJECT_STATUSES.map(s => (
            <TouchableOpacity key={s} style={[styles.statusChip, value === s && styles.statusChipActive]} onPress={() => onChange(s)}>
              <Text style={[styles.statusChipText, value === s && styles.statusChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />

      <Controller control={control} name="startDate" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Start Date" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} onBlur={onBlur}
          error={errors.startDate?.message} required />
      )} />

      <Controller control={control} name="endDate" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="End Date" placeholder="YYYY-MM-DD (optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} />
      )} />

      <Controller control={control} name="jiraProjectKey" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Jira Project Key" placeholder="e.g. CON" value={value || ''} onChangeText={onChange} onBlur={onBlur}
          autoCapitalize="characters" />
      )} />

      <View style={styles.buttons}>
        <AppButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancelBtn} />
        <AppButton title={isEditing ? 'Update Project' : 'Create Project'} onPress={handleSubmit(onSubmit)}
          loading={isLoading} style={styles.submitBtn} />
      </View>
    </ScrollView>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: LightColors.text, marginBottom: 24 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: LightColors.text, marginBottom: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border },
  statusChipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  statusChipText: { fontSize: 13, color: LightColors.textSecondary },
  statusChipTextActive: { color: '#fff', fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});

export default ProjectFormScreen;
