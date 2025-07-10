// components/Sidebar.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

type Chat = {
  chatId: string;
  chatname: string;
};

type SidebarProps = {
  chats: Chat[];
  isOpen: boolean;
  onClose: () => void;
//   onNewChat: () => void;
};

export default function Sidebar({ 
    chats, 
    isOpen, 
    onClose 
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredChats = chats.filter(chat =>
    chat.chatname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* 背景の黒幕 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}

      {/* サイドバー本体 */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-neutral-900 text-white z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="text-xl font-bold">Menu</div>

          {/* 新しいチャット */}
          <button
            onClick={() => {
            //   onNewChat();
              onClose
            }}
            className="w-full bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-md"
          >
            + new chat
          </button>

          {/* 検索ボックス */}
          <input
            type="text"
            placeholder="search chat"
            className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* チャット履歴 */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.chatId}
                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-700"
                onClick={() => {
                  router.push(`/${chat.chatId}`); // 適切なルートに修正してください
                  onClose
                }}
              >
                {chat.chatname}
              </button>
            ))}
          </div>

          {/* Adminページ */}
          <button
            onClick={() => {
              router.push("/admin");
              onClose
            }}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md"
          >
            Admin page
          </button>
        </div>
      </div>
    </>
  );
}
