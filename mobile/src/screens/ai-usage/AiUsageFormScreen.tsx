import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAiUsageThunk, updateAiUsageThunk, fetchAiUsageByIdThunk } from '../../store/slices/aiUsageSlice';
import { AiUsageStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';
import { SDLC_PHASES, AI_TOOLS } from '../../utils/constants';

type Props = NativeStackScreenProps<AiUsageStackParamList, 'AiUsageForm'>;

const schema = yup.object({
  jiraId: yup.string().optional(),
  projectId: yup.string().required('Project is required'),
  sprintId: yup.string().optional(),
  sdlcPhase: yup.string().required('SDLC Phase is required'),
  usedAi: yup.boolean().default(false),
  toolUsed: yup.string().optional(),
  promptCount: yup.string().optional(),
  estimatedTime: yup.string().required('Estimated time is required'),
  aiUsageTime: yup.string().optional(),
  reviewTime: yup.string().optional(),
  reworkTime: yup.string().optional(),
  actualTimeSpent: yup.string().required('Actual time is required'),
  reasonForNotUsingAi: yup.string().optional(),
  useCaseDetails: yup.string().optional(),
  status: yup.string().default('Draft'),
});

type FormData = yup.InferType<typeof schema>;

const AiUsageFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recordId, jiraId: prefillJiraId } = route.params || {};
  const dispatch = useAppDispatch();
  const { selectedRecord, isLoading } = useAppSelector(s => s.aiUsage);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);
  const isEditing = !!recordId;

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { jiraId: prefillJiraId || '', projectId: '', sdlcPhase: '', usedAi: false, toolUsed: '', promptCount: '', estimatedTime: '', aiUsageTime: '', reviewTime: '', reworkTime: '', actualTimeSpent: '', reasonForNotUsingAi: '', useCaseDetails: '', status: 'Draft' },
  });

  const usedAi = watch('usedAi');

  useEffect(() => {
    if (recordId) dispatch(fetchAiUsageByIdThunk(recordId));
  }, [recordId]);

  useEffect(() => {
    if (isEditing && selectedRecord) {
      reset({
        jiraId: selectedRecord.jiraId || '', projectId: selectedRecord.projectId,
        sdlcPhase: selectedRecord.sdlcPhase, usedAi: selectedRecord.usedAi,
        toolUsed: selectedRecord.toolUsed || '', promptCount: String(selectedRecord.promptCount || ''),
        estimatedTime: String(selectedRecord.estimatedTime || ''), aiUsageTime: String(selectedRecord.aiUsageTime || ''),
        reviewTime: String(selectedRecord.reviewTime || ''), reworkTime: String(selectedRecord.reworkTime || ''),
        actualTimeSpent: String(selectedRecord.actualTimeSpent || ''),
        reasonForNotUsingAi: selectedRecord.reasonForNotUsingAi || '', status: selectedRecord.status,
      });
    }
  }, [selectedRecord]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        promptCount: data.promptCount ? parseInt(data.promptCount) : 0,
        estimatedTime: parseFloat(data.estimatedTime),
        aiUsageTime: data.aiUsageTime ? parseFloat(data.aiUsageTime) : 0,
        reviewTime: data.reviewTime ? parseFloat(data.reviewTime) : 0,
        reworkTime: data.reworkTime ? parseFloat(data.reworkTime) : 0,
        actualTimeSpent: parseFloat(data.actualTimeSpent),
      };
      if (isEditing) {
        await dispatch(updateAiUsageThunk({ id: recordId!, data: payload })).unwrap();
        Alert.alert('Success', 'Record updated');
      } else {
        await dispatch(createAiUsageThunk(payload)).unwrap();
        Alert.alert('Success', 'AI usage logged');
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e || 'Failed to save'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? '✏️ Edit AI Usage' : '🤖 Log AI Usage'}</Text>

      {/* Project */}
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

      <Controller control={control} name="jiraId" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Jira ID" placeholder="e.g. CON-19253 (optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} autoCapitalize="characters" />
      )} />

      {/* SDLC Phase */}
      <Text style={styles.label}>SDLC Phase *</Text>
      <Controller control={control} name="sdlcPhase" render={({ field: { onChange, value } }) => (
        <View style={styles.chipRow}>
          {SDLC_PHASES.map(phase => (
            <TouchableOpacity key={phase} style={[styles.chip, value === phase && styles.chipActive]} onPress={() => onChange(phase)}>
              <Text style={[styles.chipText, value === phase && { color: '#fff' }]}>{phase}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />
      {errors.sdlcPhase && <Text style={styles.error}>{errors.sdlcPhase.message}</Text>}

      {/* Used AI toggle */}
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.label}>Used AI?</Text>
          <Text style={styles.toggleSubtitle}>Did you use AI for this task?</Text>
        </View>
        <Controller control={control} name="usedAi" render={({ field: { onChange, value } }) => (
          <Switch value={value} onValueChange={onChange} trackColor={{ false: LightColors.border, true: LightColors.success }} thumbColor={value ? '#fff' : '#fff'} />
        )} />
      </View>

      {/* AI Tool - show when usedAi is true */}
      {usedAi && (
        <>
          <Text style={styles.label}>AI Tool Used</Text>
          <Controller control={control} name="toolUsed" render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {AI_TOOLS.map(tool => (
                <TouchableOpacity key={tool} style={[styles.chip, value === tool && styles.chipActive]} onPress={() => onChange(tool)}>
                  <Text style={[styles.chipText, value === tool && { color: '#fff' }]}>{tool}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )} />

          <Controller control={control} name="promptCount" render={({ field: { onChange, onBlur, value } }) => (
            <AppInput label="Number of Prompts" placeholder="0" value={value || ''} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" />
          )} />
        </>
      )}

      {!usedAi && (
        <Controller control={control} name="reasonForNotUsingAi" render={({ field: { onChange, onBlur, value } }) => (
          <AppInput label="Reason for Not Using AI" placeholder="Why wasn't AI used?" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={2} />
        )} />
      )}

      <Controller control={control} name="useCaseDetails" render={({ field: { onChange, onBlur, value } }) => (
        <AppInput label="Use Case Details" placeholder="Describe the task..." value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={2} />
      )} />

      {/* Time Tracking */}
      <Text style={styles.sectionHeader}>⏱️ Time Tracking (Hours)</Text>

      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <Controller control={control} name="estimatedTime" render={({ field: { onChange, onBlur, value } }) => (
            <AppInput label="Estimated Time *" placeholder="8.0" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" error={errors.estimatedTime?.message} />
          )} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Controller control={control} name="actualTimeSpent" render={({ field: { onChange, onBlur, value } }) => (
            <AppInput label="Actual Time *" placeholder="3.5" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" error={errors.actualTimeSpent?.message} />
          )} />
        </View>
      </View>

      {usedAi && (
        <View style={styles.timeRow}>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="aiUsageTime" render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="AI Usage Time" placeholder="2.0" value={value || ''} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" />
            )} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Controller control={control} name="reviewTime" render={({ field: { onChange, onBlur, value } }) => (
              <AppInput label="Review Time" placeholder="0.5" value={value || ''} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" />
            )} />
          </View>
        </View>
      )}

      <Text style={styles.label}>Status</Text>
      <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
        <View style={styles.chipRow}>
          {['Draft', 'Submitted', 'Reviewed', 'Approved'].map(s => (
            <TouchableOpacity key={s} style={[styles.chip, value === s && styles.chipActive]} onPress={() => onChange(s)}>
              <Text style={[styles.chipText, value === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />

      <View style={styles.btns}>
        <AppButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <AppButton title={isEditing ? 'Update Record' : 'Log AI Usage'} onPress={handleSubmit(onSubmit)} loading={isLoading} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: LightColors.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: LightColors.text, marginBottom: 8 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: LightColors.text, marginTop: 8, marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: LightColors.divider },
  chipScroll: { marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LightColors.border, marginRight: 4, marginBottom: 4 },
  chipActive: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  chipText: { fontSize: 12, color: LightColors.textSecondary, fontWeight: '500' },
  error: { fontSize: 12, color: LightColors.error, marginTop: -12, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: LightColors.surface, borderRadius: 12, padding: 14, marginBottom: 16, elevation: 1 },
  toggleSubtitle: { fontSize: 12, color: LightColors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row' },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

export default AiUsageFormScreen;
