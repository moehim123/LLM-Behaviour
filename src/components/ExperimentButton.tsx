import PlusIcon from "../assets/plus-circle-otline.svg";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function ExperimentButton({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center justify-center gap-2
        rounded-[24px]
        border border-ui-black/50
        bg-white
        px-5 py-3
        text-sm font-medium text-ui-black
        font-sans
        transition hover:bg-neutral-100
        active:scale-[0.98]
      "
    >
      <img src={PlusIcon} alt="" className="h-5 w-5" />
      {children}
    </button>
  );
}