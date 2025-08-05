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
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 w-full max-w-sm shadow-lg border border-white/10" style={{ borderRadius: '30px' }} >
        <h3 className="text-lg font-semibold text-white mb-4">
          チャットを削除しますか？
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-transparent text-white border border-white hover:bg-white hover:text-black"
            style={{ borderRadius: '30px' }}
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded"
            style={{ borderRadius: '30px' }}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
