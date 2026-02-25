import { useEffect, useRef, useState } from "react";
import PlusCircleOutline from "../assets/plus-circle-otline.svg";

type Props = {
  onAddTag: (tagName: string) => void;
  placeholder?: string;
};

export default function AddTagButton({ onAddTag, placeholder = "add tag" }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const t = window.setTimeout(() => inputRef.current?.focus(), 0);

    const onDocMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;

      if (!root.contains(e.target as Node)) {
        setIsEditing(false);
        setValue("");
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [isEditing]);

  function close() {
    setIsEditing(false);
    setValue("");
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAddTag(trimmed);
    close();
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="
          flex h-[23px] w-[23px]
          items-center justify-center
          rounded-[24px]
          bg-brand-orangeLight
          font-sans text-[12px] font-normal text-ui-black
          hover:opacity-90
          active:scale-[0.98]
        "
        aria-label="Add tag"
        title="Add tag"
      >
        +
      </button>
    );
  }

  return (
    <div
      ref={rootRef}
      className="
        flex h-[23px] w-[78px]
        items-center gap-2
        rounded-[6px]
        bg-brand-orangeLight
        px-[8px]
      "
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") close();
        }}
        onBlur={() => {
          close();
        }}
        placeholder={placeholder}
        className="
          w-full bg-transparent
          font-sans text-[9px] font-extralight italic text-ui-black
          outline-none
          placeholder:text-ui-black/70
        "
        aria-label="New tag name"
      />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={submit}
        className="flex items-center justify-center"
        aria-label="Create tag"
        title="Create tag"
      >
        <img src={PlusCircleOutline} alt="" aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}