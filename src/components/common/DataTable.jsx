import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ExportService } from '../../services/exportService';
import { EmptyState } from './EmptyState';

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  enableExport = true,
  exportFileName = 'data_export',
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  rowKey = 'id',
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  filterComponent,
  emptyTitle,
  emptyDescription,
  actions
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        if (searchKeys.length > 0) {
          return searchKeys.some(key => {
            const val = item[key];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
          });
        }
        // Fallback: search all values
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(term);
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const headers = columns.map(c => ({ key: c.key, label: c.header }));
    ExportService.exportToCsv(exportFileName, filteredData, headers);
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map(r => r[rowKey]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectionChange) return;
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter(rId => rId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedRows.includes(r[rowKey]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', height: '36px' }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {filterComponent}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {actions}
          {enableExport && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExport}
              title="Export visible data to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map(col => {
                const isSortable = col.sortable !== false;
                const isSorted = sortColumn === col.key;

                return (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <span style={{ color: isSorted ? '#0f766e' : '#cbd5e1' }}>
                          {isSorted ? (
                            sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => {
                const isSelected = selectedRows.includes(row[rowKey]);
                return (
                  <tr
                    key={row[rowKey]}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected ? '#f0fdfa' : undefined
                    }}
                  >
                    {selectable && (
                      <td
                        style={{ textAlign: 'center' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row[rowKey])}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: '2rem' }}>
                  <EmptyState
                    title={emptyTitle || 'No matching records'}
                    description={emptyDescription || (searchTerm ? `No results found for "${searchTerm}".` : 'No data currently in this view.')}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: '#64748b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Showing</span>
          <select
            className="form-select"
            style={{ width: '70px', height: '30px', padding: '0 0.5rem', fontSize: '0.8rem' }}
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {pageSizeOptions.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          <span>per page • Total <strong>{filteredData.length}</strong> items</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Page {currentPage} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
