type Props = {
  name: string;
  description: string;
  paramSizeLabel: string;
  quantLabel: string;
  selected?: boolean;
  className?: string;
};

export default function ModelCard({
  name,
  description,
  paramSizeLabel,
  quantLabel,
  selected = false,
  className = "",
}: Props) {
  return (
    <div
      className={[
        "w-[233px] h-[83px]",
        "rounded-[8px]",
        "px-3 py-2",
        "text-left",
        "transition",
        selected ? "bg-ui-sidebar-card ring-1 ring-ui-black/30" : "bg-ui-sidebar-card",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col">
        <div className="text-[14px] font-medium text-ui-black">{name}</div>

        <div className="mt-[4px] text-[12px] font-normal text-ui-grey">
          {description}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-[9px] font-medium text-ui-black">{paramSizeLabel}</span>
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-ui-orange" />
        <span className="text-[9px] font-medium text-ui-black">{quantLabel}</span>
      </div>
    </div>
  );
}