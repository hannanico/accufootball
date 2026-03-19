// StatusFilter.tsx
type Props = {
  active: string;
  onChange: (value: string) => void;
  t: (key: string) => string;  
};

// Change labels to use t()
const STATUS_FILTERS = [
  { value: "all",      labelKey: "all"      },
  { value: "live",     labelKey: "live"     },
  { value: "finished", labelKey: "finished" },
  { value: "upcoming", labelKey: "upcoming" },
] as const;

export default function StatusFilter({ active, onChange, t }: Props) {
  return (
    <div className="flex gap-2 mb-4">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg border transition-colors ${
            active === f.value
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-gray-400 border-[#3a3a3a]"
          }`}
        >
          {f.value === "live" ? `${t(f.labelKey)} 🔴` : t(f.labelKey)}
        </button>
      ))}
    </div>
  );
}
