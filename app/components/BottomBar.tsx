export default function BottomBar() {
  return (
    <div className="border-t border-gray-200 bg-white p-4 flex justify-between">
      <span className="text-xs text-gray-400">Autosaved 2m ago</span>
      <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">
        Generate Follow-up
      </button>
    </div>
  )
}
