import { useEffect, useRef, useState } from "react";
import PaperClip from "../assets/paper-clip.svg";
import Pencil from "../assets/pencil.svg";

type Props = {
  label?: string;
  initialValue?: string;
  onSave?: (value: string) => void;
};

export default function Notes({ label = "Notes", initialValue = "", onSave }: Props) {
  const [isSaved, setIsSaved] = useState(Boolean(initialValue));
  const [draft, setDraft] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isSaved) textareaRef.current?.focus();
  }, [isSaved]);

  function handleAttach() {
    const next = draft.trim();
    setDraft(next);
    setIsSaved(true);
    onSave?.(next);
  }

  function handleEdit() {
    setIsSaved(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
  <div className="w-[470px] font-sans">
    <div className="mb-2 text-[11px] font-normal text-ui-black">{label}</div>

      <div
        className={[
          "relative w-full rounded-[8px]",
          isSaved ? "bg-ui-quotedBg " : "bg-white border border-ui-black/20",
        ].join(" ")}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isSaved}
          className={[
            "w-full resize-none bg-transparent outline-none",
            "rounded-[8px]",
            "text-[11px] font-normal text-ui-black",
            "min-h-[88px]",
            "pt-[12px] pr-[8px] pb-[32px] pl-[8px]",
            isSaved ? "cursor-default" : "",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={isSaved ? handleEdit : handleAttach}
          className="absolute bottom-[8px] right-[8px] inline-flex items-center gap-1 text-[11px] font-normal text-ui-black"
          aria-label={isSaved ? "Edit note" : "Attach note"}
        >
          <span>{isSaved ? "Edit" : "Attach"}</span>
          <img
            src={isSaved ? Pencil : PaperClip}
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
          />
        </button>
      </div>
    </div>
  );
}