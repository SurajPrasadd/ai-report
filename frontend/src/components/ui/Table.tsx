import React from 'react';
import styles from './Table.module.css';
import { PaginationMeta } from '@/types';
import Button from './Button';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

function Table<T>({ columns, data, isLoading, pagination, onPageChange, emptyMessage = 'No data found.', rowKey, onRowClick }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }} className={styles.th}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className={styles.td}><div className={styles.skeleton} /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  <div className={styles.emptyContent}>
                    <span className={styles.emptyIcon}>📭</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr
                  key={rowKey(row)}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className={styles.td}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className={styles.paginationControls}>
            <Button variant="ghost" size="sm" icon={<FiChevronLeft />} disabled={!pagination.hasPrev} onClick={() => onPageChange?.(pagination.page - 1)} />
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = Math.max(1, pagination.page - 2) + i;
              if (p > pagination.totalPages) return null;
              return (
                <button key={p} className={`${styles.pageBtn} ${p === pagination.page ? styles.pageBtnActive : ''}`} onClick={() => onPageChange?.(p)}>{p}</button>
              );
            })}
            <Button variant="ghost" size="sm" icon={<FiChevronRight />} disabled={!pagination.hasNext} onClick={() => onPageChange?.(pagination.page + 1)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
