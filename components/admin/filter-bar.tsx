type FilterField =
  | {
      id: string;
      label: string;
      type: "select";
      options: string[];
    }
  | {
      id: string;
      label: string;
      type: "input";
      inputType?: string;
    };

type FilterBarProps = {
  fields: FilterField[];
};

export function FilterBar({ fields }: FilterBarProps) {
  return (
    <section
      className="card"
      style={{
        padding: 16,
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
      }}
    >
      {fields.map((field) => (
        <div key={field.id}>
          <p className="field-label">{field.label}</p>
          {field.type === "select" ? (
            <select className="select-input" defaultValue={field.options[0]}>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input className="text-input" type={field.inputType ?? "text"} />
          )}
        </div>
      ))}
    </section>
  );
}

