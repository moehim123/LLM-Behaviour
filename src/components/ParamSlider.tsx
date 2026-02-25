import { useId } from "react";

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
};

export default function ParamSlider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  formatValue,
}: Props) {
  const id = useId();

  const clamped =
    value < min ? min : value > max ? max : value;

  const percent =
    max === min ? 0 : ((clamped - min) / (max - min)) * 100;

  const display =
    formatValue ? formatValue(clamped) : String(clamped);

  return (
    <div className="flex w-[171px] flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <label
          htmlFor={id}
          className="text-[9px] leading-none text-ui-black"
        >
          {label}
        </label>

        <span className="text-[9px] leading-none text-ui-grey">
          {display}
        </span>
      </div>

      <div className="relative mt-2 h-[21px] w-[171px]">
        <div className="absolute left-0 top-1/2 h-[10px] w-full -translate-y-1/2 rounded-[24px] bg-brand-orangeLight" />

        <div
          className="absolute left-0 top-1/2 h-[10px] -translate-y-1/2 rounded-[24px] bg-brand-orange"
          style={{ width: `${percent}%` }}
        />

        <div
          className="absolute top-1/2 h-[21px] w-[21px] -translate-y-1/2 rounded-full bg-brand-orangeLight shadow-knob"
          style={{ left: `calc(${percent}% - 10.5px)` }}
        />

        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            absolute left-0 top-0 h-full w-full
            cursor-pointer opacity-0
          "
        />
      </div>
    </div>
  );
}