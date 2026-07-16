import { CheckCircle, Download, Filter } from 'lucide-react';

export const DATE_RANGE_OPTIONS = [
  { value: '7', label: 'Ultimos 7 dias' },
  { value: '30', label: 'Ultimos 30 dias' },
  { value: '365', label: 'Este ano' },
];

export const makeCsv = (headers, rows) => {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');
};

export const downloadCsv = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function SummaryControls({
  filterValue,
  filterOptions,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  onExport,
  exporting,
  exportSuccess,
}) {
  const normalizedFilterOptions = filterOptions.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));

  return (
    <div className="summary-controls">
      <div className="summary-select-wrap summary-select-filter">
        <Filter size={15} />
        <select value={filterValue} onChange={(event) => onFilterChange(event.target.value)}>
          {normalizedFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="summary-select-wrap summary-select-date">
        <select value={dateRange} onChange={(event) => onDateRangeChange(event.target.value)}>
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <button className={`summary-export-btn ${exportSuccess ? 'success' : ''}`} type="button" onClick={onExport} disabled={exporting}>
        {exporting ? (
          <span className="summary-export-spinner" />
        ) : exportSuccess ? (
          <CheckCircle size={16} />
        ) : (
          <Download size={16} />
        )}
        {exportSuccess ? 'Exportado' : 'Exportar CSV'}
      </button>
    </div>
  );
}
