interface BottomBarProps {
  autoSaveText?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function BottomBar({
  autoSaveText = "Autosaved 2m ago",
  buttonText = "Generate Follow-up",
  onButtonClick = () => {},
}: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
      <span className="text-xs text-gray-500">
        {autoSaveText}
      </span>

      <button
        onClick={onButtonClick}
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {buttonText}
      </button>
    </div>
  );
}
