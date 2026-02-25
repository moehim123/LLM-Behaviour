import { useEffect, useRef, useState } from "react";
import TrendingUpIcon from "../assets/arrow-trending-up.svg";

type Props = {
  label: string;
  value?: number;
  selected?: boolean;
  onChange?: (next: { selected: boolean; value: number }) => void;
  maxWeight?: number;
  className?: string;
};

export default function QuantifiableTag({
  label,
  value,
  selected,
  onChange,
  maxWeight = 9,
  className = "",
}: Props) {
  const isControlled = selected !== undefined || value !== undefined;

  const [internalSelected, setInternalSelected] = useState(false);
  const [internalValue, setInternalValue] = useState(0);

  const s = selected ?? internalSelected;
  const v = value ?? internalValue;

  const [showHint, setShowHint] = useState(false);
  const hintTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimeout.current) window.clearTimeout(hintTimeout.current);
    };
  }, []);

  const commit = (nextSelected: boolean, nextValue: number) => {
    if (!isControlled) {
      setInternalSelected(nextSelected);
      setInternalValue(nextValue);
    }
    onChange?.({ selected: nextSelected, value: nextValue });
  };

  const flashHint = () => {
    setShowHint(true);
    if (hintTimeout.current) window.clearTimeout(hintTimeout.current);
    hintTimeout.current = window.setTimeout(() => setShowHint(false), 1400);
  };

  const handleClick = () => {
    if (!s) {
      commit(true, 0);
      flashHint();
      return;
    }

    const next = Math.min(v + 1, maxWeight);
    commit(true, next);
  };

  const hasWeight = s && v > 0;

  return (
    <div className={["relative inline-flex", className].join(" ")}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        className={[
          "inline-flex items-center justify-center rounded-full px-4 py-2",
          "text-[9px] font-normal text-ui-black transition",
          !s && "bg-white border border-transparent hover:bg-brand-orangeLight",
          s && !hasWeight && "bg-brand-orangeLight border border-transparent",
          hasWeight && "bg-brand-orangeLight border border-brand-orange",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={s}
      >
        <span className="whitespace-nowrap">{label}</span>

        {hasWeight && (
          <span className="ml-3 inline-flex items-center gap-2">
            <img
              src={TrendingUpIcon}
              alt=""
              className="h-[14px] w-[14px]"
              aria-hidden="true"
            />
            <span className="text-ui-grey text-[9px] font-normal">{v}</span>
          </span>
        )}
      </button>

      {s && showHint && v === 0 && (
        <div
          className="
            absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2
            whitespace-nowrap
            rounded-[8px] border border-ui-black/10 bg-white
            px-3 py-2
            text-[9px] font-normal text-ui-black
            shadow-[0_0_15px_rgba(135,135,135,0.15)]
          "
          role="status"
        >
          Click again to add weight
        </div>
      )}
    </div>
  );
}