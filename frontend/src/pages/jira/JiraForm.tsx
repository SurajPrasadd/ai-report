import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createJiraStoryThunk, updateJiraStoryThunk, fetchJiraByIdThunk } from '@/store/slices/jiraSlice';
import { JIRA_STATUSES, JIRA_PRIORITIES } from '@/utils/constants';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const schema = yup.object({
  jiraId: yup.string().required('Required'), summary: yup.string().required('Required'),
  description: yup.string().optional(), acceptanceCriteria: yup.string().optional(),
  status: yup.string().default('To Do'), priority: yup.string().default('Medium'),
  storyPoints: yup.number().optional().nullable(), projectId: yup.string().required('Required'),
  sprintId: yup.string().optional(), epicKey: yup.string().optional(),
});
type FormData = yup.InferType<typeof schema>;

interface Props { isOpen: boolean; onClose: () => void; storyId?: string; onSuccess: () => void; }

const JiraForm: React.FC<Props> = ({ isOpen, onClose, storyId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { selected, isLoading } = useAppSelector(s => s.jira);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema), defaultValues: { status: 'To Do', priority: 'Medium' },
  });

  useEffect(() => {
    if (storyId) dispatch(fetchJiraByIdThunk(storyId));
    else reset({ status: 'To Do', priority: 'Medium' });
  }, [storyId]);

  useEffect(() => {
    if (storyId && selected) {
      reset({ jiraId: selected.jiraId, summary: selected.summary, description: selected.description ?? '', acceptanceCriteria: selected.acceptanceCriteria ?? '', status: selected.status, priority: selected.priority, storyPoints: selected.storyPoints ?? null, projectId: selected.projectId, sprintId: selected.sprintId ?? '', epicKey: selected.epicKey ?? '' });
    }
  }, [selected, storyId]);

  const onSubmit = async (data: FormData) => {
    try {
      if (storyId) { await dispatch(updateJiraStoryThunk({ id: storyId, data })).unwrap(); toast.success('Story updated'); }
      else { await dispatch(createJiraStoryThunk(data)).unwrap(); toast.success('Story created'); }
      onSuccess();
    } catch (e: any) { toast.error(e || 'Failed'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={storyId ? 'Edit Story' : 'New Jira Story'} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={isLoading} onClick={handleSubmit(onSubmit)}>{storyId ? 'Update' : 'Create'}</Button></>}>
      <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Jira ID" required placeholder="e.g. CON-19253" error={errors.jiraId?.message} {...register('jiraId')} disabled={!!storyId} />
        <Input label="Epic Key" placeholder="e.g. CON-100" {...register('epicKey')} />
        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Summary" required placeholder="User story summary" error={errors.summary?.message} rows={2} {...register('summary')} />
        </div>
        <Select label="Project" required options={projects.map(p => ({ value: p.id, label: p.projectName }))} error={errors.projectId?.message} {...register('projectId')} placeholder="Select project" />
        <Select label="Sprint" options={sprints.map(s => ({ value: s.id, label: s.sprintName }))} {...register('sprintId')} placeholder="No sprint" />
        <Select label="Status" options={JIRA_STATUSES.map(s => ({ value: s, label: s }))} {...register('status')} />
        <Select label="Priority" options={JIRA_PRIORITIES.map(p => ({ value: p, label: p }))} {...register('priority')} />
        <Input label="Story Points" type="number" placeholder="0" {...register('storyPoints')} />
        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Description" placeholder="Story description…" {...register('description')} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Acceptance Criteria" placeholder="Given… When… Then…" {...register('acceptanceCriteria')} />
        </div>
      </form>
    </Modal>
  );
};

export default JiraForm;
