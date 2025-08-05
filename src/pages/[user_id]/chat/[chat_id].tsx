// src/pages/[user_id]/chat/[chat_id].tsx

import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { FaPlus, FaSlidersH, FaMicrophone, FaWaveSquare, FaSpinner } from "react-icons/fa";

import Sidebar from "@/components/layout/Sidebar";
import Header from '@/components/layout/Header';
import DeleteBanner from '@/components/layout/deleteChatBanner';



export type Message = {
  sender: 'user' | 'assistant';
  text: string;
  type?: 'text' | 'image'; // Optional, can be text or image
  imageFilename?: string; // Only used if type is 'image'
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
  const [showFileModal, setShowFileModal] = useState(false);

  const [openDeleteBanner, setOpenDeleteBanner] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Debug: Monitor message changes
  useEffect(() => {
    console.log("=== MESSAGES STATE CHANGED ===");
    console.log("Current messages:", messages);
    console.log("Messages length:", messages.length);
  }, [messages]);


  // Fetch all messages for a chat
  useEffect(() => {
  if (!user_id || !chat_id) return;
  
  // Don't fetch messages if we're currently uploading
  if (isUploading) {
    console.log("Skipping fetchMessages because upload is in progress");
    return;
  }
  
  const fetchMessages = async () => {
    try {
      console.log("=== FETCHING MESSAGES ===");
      console.log("user_id:", user_id, "chat_id:", chat_id);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 404) {
        console.log("Chat not found, setting empty messages");
        setMessages([]);  // 新しいチャットにはメッセージがない
        return;
      } 
      if (!response.ok) {
        setError("Failed to fetch messages");
        return;
      }
      const data = await response.json();
      console.log("Fetched data from server:", data);
      
      // Map backend messages to frontend format
      const mapped: Message[] = Array.isArray(data)
        ? data.map((msg: any) => {
            console.log("Mapping message:", msg);
            
            // Check if this is an image message (has imageFilename)
            if (msg.imageFilename) {
              console.log("Found image message:", msg.imageFilename);
              return {
                sender: msg.role === 'user' ? 'user' : 'assistant',
                text: msg.content || '',
                type: 'image' as const,
                imageFilename: msg.imageFilename
              };
            } else {
              // Regular text message
              return {
                sender: msg.role === 'user' ? 'user' : 'assistant',
                text: msg.content || ''
              };
            }
          })
        : [];
      console.log("Mapped messages:", mapped);
      setMessages(mapped);
    } catch (error) {
      setError("An error occurred while fetching messages.");
    }
  };
  fetchMessages();
}, [user_id, chat_id, isUploading]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("=== IMAGE UPLOAD START ===");
    console.log("Uploading image:", file.name, "Size:", file.size);
    setIsUploading(true);
    setError(''); // Clear any previous errors

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(",")[1]; // "data:image/png;base64,..."
      if (!base64) {
        setError("Failed to read image file.");
        setIsUploading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found.");
        setIsUploading(false);
        return;
      }

      try {
        console.log("Starting image upload...");
        // First, upload the image
        const res = await fetch(`http://localhost:8000/${user_id}/${chat_id}/upload_image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            image_data: base64,
            chatId: chat_id,
            userId: user_id
          }),
        });

        console.log("Upload response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Image upload failed:", errorData);
          setError(errorData.detail || "Image upload failed.");
          setIsUploading(false);
          return;
        }

        const result = await res.json();
        console.log("Upload success:", result);
        console.log("Result filename check:", result.filename);

        if (result.filename) {
          console.log("Filename exists, proceeding with AI response...");
          // Add the image message to the chat
          const imageMessage = {
            sender: 'user' as const,
            text: '',
            type: 'image' as const,
            imageFilename: result.filename
          };
          
          console.log("Adding image message to chat:", imageMessage);
          setMessages(prev => {
            console.log("Previous messages:", prev);
            const newMessages = [...prev, imageMessage];
            console.log("New messages after adding image:", newMessages);
            return newMessages;
          });

          // Wait a moment for the image message to be added
          await new Promise(resolve => setTimeout(resolve, 100));

          console.log("Getting AI response for image...");
          // Now send a message to get AI response for the image
          const requestBody = {
            chatId: chat_id,
            userId: user_id,
            content: "Please analyze this image and provide insights.",
            role: "user",
            imageFilename: result.filename // Include the image filename
          };

          console.log("AI request body:", requestBody);

          const aiResponse = await fetch(`http://localhost:8000/${user_id}/chat/${chat_id}/message`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          console.log("AI response status:", aiResponse.status);
          console.log("AI response headers:", Object.fromEntries(aiResponse.headers.entries()));

          if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            console.error("AI response failed:", errorData);
            setError(errorData.detail || "Failed to get AI response for image.");
            setIsUploading(false);
            return;
          }

          const aiData = await aiResponse.json();
          console.log("AI response received:", aiData);
          console.log("AI response structure:", {
            hasAssistant: !!aiData.assistant,
            assistantContent: aiData.assistant?.content,
            hasGeneratedTitle: !!aiData.generated_title,
            hasChatId: !!aiData.chatId,
            fullResponse: aiData
          });

          // Add AI response to messages
          if (aiData.assistant && aiData.assistant.content) {
            console.log("Adding AI response to chat:", aiData.assistant.content);
            setMessages(prev => {
              console.log("Previous messages before AI response:", prev);
              const newMessages = [
                ...prev,
                { 
                  sender: 'assistant' as const, 
                  text: aiData.assistant.content 
                }
              ];
              console.log("New messages after AI response:", newMessages);
              return newMessages;
            });
          } else {
            console.warn("No assistant content found in AI response:", aiData);
            // Try to add a fallback message
            setMessages(prev => [
              ...prev,
              { 
                sender: 'assistant' as const, 
                text: "I received your image but couldn't process it. Please try again or contact support." 
              }
            ]);
          }
        } else {
          console.error("No filename in upload result:", result);
        }
        console.log("=== IMAGE UPLOAD COMPLETE ===");
        setIsUploading(false);
      } catch (error) {
        console.error("Image upload error:", error);
        setError("Image upload failed.");
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }


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
          {/* Error Display */}
          {error && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isUploading && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
              Uploading image and getting AI response...
            </div>
          )}
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const nextMsg = messages[idx + 1];
            const isLast = idx === messages.length - 1;
            const isNextDifferent = !isLast && nextMsg.sender !== msg.sender;

            // Debug: Log each message being rendered
            console.log(`Rendering message ${idx}:`, {
              sender: msg.sender,
              text: msg.text,
              type: msg.type,
              imageFilename: msg.imageFilename,
              isImage: msg.type === 'image'
            });

            return (
              <React.Fragment key={idx}>
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <div className="flex flex-col items-end gap-2">
                      {msg.text && (
                        <div className="bg-neutral-700 text-white px-6 py-3 rounded-xl max-w-[60%]">
                          {msg.text}
                        </div>
                      )}
                      {msg.type === "image" && msg.imageFilename && (
                        <div className="bg-neutral-700 p-2 rounded-xl">
                          <img
                            src={`http://localhost:8000/static/uploads/${msg.imageFilename}`}
                            alt="uploaded"
                            className="max-w-xs max-h-64 rounded-lg shadow-lg object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', msg.imageFilename);
                              console.error('Image URL:', `http://localhost:8000/static/uploads/${msg.imageFilename}`);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', msg.imageFilename);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2">
                      {msg.text && (
                        <div className="text-white px-6 py-3 rounded-xl max-w-[70%]">
                          {msg.text}
                        </div>
                      )}
                      {msg.type === "image" && msg.imageFilename && (
                        <div className="bg-neutral-700 p-2 rounded-xl">
                          <img
                            src={`http://localhost:8000/static/uploads/${msg.imageFilename}`}
                            alt="uploaded"
                            className="max-w-xs max-h-64 rounded-lg shadow-lg object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', msg.imageFilename);
                              console.error('Image URL:', `http://localhost:8000/static/uploads/${msg.imageFilename}`);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', msg.imageFilename);
                            }}
                          />
                        </div>
                      )}
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

          {/* File Upload Modal */}
          {showFileModal && (
            <div className="absolute bottom-20 left-10 z-50">
              <div className="bg-neutral-800 p-3 rounded-md flex flex-col items-center gap-2 relative shadow-lg border border-neutral-700 min-w-[180px]">
                <button
                  className="absolute top-1 right-2 text-gray-400 hover:text-white text-lg"
                  onClick={() => setShowFileModal(false)}
                  aria-label="Close"
                  style={{ lineHeight: 1 }}
                >
                  ×
                </button>
                <label className="text-white text-xs mb-1">画像を選択</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    console.log("File input changed:", e.target.files?.[0]);
                    handleImageUpload(e);
                    setShowFileModal(false);
                  }}
                  className="block text-xs text-white"
                  style={{ width: '120px' }}
                />
              </div>
            </div>
          )}

          {/* ボタン群（下段） */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3 text-gray-300">
              <button
                type="button"
                className="hover:text-white text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowFileModal(true)}
                disabled={isUploading}
                aria-label="ファイルをアップロード"
              >
                {isUploading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
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