import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';

type Message = {
  sender: 'user' | 'assistant';
  text: string;
};



export default function ChatPage() {
  const router = useRouter();
  const { user_id, chat_id } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error , setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`);
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

  // add new message when the button is clicked
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');

    try {
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat_id,
          userId: user_id,
          content: currentInput,
          chatname: "Default Chat", // or use a variable if you have chat names
          role: "user"
        })
      });
      if(!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "An error occurred during chat.");
        return;
      }
      const data = await response.json();
      console.log(data);

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
    <div className="flex flex-col h-screen bg-neutral-900 text-white">
      {/* チャット表示エリア */}
      <div className="flex justify-center w-full overflow-y-auto px-6 py-4">
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
        className="h-[10vh] px-6 py-3 flex items-center justify-center gap-3 mb-8"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-[50%] h-16 bg-neutral-700 text-white px-4 py-3 rounded-2xl outline-none"
          placeholder="メッセージを入力..."
        />
        <button
          type="submit"
          className="bg-neutral-600 hover:bg-neutral-500 text-white px-4 py-2 rounded-md"
        >
          ask
        </button>
      </form>
    </div>
  );
}
