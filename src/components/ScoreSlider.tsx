import { useId } from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function ScoreSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.1,
}: Props) {
  const id = useId();

  const clamped = value < min ? min : value > max ? max : value;
  const percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100;

  return (
    <div className="w-[200px]">
      <div className="relative mt-2 h-[21px] w-[200px]">
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
          className="absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] font-normal text-ui-grey">
        <span>{clamped.toFixed(1)}</span>
        <span>{Number(max).toFixed(0)}</span>
      </div>
    </div>
  );
}