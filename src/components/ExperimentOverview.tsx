import { useState } from "react";
import EllipseIcon from "../assets/Ellipse.svg";

type Props = {
  title: string;
  runsCount: number;
  defaultOpen?: boolean;
  children?: React.ReactNode; 
};

export default function ExperimentOverview({
  title,
  runsCount,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
     <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full
          inline-flex items-center
          px-2 py-[5px]
          bg-transparent
          gap-2
        "
      >
        <img
          src={EllipseIcon}
          alt=""
          className="h-[22px] w-[22px] shrink-0"
        />

        <span className="min-w-0 truncate whitespace-nowrap text-[11px] font-medium text-ui-black">
          {title}
        </span>

        <span className="ml-auto shrink-0 text-[11px] font-medium text-ui-grey whitespace-nowrap">
          {runsCount} Runs
        </span>
      </button>

      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-200",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}