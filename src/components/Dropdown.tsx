import { useEffect, useId, useRef, useState } from "react";
import ChevronDown from "../assets/chevron-down.svg";

type MenuWidthMode = "trigger" | "content";

export type DropdownOption<T> = {
  value: T;
  label: string;
  render?: React.ReactNode;
};

type Props<T> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;

  placeholder?: string;
  menuWidth?: MenuWidthMode;
};

export default function Dropdown<T>({
  value,
  options,
  onChange,
  placeholder = "Select",
  menuWidth = "trigger",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const listId = useId();

  const selected = options.find((o) => Object.is(o.value, value));

  useEffect(() => {
    const update = () => {
      if (buttonRef.current) setTriggerWidth(buttonRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center justify-between
          px-[14px] py-[10px]
          rounded-[10px]
          border border-ui-black/50
          bg-white
          font-sans
        "
      >
        <span className="text-[14px] font-normal text-ui-black whitespace-nowrap">
          {selected?.label ?? placeholder}
        </span>

        <img
          src={ChevronDown}
          alt=""
          className={[
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          className="
            absolute left-0 top-full z-[999]
            mt-0
            rounded-b-[8px]
            bg-white
            shadow-[0_0_15px_0_rgba(135,135,135,0.15)]
          "
          style={{
            width: menuWidth === "trigger" ? triggerWidth : "max-content",
            minWidth: triggerWidth,
          }}
        >
          <div
            id={listId}
            role="listbox"
            className="flex flex-col px-[5px] pt-[2px] pb-[11px]"
          >
            {options.map((opt) => {
              const isSelected = Object.is(opt.value, value);

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="
                    flex items-center
                    px-[10px]
                    rounded-[6px]
                    text-left
                    hover:bg-ui-bg-grey
                    transition
                  "
                >
                  <span className="text-[11px] font-normal text-ui-black">
                    {opt.render ?? opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}