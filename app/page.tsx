"use client";

import { useState } from "react";
import { MessageSquare, Users, Search, Calendar, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/auth-context";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";
import { CalendarViewModal } from "@/components/calendar/calendar-view-modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  primary = false,
}: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-4 w-full p-5 rounded-3xl shadow-lg transition-all duration-300",
        primary
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl"
          : "bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white hover:shadow-xl border border-gray-100",
        disabled && "opacity-40 cursor-not-allowed hover:shadow-lg"
      )}
    >
      <div
        className={cn(
          "p-3 rounded-2xl transition-colors",
          primary ? "bg-white/20" : "bg-gradient-to-br from-blue-50 to-blue-100"
        )}
      >
        {icon}
      </div>
      <span className="text-lg font-semibold">{label}</span>
    </motion.button>
  );
}

function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk:", chunk);
          
          // The text stream just sends the text directly
          assistantMessage += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantMessage } : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl h-[90vh] max-h-[800px] bg-gradient-to-b from-white to-blue-50/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Text Momentum
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center px-4"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="text-7xl mb-6"
                  >
                    💬
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Start Your Journey
                  </h3>
                  <p className="text-gray-600 max-w-md leading-relaxed">
                    Chat with your momentum coach to build better habits and achieve your goals.
                  </p>
                </motion.div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-3xl px-5 py-3 shadow-md",
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white text-gray-900 border border-gray-100"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-3xl px-5 py-4 bg-white border border-gray-100 shadow-md">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-3 bg-white border-2 border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                  disabled={isLoading}
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        {/* Mobile Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-b from-white/50 to-transparent relative">
            {/* User Menu - Top Right */}
            {user && (
              <div className="absolute top-4 right-4">
                <UserMenu />
              </div>
            )}
            
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-6xl mb-4 inline-block"
            >
              🌊
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Text Momentum
            </h1>
            <p className="text-gray-600 font-medium">Build habits that stick</p>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-8 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : !user ? (
              /* Sign In Section */
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h2>
                  <p className="text-gray-600 text-sm">Sign in to start building your momentum</p>
                </div>
                <SignInButton />
              </div>
            ) : (
              /* Authenticated Content */
              <>
                {/* Primary Action */}
                <ActionButton
                  icon={<MessageSquare className="w-6 h-6" />}
                  label="Text Momentum"
                  onClick={() => setIsChatOpen(true)}
                  primary
                />

                {/* Secondary Actions */}
                <div className="space-y-3 pt-2">
                  <ActionButton
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="Find friends"
                    disabled
                  />
                  <ActionButton
                    icon={<Search className="w-6 h-6 text-purple-500" />}
                    label="Search Groups"
                    disabled
                  />
                  <ActionButton
                    icon={<Calendar className="w-6 h-6 text-pink-500" />}
                    label="View your Calendar"
                    onClick={() => setIsCalendarOpen(true)}
                  />
                </div>

                {/* Coming Soon */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-6 text-center"
                >
                  <p className="text-sm text-gray-500 font-medium">
                    Additional features coming soon ✨
                  </p>
                </motion.div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-400">© 2025 Text Momentum</p>
          </div>
        </motion.div>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Calendar Modal */}
      <CalendarViewModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
    </>
  );
}

