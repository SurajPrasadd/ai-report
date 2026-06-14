import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiCpu } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJiraByIdThunk } from '@/store/slices/jiraSlice';
import { PRIORITY_COLORS } from '@/utils/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import JiraForm from './JiraForm';
import styles from '../projects/Projects.module.css';

const JiraDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected } = useAppSelector(s => s.jira);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => { if (id) dispatch(fetchJiraByIdThunk(id)); }, [id]);

  if (!selected) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  const s = selected;

  return (
    <div>
      <Button variant="ghost" icon={<FiArrowLeft />} onClick={() => navigate('/jira')} style={{ marginBottom: 16 }}>Back</Button>

      <div className={styles.detailHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.detailCode}>{s.jiraId}</div>
            <div className={styles.detailTitle} style={{ fontSize: '1.3rem' }}>{s.summary}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Badge status={s.status} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: PRIORITY_COLORS[s.priority], background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 9999 }}>⚡ {s.priority}</span>
              {s.storyPoints ? <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 9999 }}>{s.storyPoints} pts</span> : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="outline" icon={<FiEdit2 />} onClick={() => setShowEdit(true)} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Edit</Button>
            <Button size="sm" icon={<FiCpu />} onClick={() => navigate(`/ai-usage/new?jiraId=${s.jiraId}`)}>Log AI Usage</Button>
          </div>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Story Details</div>
          {[
            { label: 'Project', value: s.projectName },
            { label: 'Sprint', value: s.sprintName ?? '—' },
            { label: 'Assignee', value: s.assigneeName ?? '—' },
            { label: 'Reporter', value: s.reporter ?? '—' },
            { label: 'Epic', value: s.epicKey ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className={styles.fieldRow}><span className={styles.fieldLabel}>{label}</span><span className={styles.fieldValue}>{value}</span></div>
          ))}
        </div>
        <div className={styles.detailCard}>
          {s.description && <><div className={styles.detailCardTitle}>Description</div><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.description}</p></>}
        </div>
        {s.acceptanceCriteria && (
          <div className={styles.detailCard} style={{ gridColumn: '1/-1' }}>
            <div className={styles.detailCardTitle}>Acceptance Criteria</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.acceptanceCriteria}</p>
          </div>
        )}
      </div>

      {showEdit && <JiraForm isOpen={showEdit} onClose={() => setShowEdit(false)} storyId={s.id} onSuccess={() => { setShowEdit(false); dispatch(fetchJiraByIdThunk(id!)); }} />}
    </div>
  );
};

export default JiraDetail;
