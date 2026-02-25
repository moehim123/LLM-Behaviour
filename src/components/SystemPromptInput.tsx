import { useState } from "react";
import SaveIcon from "../assets/save-icon.svg";

type Props = {
  initialValue?: string;
  onSave?: (value: string) => void;
};

export default function SystemPromptInput({
  initialValue = "",
  onSave,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;

    setSaved(true);
    onSave?.(value);
  };

  const handleEdit = () => {
    setSaved(false);
  };

  return (
    <div className="relative w-[215px]">
      <textarea
        value={value}
        placeholder="System Prompt Goes Here"
        onChange={(e) => setValue(e.target.value)}
        onFocus={handleEdit}
        className="
          w-full h-[110px]
          resize-none
          rounded-[8px]
          border border-ui-black/20
          bg-white
          p-3
          font-sans
          text-[11px]
          leading-normal
          outline-none
        "
      />

      {saved && (
        <div
          className="
            pointer-events-none
            absolute inset-0
            p-3
            text-[11px]
            italic font-light
            text-ui-black
            whitespace-pre-wrap
          "
        >
          {value}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="
          absolute bottom-2 right-2
          flex items-center justify-center
          w-6 h-6
          opacity-60 hover:opacity-100
          transition
        "
      >
        <img src={SaveIcon} alt="Save prompt" className="w-4 h-4" />
      </button>
    </div>
  );
}


