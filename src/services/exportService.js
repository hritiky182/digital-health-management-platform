/**
 * CareAxis Data Export Service
 * Exports tabular data into CSV or JSON formatted downloads.
 */

export const ExportService = {
  exportToCsv(filename, rows = [], headers = []) {
    if (!rows || !rows.length) {
      alert('No data available to export.');
      return;
    }

    const columnKeys = headers.length > 0 ? headers.map(h => h.key) : Object.keys(rows[0]);
    const columnLabels = headers.length > 0 ? headers.map(h => h.label) : columnKeys;

    const csvContent = [
      columnLabels.join(','),
      ...rows.map(row => {
        return columnKeys.map(k => {
          let val = row[k];
          if (val === undefined || val === null) val = '';
          if (typeof val === 'object') val = JSON.stringify(val);
          // Escape quotes and commas
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',');
      })
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToJson(filename, data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
