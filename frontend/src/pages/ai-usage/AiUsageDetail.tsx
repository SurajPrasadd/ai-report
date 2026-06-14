import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAiUsageByIdThunk } from '@/store/slices/aiUsageSlice';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatHours, formatPercent, formatDate } from '@/utils/helpers';
import AiUsageForm from './AiUsageForm';
import styles from '../projects/Projects.module.css';

const MetricBox: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 18px', textAlign: 'center', border: '1px solid var(--border)' }}>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: color ?? 'var(--text-primary)' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
  </div>
);

const AiUsageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected } = useAppSelector(s => s.aiUsage);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => { if (id) dispatch(fetchAiUsageByIdThunk(id)); }, [id]);

  if (!selected) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  const r = selected;

  return (
    <div>
      <Button variant="ghost" icon={<FiArrowLeft />} onClick={() => navigate('/ai-usage')} style={{ marginBottom: 16 }}>Back</Button>

      <div className={styles.detailHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.detailCode}>{r.jiraId || 'No Story ID'}</div>
            <div className={styles.detailTitle} style={{ fontSize: '1.3rem' }}>{r.sdlcPhase}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Badge status={r.status} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: r.usedAi ? '#a5f3a5' : '#fca5a5', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 9999 }}>
                {r.usedAi ? '🤖 AI Used' : '❌ No AI'}
              </span>
              {r.toolUsed && <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>🔧 {r.toolUsed}</span>}
            </div>
          </div>
          <Button size="sm" variant="outline" icon={<FiEdit2 />} onClick={() => setShowEdit(true)} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Edit</Button>
        </div>
      </div>

      {/* Effort metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricBox label="Estimated Time" value={formatHours(r.estimatedTime)} color="var(--info)" />
        <MetricBox label="Actual Time" value={formatHours(r.actualTimeSpent)} color="var(--warning)" />
        <MetricBox label="Effort Saved" value={formatHours(r.actualEffortSaved)} color="var(--success)" />
        <MetricBox label="Saved %" value={formatPercent(r.actualEffortSavedPct)} color="var(--success)" />
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Usage Details</div>
          {[
            { label: 'Project', value: r.projectName ?? '—' },
            { label: 'Sprint', value: r.sprintName ?? '—' },
            { label: 'Employee', value: r.employeeName ?? '—' },
            { label: 'Tool Used', value: r.toolUsed ?? '—' },
            { label: 'Prompt Count', value: String(r.promptCount) },
            { label: 'Re-Prompts', value: String(r.noOfReprompts) },
            { label: 'AI Usage Time', value: formatHours(r.aiUsageTime) },
            { label: 'Review Time', value: formatHours(r.reviewTime) },
            { label: 'Rework Time', value: formatHours(r.reworkTime) },
            { label: 'Reporting Date', value: formatDate(r.reportingDate) },
          ].map(({ label, value }) => (
            <div key={label} className={styles.fieldRow}><span className={styles.fieldLabel}>{label}</span><span className={styles.fieldValue}>{value}</span></div>
          ))}
        </div>
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Quality Metrics</div>
          {[
            { label: 'Coverage', value: formatPercent(r.actualCoverage) },
            { label: 'Accuracy', value: formatPercent(r.actualAccuracy) },
            { label: 'TrueSDLC Coverage', value: formatPercent(r.trueSdlcCoverage) },
            { label: 'TrueSDLC Accuracy', value: formatPercent(r.trueSdlcAccuracy) },
            { label: 'TrueSDLC Effort Saved', value: formatHours(r.trueSdlcEffortSaved) },
            { label: 'TrueSDLC Effort Saved %', value: formatPercent(r.trueSdlcEffortSavedPct) },
            { label: 'Resources', value: String(r.noOfResources) },
            { label: 'Reviewer', value: r.reviewerName ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className={styles.fieldRow}><span className={styles.fieldLabel}>{label}</span><span className={styles.fieldValue}>{value}</span></div>
          ))}
        </div>
        {(r.coverageRemarks || r.accuracyRemarks || r.reasonForNotUsingAi || r.comparisonRemarks) && (
          <div className={styles.detailCard} style={{ gridColumn: '1/-1' }}>
            <div className={styles.detailCardTitle}>Remarks</div>
            {r.coverageRemarks && <><div className={styles.fieldLabel} style={{ marginBottom: 4 }}>Coverage</div><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{r.coverageRemarks}</p></>}
            {r.accuracyRemarks && <><div className={styles.fieldLabel} style={{ marginBottom: 4 }}>Accuracy</div><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{r.accuracyRemarks}</p></>}
            {r.reasonForNotUsingAi && <><div className={styles.fieldLabel} style={{ marginBottom: 4 }}>Reason for Not Using AI</div><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.reasonForNotUsingAi}</p></>}
          </div>
        )}
      </div>

      {showEdit && <AiUsageForm isOpen={showEdit} onClose={() => setShowEdit(false)} recordId={r.id} onSuccess={() => { setShowEdit(false); dispatch(fetchAiUsageByIdThunk(id!)); }} />}
    </div>
  );
};

export default AiUsageDetail;
