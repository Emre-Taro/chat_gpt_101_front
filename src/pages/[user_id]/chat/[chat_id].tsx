// src/pages/[user_id]/chat/[chat_id].tsx

import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useState } from 'react';

import Sidebar from "@/components/layout/Sidebar";
import Header from '@/components/layout/Header';

export default function ChatPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<{ chatId: string; chatname: string }[]>([]);

  const router = useRouter();
  const { user_id, chat_id } = router.query;

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  return (
    <>
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        />
      <Sidebar chats={chats} />
      
    <div className="p-6">
      <h1 className="text-xl font-bold">Chat Page</h1>
      <p className="mt-2">User ID: {user_id}</p>
      <p className="mt-2">Chat ID: {chat_id}</p>
      {/* 実際のチャット画面のコンポーネントをここに組み込む */}
    </div>
    </>
  );
}