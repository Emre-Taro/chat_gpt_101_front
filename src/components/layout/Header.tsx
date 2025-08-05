// components/Header.tsx
import { FC } from "react";

type HeaderProps = {
  onMenuClick: () => void;
  onNewChat: () => void;
};

const Header: FC<HeaderProps> = ({ onMenuClick, onNewChat }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#252525ff] text-white flex items-center justify-between px-4 z-50 shadow-md border-b border-white/20">
      {/* 左：ハンバーガーメニュー */}
      <button
        onClick={onMenuClick}
        className="text-xl bg-neutral-800 px-3 py-2 rounded-md hover:bg-neutral-700"
      >
        ☰
      </button>

      {/* 中央：タイトル（任意） */}
      <div className="text-lg">Chat GPT</div>

      {/* 右：新規チャット作成 */}
      <button
        onClick={onNewChat}
        className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-md"
      >
        + new chat
      </button>
    </header>
  );
};

export default Header;
