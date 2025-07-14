// components/layout/DeleteBanner.tsx

type DeleteBannerProps = {
  openDeleteBanner: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteBanner({
  openDeleteBanner,
  onClose,
  onConfirm,
}: DeleteBannerProps) {
  if (!openDeleteBanner) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold mb-4">チャットを削除しますか？</h3>
        <p className="text-sm text-gray-600 mb-6">この操作は取り消せません。</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
