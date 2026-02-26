type Props = {
  label: string;
  value: number;
  subLabel?: string;
};

export default function OverviewStat({ label, value, subLabel }: Props) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[999px] bg-white/60 px-5 py-3">
      <div className="flex flex-col leading-tight">
        <div className="text-[14px] font-normal text-ui-black">{label}</div>
        {subLabel ? (
          <div className="mt-[2px] text-[11px] font-normal text-ui-grey">{subLabel}</div>
        ) : null}
      </div>

      <div className="text-[26px] font-medium text-ui-black">{value}</div>
    </div>
  );
}