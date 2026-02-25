import SendArrow from "../assets/Send-button-arrow.svg";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Input your prompt here",
}: Props) {
  return (
    <div
      className="
        inline-flex items-center
        w-full
        bg-white
        rounded-[14px]
        border border-ui-black/20
        px-[37px] py-[14px]
      "
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          flex-1
          bg-transparent
          outline-none
          text-[12px]
          italic
          font-normal
          text-ui-black
          placeholder:text-ui-black
        "
      />

      <button
        onClick={onSubmit}
        className="
          ml-4
          h-8 w-8
          flex items-center justify-center
          rounded-full
          bg-ui-black
          active:scale-95
          transition
        "
      >
        <img src={SendArrow} className="h-4 w-4" />
      </button>
    </div>
  );
}

