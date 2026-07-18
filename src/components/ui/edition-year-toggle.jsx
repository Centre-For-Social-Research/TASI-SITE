'use client';

export default function EditionYearToggle({ year, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
      {['2025', '2026'].map((value) => {
        const active = year === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
              active
                ? 'bg-[#fff] text-[#140f26]'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
