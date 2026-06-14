import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createAiUsageThunk, updateAiUsageThunk, fetchAiUsageByIdThunk } from '@/store/slices/aiUsageSlice';
import { SDLC_PHASES, AI_TOOLS, AI_USAGE_STATUSES } from '@/utils/constants';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const schema = yup.object({
  jiraId: yup.string().optional(),
  projectId: yup.string().required('Project required'),
  sprintId: yup.string().optional(),
  sdlcPhase: yup.string().required('Phase required'),
  usedAi: yup.boolean().default(false),
  toolUsed: yup.string().optional(),
  promptCount: yup.number().default(0),
  noOfReprompts: yup.number().default(0),
  estimatedTime: yup.number().required('Required').min(0),
  aiUsageTime: yup.number().default(0),
  reviewTime: yup.number().default(0),
  reworkTime: yup.number().default(0),
  actualTimeSpent: yup.number().required('Required').min(0),
  reasonForNotUsingAi: yup.string().optional(),
  useCaseDetails: yup.string().optional(),
  actualCoverage: yup.number().default(0),
  actualAccuracy: yup.number().default(0),
  status: yup.string().default('Draft'),
  reportingDate: yup.string().optional(),
});
type FormData = yup.InferType<typeof schema>;

interface Props { isOpen: boolean; onClose: () => void; recordId?: string; onSuccess: () => void; prefillJiraId?: string; }

const AiUsageForm: React.FC<Props> = ({ isOpen, onClose, recordId, onSuccess, prefillJiraId }) => {
  const dispatch = useAppDispatch();
  const { selected, isLoading } = useAppSelector(s => s.aiUsage);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { usedAi: false, promptCount: 0, noOfReprompts: 0, estimatedTime: 0, aiUsageTime: 0, reviewTime: 0, reworkTime: 0, actualTimeSpent: 0, actualCoverage: 0, actualAccuracy: 0, status: 'Draft', jiraId: prefillJiraId ?? '' },
  });

  const usedAi = watch('usedAi');

  useEffect(() => {
    if (recordId) dispatch(fetchAiUsageByIdThunk(recordId));
    else reset({ usedAi: false, promptCount: 0, noOfReprompts: 0, estimatedTime: 0, aiUsageTime: 0, reviewTime: 0, reworkTime: 0, actualTimeSpent: 0, actualCoverage: 0, actualAccuracy: 0, status: 'Draft', jiraId: prefillJiraId ?? '' });
  }, [recordId]);

  useEffect(() => {
    if (recordId && selected) {
      reset({ jiraId: selected.jiraId ?? '', projectId: selected.projectId, sprintId: selected.sprintId ?? '', sdlcPhase: selected.sdlcPhase, usedAi: selected.usedAi, toolUsed: selected.toolUsed ?? '', promptCount: selected.promptCount, noOfReprompts: selected.noOfReprompts, estimatedTime: selected.estimatedTime, aiUsageTime: selected.aiUsageTime, reviewTime: selected.reviewTime, reworkTime: selected.reworkTime, actualTimeSpent: selected.actualTimeSpent, actualCoverage: selected.actualCoverage, actualAccuracy: selected.actualAccuracy, status: selected.status, reasonForNotUsingAi: selected.reasonForNotUsingAi ?? '', useCaseDetails: selected.useCaseDetails ?? '' });
    }
  }, [selected, recordId]);

  const onSubmit = async (data: FormData) => {
    try {
      if (recordId) { await dispatch(updateAiUsageThunk({ id: recordId, data })).unwrap(); toast.success('Record updated'); }
      else { await dispatch(createAiUsageThunk(data)).unwrap(); toast.success('AI usage logged'); }
      onSuccess();
    } catch (e: any) { toast.error(e || 'Failed'); }
  };

  const g = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recordId ? 'Edit AI Usage' : 'Log AI Usage'} size="xl"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={isLoading} onClick={handleSubmit(onSubmit)}>{recordId ? 'Update' : 'Log'} Record</Button></>}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Context */}
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>Context</p>
          <div style={g}>
            <Input label="Jira ID" placeholder="e.g. CON-19253" {...register('jiraId')} />
            <Select label="Project" required options={projects.map(p => ({ value: p.id, label: p.projectName }))} error={errors.projectId?.message} {...register('projectId')} placeholder="Select project" />
            <Select label="Sprint" options={sprints.map(s => ({ value: s.id, label: s.sprintName }))} {...register('sprintId')} placeholder="No sprint" />
            <Select label="SDLC Phase" required options={SDLC_PHASES.map(p => ({ value: p, label: p }))} error={errors.sdlcPhase?.message} {...register('sdlcPhase')} placeholder="Select phase" />
          </div>
        </div>
        {/* AI Toggle */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Was AI Used?</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle if AI was used for this task</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" {...register('usedAi')} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <span style={{ fontWeight: 700, color: usedAi ? 'var(--success)' : 'var(--text-muted)' }}>{usedAi ? '✓ Yes' : 'No'}</span>
          </label>
        </div>
        {/* AI Details */}
        {usedAi && (
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>AI Details</p>
            <div style={g}>
              <Select label="Tool Used" options={AI_TOOLS.map(t => ({ value: t, label: t }))} {...register('toolUsed')} placeholder="Select tool" />
              <Input label="Prompt Count" type="number" min={0} {...register('promptCount')} />
              <Input label="No. of Re-Prompts" type="number" min={0} {...register('noOfReprompts')} />
              <Input label="AI Usage Time (hrs)" type="number" step="0.1" min={0} {...register('aiUsageTime')} />
              <Input label="Review Time (hrs)" type="number" step="0.1" min={0} {...register('reviewTime')} />
              <Input label="Rework Time (hrs)" type="number" step="0.1" min={0} {...register('reworkTime')} />
            </div>
          </div>
        )}
        {!usedAi && (
          <Textarea label="Reason for Not Using AI" placeholder="Explain why AI was not used…" {...register('reasonForNotUsingAi')} />
        )}
        {/* Time Tracking */}
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>⏱️ Time Tracking (Hours)</p>
          <div style={g}>
            <Input label="Estimated Time" required type="number" step="0.1" min={0} error={errors.estimatedTime?.message} {...register('estimatedTime')} />
            <Input label="Actual Time Spent" required type="number" step="0.1" min={0} error={errors.actualTimeSpent?.message} {...register('actualTimeSpent')} />
          </div>
        </div>
        {/* Quality */}
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>Quality Metrics</p>
          <div style={g}>
            <Input label="Coverage %" type="number" step="0.1" min={0} max={100} {...register('actualCoverage')} />
            <Input label="Accuracy %" type="number" step="0.1" min={0} max={100} {...register('actualAccuracy')} />
          </div>
        </div>
        {/* Status & notes */}
        <div style={g}>
          <Select label="Status" options={AI_USAGE_STATUSES.map(s => ({ value: s, label: s }))} {...register('status')} />
          <Input label="Reporting Date" type="date" {...register('reportingDate')} />
        </div>
        <Textarea label="Use Case Details" placeholder="Describe the task and how AI was used…" {...register('useCaseDetails')} />
      </form>
    </Modal>
  );
};

export default AiUsageForm;
