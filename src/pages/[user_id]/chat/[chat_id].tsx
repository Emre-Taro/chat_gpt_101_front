// src/pages/[user_id]/chat/[chat_id].tsx

import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { FaPlus, FaSlidersH, FaMicrophone, FaWaveSquare } from "react-icons/fa";

import Sidebar from "@/components/layout/Sidebar";
import Header from '@/components/layout/Header';
import DeleteBanner from '@/components/layout/deleteChatBanner';



export type Message = {
  sender: 'user' | 'assistant';
  text: string;
};

export type Chat = {
  chatId: string;
  title: string;
  userId: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { user_id, chat_id } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error , setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const [openDeleteBanner, setOpenDeleteBanner] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Fetch all messages for a chat
  useEffect(() => {
  if (!user_id || !chat_id) return;
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 404) {
        setMessages([]);  // 新しいチャットにはメッセージがない
        return;
      } 
      if (!response.ok) {
        setError("Failed to fetch messages");
        return;
      }
      const data = await response.json();
      // Map backend messages to frontend format
      const mapped: Message[] = Array.isArray(data)
        ? data.map((msg: any) => ({
            sender: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.content
          }))
        : [];
      setMessages(mapped);
    } catch (error) {
      setError("An error occurred while fetching messages.");
    }
  };
  fetchMessages();
}, [user_id, chat_id]);

// get chat data
useEffect(() => {
  if (!user_id) return;
  console.log("user_id:", user_id);
  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/${user_id}/chats`, {
        method: "GET",
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok){
        setError("Failed to fetch chats");
        return;
      }

      const chatData = await response.json();
      console.log("Fetched chat data:", chatData);
      const parseChats: Chat[] = Array.isArray(chatData.chats)
        ? chatData.chats.map((chat: any) => ({
            chatId: chat.chatId,
            title: chat.title,
            userId: chat.userId,
          }))
        : [];
      setChats(parseChats);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  fetchChat();
}, [user_id])

  // create new chat
  const onNewChat = async (): Promise<Chat | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Not authenticated");
      return null;
    }
    try {
      const response = await fetch(`http://localhost:8000/${user_id}/chats`, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: crypto.randomUUID(),
          userId: user_id,
          title: "Default Chat"
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "An error occurred during chat.");
        return null;
      }
      const newChat = await response.json();
      setChats(prev => [...prev, {
        chatId: newChat.chatId,
        title: newChat.title,
        userId: newChat.userId,
      }])
      router.push(`/${user_id}/chat/${newChat.chatId}`);
      return newChat;
    } catch(error) {
      if(error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
      return null;
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedChatId || !user_id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${selectedChatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        setError("チャット削除に失敗しました。");
        return;
      }

      // 削除したチャットをstateから除外
      setChats(prev => prev.filter(chat => chat.chatId !== selectedChatId));

      if (chat_id === selectedChatId) {
        const newChat = await onNewChat();
        if (newChat) {
          router.push(`/${user_id}/chat/${newChat.chatId}`);
        } else {
          router.push(`/`); // when fail, jump to the home
        }
      }

      setSelectedChatId(null);
    } catch (error) {
      console.error(error);
      setError("削除中にエラーが発生しました。");
    }
  };

  // add new message when the button is clicked
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat_id,
          userId: user_id,
          content: currentInput,
          role: "user"
        })
      });
      if(!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "An error occurred during chat.");
        return;
      }
      const data = await response.json();
        // 最初の1回目のメッセージ送信時のみ、title を更新
      if (data.generated_title && data.chatId) {
        setChats(prev =>
          prev.map(chat =>
            chat.chatId === data.chatId
              ? { ...chat, title: data.generated_title }
              : chat
          )
        );
      }

      if (!data.user || !data.assistant) {
        setError('Invalid response from server.');
        return;
      }

      setMessages((prev) => [
        ...prev,
          { sender: 'user', text: currentInput },
          { sender: 'assistant', text: data.assistant.content }
      ]);
    } catch(error){
      if(error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.log("error: ", error)
    }
  };

  console.log("messages:", messages);


  return (
    <div className="flex flex-col bg-[#252525ff] text-white min-h-screen p-4 ">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        onNewChat={onNewChat}
        />
      <Sidebar 
        chats={chats}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)} 
        onNewChat = {onNewChat}
        onDeleteClick={(chatId) => {
          setSelectedChatId(chatId);
          setOpenDeleteBanner(true);
        }}
          />
        {/* 削除ポップアップ */}
          {openDeleteBanner && (
            <DeleteBanner 
                openDeleteBanner={openDeleteBanner}
                onClose={() => setOpenDeleteBanner(false)}
                onConfirm={handleConfirmDelete} 
                />
          )}
      {/* チャット表示エリア */}
      <div className="flex justify-center w-full overflow-y-auto px-6 py-4 pb-[130px] pt-[100px]">
        <div className="w-full max-w-3xl space-y-10"> {/* ← 画面中央60% */}
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const nextMsg = messages[idx + 1];
            const isLast = idx === messages.length - 1;
            const isNextDifferent = !isLast && nextMsg.sender !== msg.sender;

            return (
              <React.Fragment key={idx}>
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <div className="bg-neutral-700 text-white px-6 py-3 rounded-xl max-w-[60%]">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="text-white px-6 py-3 rounded-xl max-w-[70%]">
                      {msg.text}
                    </div>
                  )}
                </div>

                {/* 区切り線（やりとりごと） */}
                {isNextDifferent && (
                  <div className="border-t border-neutral-600 opacity-40 my-10" />
                )}
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 w-full px-6 py-4 flex justify-center z-10"
      >
        <div className="w-[650px] bg-[#2e2e2e] text-white rounded-[24px] px-6 py-5 flex flex-col gap-2">
          {/* 入力欄（上段） */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="質問してみましょう"
            className="bg-transparent outline-none text-white placeholder-gray-400 text-sm mb-[5px]"
          />

          {/* ボタン群（下段） */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3 text-gray-300">
              <button type="button" className="hover:text-white text-xl">
                <FaPlus />
              </button>
              <button type="button" className="flex items-center space-x-1 text-sm hover:text-white">
                <FaSlidersH />
                <span>ツール</span>
              </button>
              <button type="button" className="hover:text-white text-xl">
                <FaMicrophone />
              </button>
              <button type="button" className="hover:text-white text-xl">
                <FaWaveSquare />
              </button>
            </div>

            <button
              type="submit"
              className="bg-neutral-600 hover:bg-neutral-500 text-white px-4 py-2 rounded-md text-sm"
            >
              ask
            </button>
          </div>
        </div>
      </form>


    </div>
  );
}