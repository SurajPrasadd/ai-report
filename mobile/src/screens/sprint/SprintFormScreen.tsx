import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSprintThunk, updateSprintThunk } from '../../store/slices/sprintSlice';
import { SprintStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { SPRINT_STATUSES } from '../../utils/constants';

type Props = NativeStackScreenProps<SprintStackParamList, 'SprintForm'>;

const schema = yup.object({
  sprintName: yup.string().required('Sprint name is required'),
  jiraSprintId: yup.string().optional(),
  projectId: yup.string().required('Project is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  status: yup.string().default('Planned'),
  goal: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const SprintFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { sprintId } = route.params || {};
  const dispatch = useAppDispatch();
  const { sprints, isLoading } = useAppSelector(s => s.sprints);
  const { projects } = useAppSelector(s => s.projects);
  const isEditing = !!sprintId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { sprintName: '', jiraSprintId: '', projectId: '', startDate: '', endDate: '', status: 'Planned', goal: '' },
  });

  useEffect(() => {
    if (isEditing) {
      const sprint = sprints.find(s => s.id === sprintId);
      if (sprint) {
        reset({ sprintName: sprint.sprintName, jiraSprintId: sprint.jiraSprintId || '', projectId: sprint.projectId, startDate: sprint.startDate?.split('T')[0] || '', endDate: sprint.endDate?.split('T')[0] || '', status: sprint.status, goal: sprint.goal || '' });
      }
    }
  }, [sprintId, sprints]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await dispatch(updateSprintThunk({ id: sprintId!, data })).unwrap();
        Alert.alert('Success', 'Sprint updated');
      } else {
        await dispatch(createSprintThunk(data)).unwrap();
        Alert.alert('Success', 'Sprint created');
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e || 'Failed'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? '✏️ Edit Sprint' : '🏃 New Sprint'}</Text>

      <Controller control={control} name="sprintName" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Sprint Name" placeholder="e.g. Sprint 1" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.sprintName?.message} required />
      )} />

      <Controller control={control} name="jiraSprintId" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Jira Sprint ID" placeholder="JIRA-SPR-001 (optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} />
      )} />

      <Text style={styles.label}>Project *</Text>
      <Controller control={control} name="projectId" render={({ field: { onChange, value } }) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {projects.map(p => (
            <TouchableOpacity key={p.id} style={[styles.chip, value === p.id && styles.chipActive]} onPress={() => onChange(p.id)}>
              <Text style={[styles.chipText, value === p.id && { color: '#fff' }]}>{p.projectCode}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )} />
      {errors.projectId && <Text style={styles.error}>{errors.projectId.message}</Text>}

      <Controller control={control} name="startDate" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Start Date" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.startDate?.message} required />
      )} />

      <Controller control={control} name="endDate" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="End Date" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.endDate?.message} required />
      )} />

      <Text style={styles.label}>Status</Text>
      <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
        <View style={styles.chipRow}>
          {SPRINT_STATUSES.map(s => (
            <TouchableOpacity key={s} style={[styles.chip, value === s && styles.chipActive]} onPress={() => onChange(s)}>
              <Text style={[styles.chipText, value === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />

      <Controller control={control} name="goal" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Sprint Goal" placeholder="What do you want to achieve?" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
      )} />

      <View style={styles.btns}>
        <AppButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <AppButton title={isEditing ? 'Update' : 'Create Sprint'} onPress={handleSubmit(onSubmit)} loading={isLoading} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: LightColors.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: LightColors.text, marginBottom: 8 },
  chipScroll: { marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border, marginRight: 8 },
  chipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  chipText: { fontSize: 13, color: LightColors.textSecondary, fontWeight: '500' },
  error: { fontSize: 12, color: LightColors.error, marginTop: -12, marginBottom: 12 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

export default SprintFormScreen;
