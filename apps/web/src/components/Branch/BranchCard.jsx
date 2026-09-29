export default function BranchCard({ id, label, image, selected, onSelect }) {
  return (
    <button
      type="button"
            onClick={() => onSelect(id)}
  className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-sky-50 text-right
transition-all duration-300 ease-out
shadow-[0_0_35px_rgba(0,0,0,0.15)]
hover:scale-[1.04]
hover:shadow-[0_10px_45px_rgba(0,0,0,0.25)]
${
  selected
    ? "border-[#002C5A] shadow-[0_0_35px_rgba(0,44,90,0.25)]"
    : "border-transparent hover:border-slate-200"
}`}
    >
      <span
        className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-2xs transition-colors ${
          selected ? "border-[#002C5A]" : "border-slate-300"
        }`}
      >
        {selected && <span className="h-3 w-3 rounded-full bg-[#002C5A]" />}
      </span>
      <div className="relative h-72 w-full">
        <img
          src={image}
          alt={label}
          className="h-full w-full object-contain p-2 mt-8"
        />
      </div>
      <div className="py-3 text-center">
        <span className="font-Ubuntu text-lg font-bold text-[#002C5A]">{label}</span>
      </div>
    </button>
  );
}
