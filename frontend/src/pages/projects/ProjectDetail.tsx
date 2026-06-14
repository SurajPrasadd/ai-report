import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiUsers, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjectByIdThunk } from '@/store/slices/projectSlice';
import { fetchEmployeesThunk } from '@/store/slices/employeeSlice';
import api from '@/services/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { formatDate, getInitials } from '@/utils/helpers';
import { PROJECT_ROLES } from '@/utils/constants';
import ProjectForm from './ProjectForm';
import styles from './Projects.module.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { selected, isLoading } = useAppSelector(s => s.projects);
  const { employees } = useAppSelector(s => s.employees);

  const [showEdit, setShowEdit] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [pmHistory, setPmHistory] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPmModal, setShowPmModal] = useState(false);
  const [assignEmp, setAssignEmp] = useState('');
  const [assignRole, setAssignRole] = useState('Developer');
  const [assignPm, setAssignPm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectByIdThunk(id));
      dispatch(fetchEmployeesThunk({ limit: 100 }));
      loadTeam();
      loadPmHistory();
    }
  }, [id]);

  const loadTeam = async () => {
    try { const r = await api.get(`/projects/employee/team/${id}`); setTeamMembers(r.data.data ?? []); } catch {}
  };

  const loadPmHistory = async () => {
    try { const r = await api.get(`/projects/manager/history/${id}`); setPmHistory(r.data.data ?? []); } catch {}
  };

  const handleAssignEmployee = async () => {
    if (!assignEmp) return;
    setSaving(true);
    try {
      await api.post('/projects/employee/assign', { employeeId: assignEmp, projectId: id, role: assignRole });
      toast.success('Employee assigned'); setShowAssignModal(false); loadTeam();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAssignPm = async () => {
    if (!assignPm) return;
    setSaving(true);
    try {
      await api.post('/projects/manager/assign', { projectId: id, managerId: assignPm, assignedDate: new Date() });
      toast.success('PM assigned'); setShowPmModal(false); dispatch(fetchProjectByIdThunk(id!)); loadPmHistory();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRemoveEmployee = async (empId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this project?`)) return;
    try { await api.delete(`/projects/employee/${empId}/${id}`); toast.success('Removed'); loadTeam(); } catch { toast.error('Failed'); }
  };

  if (isLoading || !selected) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const defaultTab = searchParams.get('tab') || 'overview';
  const pms = employees.filter(e => ['PM', 'Admin'].includes(e.role));

  return (
    <div>
      <Button variant="ghost" icon={<FiArrowLeft />} onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>Back to Projects</Button>

      <div className={styles.detailHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.detailCode}>{selected.projectCode}</div>
            <div className={styles.detailTitle}>{selected.projectName}</div>
            {selected.description && <div className={styles.detailDesc}>{selected.description}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge status={selected.status} />
            <Button size="sm" variant="outline" icon={<FiEdit2 />} onClick={() => setShowEdit(true)} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Edit</Button>
          </div>
        </div>
      </div>

      <Tabs tabs={[
        { key: 'overview', label: 'Overview' },
        { key: 'team', label: `Team (${teamMembers.length})`, icon: <FiUsers /> },
        { key: 'manager', label: 'PM History', icon: <FiUserCheck /> },
      ]} defaultTab={defaultTab}>
        {activeTab => (
          <>
            {activeTab === 'overview' && (
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <div className={styles.detailCardTitle}>Project Details</div>
                  {[
                    { label: 'Project Manager', value: selected.pmName ?? '—' },
                    { label: 'Start Date', value: formatDate(selected.startDate) },
                    { label: 'End Date', value: formatDate(selected.endDate) || 'Ongoing' },
                    { label: 'Jira Key', value: selected.jiraProjectKey ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>{label}</span>
                      <span className={styles.fieldValue}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.detailCard}>
                  <div className={styles.detailCardTitle}>Quick Stats</div>
                  {[
                    { label: 'Team Members', value: String(teamMembers.length) },
                    { label: 'PM Assignments', value: String(pmHistory.length) },
                  ].map(({ label, value }) => (
                    <div key={label} className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>{label}</span>
                      <span className={styles.fieldValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <span className={styles.teamTitle}>Team Members ({teamMembers.length})</span>
                  <Button size="sm" icon={<FiUsers />} onClick={() => setShowAssignModal(true)}>Assign Employee</Button>
                </div>
                {teamMembers.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No team members yet</div>
                ) : (
                  teamMembers.map((m: any, i: number) => (
                    <div key={i} className={styles.memberRow}>
                      <div className={styles.memberAvatar}>{getInitials(m.employee_name?.split(' ')[0] || 'U', m.employee_name?.split(' ')[1] || '')}</div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{m.employee_name}</div>
                        <div className={styles.memberEmail}>{m.email}</div>
                      </div>
                      <Badge status={m.role} />
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveEmployee(m.employee_id, m.employee_name)} style={{ color: 'var(--error)', marginLeft: 8 }}>Remove</Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'manager' && (
              <div className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <span className={styles.teamTitle}>PM Assignment History</span>
                  <Button size="sm" icon={<FiUserCheck />} onClick={() => setShowPmModal(true)}>Assign PM</Button>
                </div>
                {pmHistory.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No PM assignments</div>
                ) : (
                  pmHistory.map((h: any, i: number) => (
                    <div key={i} className={styles.memberRow}>
                      <div className={styles.memberAvatar}>{getInitials(h.manager_name?.split(' ')[0] || 'U', h.manager_name?.split(' ')[1] || '')}</div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{h.manager_name}</div>
                        <div className={styles.memberEmail}>{h.manager_email}</div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(h.assigned_date)}</span>
                      {h.is_active && <Badge status="Active" size="sm" />}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </Tabs>

      {showEdit && <ProjectForm isOpen={showEdit} onClose={() => setShowEdit(false)} projectId={selected.id} onSuccess={() => { setShowEdit(false); dispatch(fetchProjectByIdThunk(id!)); }} />}

      {/* Assign Employee Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Employee" size="sm"
        footer={<><Button variant="ghost" onClick={() => setShowAssignModal(false)}>Cancel</Button><Button loading={saving} onClick={handleAssignEmployee}>Assign</Button></>}>
        <Select label="Employee" required options={employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.role})` }))}
          value={assignEmp} onChange={e => setAssignEmp(e.target.value)} placeholder="Select employee" />
        <div style={{ marginTop: 14 }}>
          <Select label="Role" required options={PROJECT_ROLES.map(r => ({ value: r, label: r }))}
            value={assignRole} onChange={e => setAssignRole(e.target.value)} />
        </div>
      </Modal>

      {/* Assign PM Modal */}
      <Modal isOpen={showPmModal} onClose={() => setShowPmModal(false)} title="Assign Project Manager" size="sm"
        footer={<><Button variant="ghost" onClick={() => setShowPmModal(false)}>Cancel</Button><Button loading={saving} onClick={handleAssignPm}>Assign</Button></>}>
        <Select label="Project Manager" required options={pms.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
          value={assignPm} onChange={e => setAssignPm(e.target.value)} placeholder="Select PM" />
      </Modal>
    </div>
  );
};

export default ProjectDetail;
