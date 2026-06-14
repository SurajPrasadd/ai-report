import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProjectThunk, updateProjectThunk, fetchProjectByIdThunk } from '@/store/slices/projectSlice';
import { PROJECT_STATUSES } from '@/utils/constants';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import styles from './Projects.module.css';

const schema = yup.object({
  projectCode: yup.string().required('Required').max(20),
  projectName: yup.string().required('Required').max(255),
  description: yup.string().optional(),
  status: yup.string().required('Required'),
  startDate: yup.string().required('Required'),
  endDate: yup.string().optional(),
  jiraProjectKey: yup.string().optional(),
});
type FormData = yup.InferType<typeof schema>;

interface Props { isOpen: boolean; onClose: () => void; projectId?: string; onSuccess: () => void; }

const ProjectForm: React.FC<Props> = ({ isOpen, onClose, projectId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { selected, isLoading } = useAppSelector(s => s.projects);
  const isEdit = !!projectId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { status: 'Active' },
  });

  useEffect(() => {
    if (projectId) dispatch(fetchProjectByIdThunk(projectId));
    else reset({ status: 'Active' });
  }, [projectId]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        projectCode: selected.projectCode, projectName: selected.projectName,
        description: selected.description ?? '', status: selected.status,
        startDate: selected.startDate?.split('T')[0] ?? '',
        endDate: selected.endDate?.split('T')[0] ?? '',
        jiraProjectKey: selected.jiraProjectKey ?? '',
      });
    }
  }, [selected, isEdit]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await dispatch(updateProjectThunk({ id: projectId!, data })).unwrap();
        toast.success('Project updated successfully');
      } else {
        await dispatch(createProjectThunk(data)).unwrap();
        toast.success('Project created successfully');
      }
      onSuccess();
    } catch (e: any) { toast.error(e || 'Failed'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'Create New Project'} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={isLoading} onClick={handleSubmit(onSubmit)}>{isEdit ? 'Update' : 'Create'} Project</Button></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <Input label="Project Code" required placeholder="e.g. CON" error={errors.projectCode?.message}
            {...register('projectCode')} disabled={isEdit} />
          <Input label="Project Name" required placeholder="Enter project name" error={errors.projectName?.message}
            {...register('projectName')} />
          <div className={styles.formFull}>
            <Textarea label="Description" placeholder="Project description…" error={errors.description?.message}
              {...register('description')} />
          </div>
          <Select label="Status" required options={PROJECT_STATUSES.map(s => ({ value: s, label: s }))}
            error={errors.status?.message} {...register('status')} />
          <Input label="Jira Project Key" placeholder="e.g. CON" error={errors.jiraProjectKey?.message}
            {...register('jiraProjectKey')} />
          <Input label="Start Date" required type="date" error={errors.startDate?.message}
            {...register('startDate')} />
          <Input label="End Date" type="date" error={errors.endDate?.message}
            {...register('endDate')} />
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
