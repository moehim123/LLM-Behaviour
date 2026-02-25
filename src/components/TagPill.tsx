type Props = {
  label: string;
};

export default function TagPill({ label }: Props) {
  return (
    <span
      className="
        inline-flex items-center justify-center
        h-[15px]
        rounded-full
        bg-white
        px-[10px]
        text-[9px] font-normal text-ui-black
        whitespace-nowrap
      "
    >
      {label}
    </span>
  );
}

