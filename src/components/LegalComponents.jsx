export function DocSection({ id, number, title, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-300">{number}</p>
      <h2 className="mb-4 flex items-center gap-3 text-2xl font-black tracking-tight text-stone-900 dark:text-slate-100">
        <span className="relative top-0.5 inline-block h-0.5 w-5 flex-shrink-0 bg-orange-600 dark:bg-orange-300" />
        {title}
      </h2>
      <div className="space-y-3 text-[0.94rem] leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

export function Callout({ variant = "teal", children }) {
  const styles = {
    teal: "border-l-[3px] border-orange-600 bg-orange-50 text-stone-900 dark:border-orange-300 dark:bg-zinc-900 dark:text-slate-100",
    gold: "border-l-[3px] border-amber-500 bg-amber-50 text-stone-900 dark:border-amber-300 dark:bg-zinc-900 dark:text-slate-100",
  };

  return <div className={`${styles[variant]} my-4 rounded-r-lg px-4 py-3 text-sm`}>{children}</div>;
}

export function MetaBadge({ children, variant = "default" }) {
  const styles = {
    default: "border-stone-300 bg-stone-100 text-stone-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300",
    teal: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-zinc-900 dark:text-orange-300",
  };

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function ContactHighlight({ children }) {
  return (
    <div className="mt-4 rounded-xl border border-stone-300 bg-stone-50 px-5 py-4 text-sm leading-relaxed text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300">
      {children}
    </div>
  );
}

export function DocTable({ headers, rows }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b-2 border-stone-300 bg-stone-100 px-3 py-2 text-left text-xs font-semibold tracking-wide text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-stone-200 last:border-0 dark:border-zinc-800">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="align-top px-3 py-2.5 text-slate-700 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
