import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSprintThunk, updateSprintThunk } from '@/store/slices/sprintSlice';
import { SPRINT_STATUSES } from '@/utils/constants';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const schema = yup.object({
  sprintName: yup.string().required('Required'),
  jiraSprintId: yup.string().optional(),
  projectId: yup.string().required('Required'),
  startDate: yup.string().required('Required'),
  endDate: yup.string().required('Required'),
  status: yup.string().default('Planned'),
  goal: yup.string().optional(),
});
type FormData = yup.InferType<typeof schema>;

interface Props { isOpen: boolean; onClose: () => void; sprintId?: string; onSuccess: () => void; }

const SprintForm: React.FC<Props> = ({ isOpen, onClose, sprintId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { sprints, isLoading } = useAppSelector(s => s.sprints);
  const { projects } = useAppSelector(s => s.projects);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema), defaultValues: { status: 'Planned' },
  });

  useEffect(() => {
    if (sprintId) {
      const sprint = sprints.find(s => s.id === sprintId);
      if (sprint) reset({ sprintName: sprint.sprintName, jiraSprintId: sprint.jiraSprintId ?? '', projectId: sprint.projectId, startDate: sprint.startDate?.split('T')[0] ?? '', endDate: sprint.endDate?.split('T')[0] ?? '', status: sprint.status, goal: sprint.goal ?? '' });
    } else reset({ status: 'Planned' });
  }, [sprintId, sprints]);

  const onSubmit = async (data: FormData) => {
    try {
      if (sprintId) { await dispatch(updateSprintThunk({ id: sprintId, data })).unwrap(); toast.success('Sprint updated'); }
      else { await dispatch(createSprintThunk(data)).unwrap(); toast.success('Sprint created'); }
      onSuccess();
    } catch (e: any) { toast.error(e || 'Failed'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={sprintId ? 'Edit Sprint' : 'New Sprint'} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={isLoading} onClick={handleSubmit(onSubmit)}>{sprintId ? 'Update' : 'Create'}</Button></>}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Sprint Name" required placeholder="e.g. Sprint 1" error={errors.sprintName?.message} {...register('sprintName')} />
        <Input label="Jira Sprint ID" placeholder="JIRA-SPR-001 (optional)" {...register('jiraSprintId')} />
        <Select label="Project" required options={projects.map(p => ({ value: p.id, label: p.projectName }))} error={errors.projectId?.message} {...register('projectId')} placeholder="Select project" />
        <Select label="Status" required options={SPRINT_STATUSES.map(s => ({ value: s, label: s }))} {...register('status')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Start Date" required type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="End Date" required type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <Textarea label="Sprint Goal" placeholder="What do you want to achieve?" {...register('goal')} />
      </form>
    </Modal>
  );
};

export default SprintForm;
