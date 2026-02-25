type Props = {
  label: string;
  value: string | number;
};

export default function OverviewStat({ label, value }: Props) {
  return (
    <div
      className="
        inline-flex items-center gap-2
        rounded-[24px]
        bg-white
        px-9 py-4
        font-sans
      "
    >
      <span className="text-sm font-medium text-ui-black">
        {label}
      </span>

      <span className="text-2xl font-medium text-ui-black">
        {value}
      </span>
    </div>
  );
}