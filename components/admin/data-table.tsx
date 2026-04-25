type DataTableColumn = {
  key: string;
  label: string;
  className?: string;
};

type DataTableRow = Record<string, React.ReactNode>;

type DataTableProps = {
  title: string;
  description?: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
};

export function DataTable({
  title,
  description,
  columns,
  rows
}: DataTableProps) {
  return (
    <section className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #edf1f6" }}>
        <h2 style={{ margin: 0, fontSize: 16, lineHeight: "24px" }}>{title}</h2>
        {description ? (
          <p className="section-subtitle" style={{ marginTop: 6 }}>
            {description}
          </p>
        ) : null}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

