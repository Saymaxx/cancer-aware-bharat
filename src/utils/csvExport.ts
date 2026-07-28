// The "build a CSV string -> encode -> temp <a> -> click -> remove" dance
// was copy-pasted verbatim 10 times across AdminDashboard.tsx and
// SuperAdminDashboard.tsx, differing only in headers/rows/filename. This
// is the one piece that was actually identical everywhere; the
// header/row-building logic stays at each call site since that's
// genuinely different per dataset.

// Matches the escaping idiom every call site already used inline:
// wrap in quotes and double up any embedded quotes.
export function csvCell(value: string | null | undefined): string {
  return `"${(value || '').replace(/"/g, '""')}"`;
}

export function downloadCsv(headers: string[], rows: (string | number)[][], filenamePrefix: string): void {
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
