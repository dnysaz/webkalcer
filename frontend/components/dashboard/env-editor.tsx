"use client";

export function EnvEditor({
  rows,
  onChange,
}: {
  rows: { key: string; value: string }[];
  onChange: (rows: { key: string; value: string }[]) => void;
}) {
  const validKey = (k: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);

  return (
    <div className="mt-8">
      <p className="text-base font-medium">Environment variables (opsional)</p>
      <div className="mt-3 space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={row.key}
              placeholder="KEY"
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...next[i], key: e.target.value.toUpperCase() };
                onChange(next);
              }}
              className={`w-full rounded-2xl border px-4 py-2 font-mono text-base outline-none sm:flex-1 ${
                row.key && !validKey(row.key)
                  ? "border-red"
                  : "border-line focus:border-blue"
              }`}
            />
            <input
              type="text"
              value={row.value}
              placeholder="nilai"
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...next[i], value: e.target.value };
                onChange(next);
              }}
              className="w-full rounded-2xl border border-line px-4 py-2 font-mono text-base outline-none focus:border-blue sm:flex-1"
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label="Hapus baris"
              className="grid h-11 w-11 place-items-center self-end rounded-full bg-soft text-mute hover:bg-line sm:self-auto"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
        className="mt-3 text-base font-medium text-blue hover:underline"
      >
        + Tambah env var
      </button>
    </div>
  );
}
