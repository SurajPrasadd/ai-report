import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiUpload, FiInfo } from 'react-icons/fi';
import { useAppSelector } from '@/store/hooks';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import styles from './Excel.module.css';

const SHEET1_COLS = ['Jira ID', 'User Story Details (Summary)', 'Resource Name', 'Used AI? (Dev)', 'User Story Creation (BA)', 'Sol Document', 'Code Generation', 'Code Review', 'Unit Testing', 'Test Case Generation (QA)', 'Reason for not using AI'];
const SHEET2_COLS = ['Project Name', 'PM Name', 'User Story ID', 'JIRA ID (AI)', 'Use Case Details', 'User Story Details', 'SDLC Phase', 'Use Case', 'Inputs Given', 'Tool Used', 'No of Re-Prompts', 'Estimated Time (Hrs)', 'AI Usage Time (Hrs)', 'Review Time (Hrs)', 'Rework Time (Hrs)', 'Reporting Time', 'Actual Time Spent', 'Actual Effort Saved (Hrs)', 'Actual Effort Saved (%)', 'Saved Capacity Usage', 'Reason for Missing Effort', 'Actual Coverage', 'Coverage Remarks', 'Actual Accuracy', 'Accuracy Remarks', 'TrueSDLC Coverage', 'TrueSDLC Accuracy', 'TrueSDLC Effort Saved', 'TrueSDLC Effort Saved %', 'Comparison Remarks', 'No Of Resources', 'Resource Name', 'Updates', 'Status', 'Reviewer Name', '100% Coverage & Accuracy Approach'];

const ExcelExport: React.FC = () => {
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);
  const [projectFilter, setProjectFilter] = useState('');
  const [sprintFilter, setSprintFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeSheet, setActiveSheet] = useState<1 | 2>(1);

  const filteredSprints = projectFilter ? sprints.filter(s => s.projectId === projectFilter) : sprints;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {};
      if (projectFilter) params.projectId = projectFilter;
      if (sprintFilter) params.sprintId = sprintFilter;

      const response = await api.get('/excel/export/ai-report', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a');
      a.href = url; a.download = `AI_Productivity_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    } catch { toast.error('Export failed. Please try again.'); }
    finally { setIsExporting(false); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    setIsImporting(true);
    try {
      const r = await api.post('/excel/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Imported ${r.data.data.imported} records`);
    } catch { toast.error('Import failed'); } finally { setIsImporting(false); e.target.value = ''; }
  };

  const selectStyle = { padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', minWidth: 180 };

  return (
    <div>
      <PageHeader title="Excel Export & Import" subtitle="Generate AI productivity reports in Excel format" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Export */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: '#e3f2fd' }}>📊</div>
            <div>
              <h3 className={styles.cardTitle}>Export Report</h3>
              <p className={styles.cardSubtitle}>Download AI usage data as Excel (.xlsx)</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p className={styles.sectionLabel}>Filters (Optional)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setSprintFilter(''); }} style={selectStyle}>
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
              <select value={sprintFilter} onChange={e => setSprintFilter(e.target.value)} style={selectStyle}>
                <option value="">All Sprints</option>
                {filteredSprints.map(s => <option key={s.id} value={s.id}>{s.sprintName}</option>)}
              </select>
            </div>
          </div>

          <Button icon={<FiDownload />} loading={isExporting} onClick={handleExport} style={{ width: '100%' }}>
            Download Excel Report
          </Button>
        </div>

        {/* Import */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: '#e8f5e9' }}>📥</div>
            <div>
              <h3 className={styles.cardTitle}>Import Data</h3>
              <p className={styles.cardSubtitle}>Upload Excel file to import AI usage records</p>
            </div>
          </div>

          <div className={styles.uploadZone}>
            <input type="file" accept=".xlsx,.xls" id="excel-upload" style={{ display: 'none' }} onChange={handleImport} />
            <label htmlFor="excel-upload" className={styles.uploadLabel}>
              <FiUpload style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 8 }} />
              <span className={styles.uploadText}>Click to upload Excel file</span>
              <span className={styles.uploadHint}>.xlsx or .xls supported, max 10MB</span>
            </label>
          </div>

          {isImporting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--info-light)', borderRadius: 8, marginTop: 12 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--info)' }}>Importing records…</span>
            </div>
          )}
        </div>
      </div>

      {/* Sheet Preview */}
      <div className={styles.previewCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Report Structure Preview</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {([1, 2] as const).map(n => (
              <button key={n} onClick={() => setActiveSheet(n)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: activeSheet === n ? 'var(--primary)' : 'var(--border)', background: activeSheet === n ? 'var(--primary)' : 'transparent', color: activeSheet === n ? '#fff' : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                Sheet {n}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sheetInfo}>
          <div className={styles.sheetBadge} style={{ background: activeSheet === 1 ? '#e3f2fd' : '#e8f5e9', color: activeSheet === 1 ? '#1976d2' : '#2e7d32' }}>
            {activeSheet === 1 ? '📋 AI Summary' : '📊 Detailed Metrics'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {activeSheet === 1 ? 'High-level AI usage per Jira story by SDLC phase' : 'Complete metrics including effort saved, coverage, accuracy and TrueSDLC values'}
          </p>
        </div>

        <div className={styles.columnGrid}>
          {(activeSheet === 1 ? SHEET1_COLS : SHEET2_COLS).map((col, i) => (
            <div key={i} className={styles.columnItem}>
              <span className={styles.columnIndex}>{i + 1}</span>
              <span className={styles.columnName}>{col}</span>
            </div>
          ))}
        </div>

        <div className={styles.sampleNote}>
          <FiInfo style={{ color: 'var(--info)', flexShrink: 0 }} />
          <span>Sample data (CON-19253, CON-19620) is included when no records match the filter.</span>
        </div>
      </div>
    </div>
  );
};

export default ExcelExport;
