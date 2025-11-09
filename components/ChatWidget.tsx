'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supportService } from '@/lib/api';

interface Message {
  message_id: number;
  message_text: string;
  sender: 'customer' | 'admin';
  created_at: string;
}

export default function ChatWidget() {
  const { isAuthenticated, user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({ name: '', orderNumber: '' });
  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [previousMessageIds, setPreviousMessageIds] = useState<Set<number>>(new Set());
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentTalking, setAgentTalking] = useState(false);
  const [closedMessages, setClosedMessages] = useState<Message[]>([]);
  
  // Use ref to track session state for immediate access
  const sessionEndedRef = useRef(false);

  // Add animations style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0; }
      }
      @keyframes talk-mouth {
        0%, 100% { 
          d: path("M42 78 Q60 82 78 78");
          opacity: 0.9;
        }
        50% { 
          d: path("M45 78 Q60 88 75 78");
          opacity: 1;
        }
      }
      @keyframes talk-jaw {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(2px); }
      }
      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2); 
        }
        50% { 
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3); 
        }
      }
      @keyframes subtle-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      .animate-blink {
        animation: blink 3.5s infinite;
      }
      .animate-talk-mouth {
        animation: talk-mouth 0.4s ease-in-out infinite;
      }
      .animate-talk-jaw {
        animation: talk-jaw 0.4s ease-in-out infinite;
      }
      .animate-pulse-glow {
        animation: pulse-glow 1.5s ease-in-out infinite;
      }
      .animate-subtle-bounce {
        animation: subtle-bounce 0.4s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isOpen && isAuthenticated && token) {
      loadMessages();
      
      // Auto-refresh messages for live communication with admin
      const interval = setInterval(() => {
        if (sessionEndedRef.current) {
          return;
        }
        
        const timeSinceLastActivity = Date.now() - lastActivity;
        const oneMinute = 60 * 1000;
        
        // Refresh every 2 seconds if recently active (within 1 minute) for near-instant replies
        // Otherwise refresh every 10 seconds
        if (timeSinceLastActivity < oneMinute) {
          loadMessages();
        } else {
          // Less frequent refresh when inactive
          const tenSeconds = 10 * 1000;
          if (Date.now() % tenSeconds < 2000) {
            loadMessages();
          }
        }
      }, 2 * 1000); // Check every 2 seconds for near-instant updates
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated, token, mounted, lastActivity]);

  const loadMessages = async () => {
    if (!token) return; // Don't try to load without token
    
    // If session already ended, don't load new messages
    if (sessionEndedRef.current) {
      return;
    }
    
    try {
      const data = await supportService.getMessages(token);
      // Only show messages that are not closed
      const activeMessages = data.filter((msg: any) => msg.status !== 'closed');
      
      // Check if agent has joined (any admin message exists)
      const hasAgentMessage = activeMessages.some((m: any) => m.sender === 'admin');
      if (hasAgentMessage && !agentConnected) {
        setAgentConnected(true);
      }
      
      // Check if agent said goodbye (disconnect) - ONLY AGENT, NOT CUSTOMER
      const adminMessages = activeMessages.filter((m: any) => m.sender === 'admin');
      const lastAdminMessage = adminMessages[adminMessages.length - 1];
      
      // Check if there's an admin message (agent has joined or is connected)
      if (lastAdminMessage && (agentConnected || hasAgentMessage)) {
        const text = lastAdminMessage.message_text.toLowerCase();
        
        // Check for goodbye keywords
        const goodbyeKeywords = ['bye', 'goodbye', 'good bye', 'closing', 'ended', 'end chat', 'take care', 'have a good'];
        const hasGoodbye = goodbyeKeywords.some(keyword => text.includes(keyword));
        
        if (hasGoodbye) {
          // Mark session as ended
          sessionEndedRef.current = true;
          setAgentConnected(false);
          setAgentTalking(false);
          
          // Move current messages to closed messages
          setClosedMessages([...activeMessages]);
          
          // Clear active messages
          setMessages([]);
          
          // Don't update messages anymore
          return;
        }
      }
      
      // Track message IDs to detect new messages
      const currentIds = new Set(activeMessages.map((m: any) => m.message_id));
      
      // Check for new admin messages to trigger talking animation
      const newAdminMessages = activeMessages.filter((m: any) => 
        m.sender === 'admin' && !previousMessageIds.has(m.message_id)
      );
      
      if (newAdminMessages.length > 0) {
        setAgentTalking(true);
        setTimeout(() => setAgentTalking(false), 2000); // Talk for 2 seconds
      }
      
      setPreviousMessageIds(currentIds);
      
      // Update messages
      setMessages(activeMessages);
    } catch (error) {
      // Silently fail - user might not have messages yet
      console.debug('No messages loaded:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !token) return;

    setLoading(true);
    setLastActivity(Date.now()); // Track send activity
    
    const messageText = newMessage.trim();
    
    try {
      // Don't send to Telegram for initial help requests - bot handles them
      const skipTelegram = 
        messageText.toLowerCase().includes('help with my order') ||
        messageText.toLowerCase().includes('help with my account') ||
        messageText.toLowerCase().includes('question about a product');
      
      await supportService.sendMessage({ 
        message: messageText,
        skip_telegram: skipTelegram 
      }, token);
      setNewMessage('');
      await loadMessages();
      
      // Show order form for order help
      if (messageText.toLowerCase().includes('help with my order')) {
        setTimeout(() => {
          setShowOrderForm(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndChat = async () => {
    // Close all active messages on the backend (only real messages, not bot-generated ones)
    if (token && messages.length > 0) {
      try {
        // Filter out bot messages (they have very large IDs from Date.now())
        const realMessages = messages.filter(msg => msg.message_id < 1000000000000);
        
        // Close each real message
        if (realMessages.length > 0) {
          await Promise.all(
            realMessages.map((msg) => 
              supportService.closeMessage(msg.message_id, token)
            )
          );
        }
      } catch (error) {
        console.error('Failed to close messages:', error);
      }
    }
    
    sessionEndedRef.current = false;
    setMessages([]);
    setClosedMessages([]);
    setShowEndChatConfirm(false);
    setAgentConnected(false);
    setIsOpen(false);
  };
  
  const handleStartNewChat = async () => {
    // Close the old messages on backend
    if (token && closedMessages.length > 0) {
      try {
        const realMessages = closedMessages.filter(msg => msg.message_id < 1000000000000);
        if (realMessages.length > 0) {
          await Promise.all(
            realMessages.map((msg) => 
              supportService.closeMessage(msg.message_id, token)
            )
          );
        }
      } catch (error) {
        console.error('Failed to close old messages:', error);
      }
    }
    
    // Reset all states for new conversation
    sessionEndedRef.current = false;
    setClosedMessages([]);
    setMessages([]);
    setAgentConnected(false);
    setPreviousMessageIds(new Set());
  };

  // Don't render until mounted (avoid hydration issues)
  if (!mounted) return null;

  // Only show for authenticated customers
  if (!isAuthenticated || user?.role !== 'customer') return null;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        aria-label="Support Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200/50 animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                {agentConnected ? (
                  // Professional Support Agent with Headset
                  <div className={`w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl ring-3 ring-white/40 transition-all duration-300 ${agentTalking ? 'animate-pulse-glow animate-subtle-bounce' : ''}`}>
                    <svg className="w-16 h-16" viewBox="0 0 120 120" fill="none">
                      {/* Background glow */}
                      <circle cx="60" cy="60" r="50" fill="white" opacity="0.1"/>
                      <circle cx="60" cy="60" r="42" fill="white" opacity="0.08"/>
                      
                      {/* Head/Face circle */}
                      <circle cx="60" cy="58" r="28" fill="white" opacity="0.95"/>
                      <circle cx="60" cy="58" r="27" fill="rgba(255, 248, 240, 0.9)"/>
                      
                      {/* Hair */}
                      <path d="M35 50 Q40 32 60 30 Q80 32 85 50" fill="white" opacity="0.85"/>
                      <ellipse cx="60" cy="35" rx="22" ry="12" fill="white" opacity="0.85"/>
                      
                      {/* Eyes */}
                      <g className="animate-blink">
                        <circle cx="50" cy="55" r="3" fill="rgba(16, 185, 129, 0.9)"/>
                        <circle cx="70" cy="55" r="3" fill="rgba(16, 185, 129, 0.9)"/>
                        <circle cx="51" cy="54" r="1" fill="white"/>
                        <circle cx="71" cy="54" r="1" fill="white"/>
                      </g>
                      
                      {/* Eyebrows */}
                      <path d="M44 50 Q50 48 54 50" stroke="rgba(100, 100, 100, 0.6)" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M66 50 Q70 48 76 50" stroke="rgba(100, 100, 100, 0.6)" strokeWidth="2" strokeLinecap="round"/>
                      
                      {/* Nose */}
                      <path d="M60 58 L58 64" stroke="rgba(200, 180, 160, 0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                      
                      {/* Smile */}
                      <path d="M52 68 Q60 72 68 68" stroke="rgba(16, 185, 129, 0.7)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      
                      {/* Headset - Left side */}
                      <path d="M32 45 Q30 55 32 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                      <ellipse cx="32" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                      <ellipse cx="32" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                      <circle cx="32" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                      
                      {/* Headset - Right side */}
                      <path d="M88 45 Q90 55 88 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                      <ellipse cx="88" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                      <ellipse cx="88" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                      <circle cx="88" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                      
                      {/* Headset band over head */}
                      <path d="M32 45 Q60 28 88 45" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.95"/>
                      <path d="M35 45 Q60 32 85 45" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" strokeLinecap="round"/>
                      
                      {/* Microphone boom */}
                      <path d="M32 60 Q28 68 28 75" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
                      
                      {/* Microphone */}
                      <ellipse cx="28" cy="78" rx="4" ry="6" fill="white" opacity="0.95"/>
                      <ellipse cx="28" cy="78" rx="3" ry="5" fill="rgba(16, 185, 129, 0.5)"/>
                      
                      {/* Sound waves when talking */}
                      {agentTalking && (
                        <g opacity="0.7">
                          <path d="M20 75 Q18 78 20 81" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-pulse"/>
                          <path d="M15 73 Q12 78 15 83" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-pulse" style={{animationDelay: '0.1s'}}/>
                          <path d="M10 71 Q6 78 10 85" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-pulse" style={{animationDelay: '0.2s'}}/>
                        </g>
                      )}
                      
                      {/* Neck/Shoulders */}
                      <path d="M45 80 Q60 88 75 80" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
                    </svg>
                  </div>
                ) : (
                  // Animated Bot Face - Friendly & Modern
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30 transition-all duration-300">
                    <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none">
                      {/* Bot head */}
                      <rect x="25" y="30" width="50" height="45" rx="8" fill="white" opacity="0.15"/>
                      
                      {/* Antenna */}
                      <line x1="50" y1="30" x2="50" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="50" cy="18" r="3" fill="white"/>
                      
                      {/* Eyes - blinking */}
                      <g className="animate-blink">
                        <circle cx="38" cy="48" r="4" fill="white"/>
                        <circle cx="62" cy="48" r="4" fill="white"/>
                      </g>
                      
                      {/* Mouth - digital smile */}
                      <path d="M35 60 L42 60 M45 60 L55 60 M58 60 L65 60" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      
                      {/* Cheek details */}
                      <circle cx="30" cy="55" r="2" fill="white" opacity="0.3"/>
                      <circle cx="70" cy="55" r="2" fill="white" opacity="0.3"/>
                    </svg>
                  </div>
                )}
                {agentConnected && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Support Chat</h3>
                <p className="text-sm text-blue-100 flex items-center gap-1">
                  {agentConnected ? (
                    <>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Agent connected
                    </>
                  ) : (
                    "We're here to help!"
                  )}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setShowEndChatConfirm(true)}
                className="text-white hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                End Chat
              </button>
            )}
          </div>
          


          {/* End Chat Confirmation */}
          {showEndChatConfirm && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
                <h4 className="font-bold text-lg mb-2">End this chat?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  This will clear the conversation. You can start a new chat anytime.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEndChatConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEndChat}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    End Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            {/* Previous closed session messages (greyed out) */}
            {closedMessages.length > 0 && (
              <div className="opacity-50 space-y-4 pb-4">
                {closedMessages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.message_id}
                      className={`flex gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCustomer && (
                        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-gray-200">
                          <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="40" fill="white" opacity="0.1"/>
                            <circle cx="50" cy="48" r="18" fill="white" opacity="0.95"/>
                            <ellipse cx="50" cy="35" rx="15" ry="8" fill="white" opacity="0.85"/>
                            <circle cx="44" cy="46" r="2" fill="rgba(100, 100, 100, 0.9)"/>
                            <circle cx="56" cy="46" r="2" fill="rgba(100, 100, 100, 0.9)"/>
                            <path d="M44 54 Q50 57 56 54" stroke="rgba(100, 100, 100, 0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                            <ellipse cx="32" cy="46" rx="5" ry="8" fill="white" opacity="0.95"/>
                            <circle cx="32" cy="46" r="3" fill="rgba(100, 100, 100, 0.6)"/>
                            <ellipse cx="68" cy="46" rx="5" ry="8" fill="white" opacity="0.95"/>
                            <circle cx="68" cy="46" r="3" fill="rgba(100, 100, 100, 0.6)"/>
                            <path d="M32 38 Q50 30 68 38" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95"/>
                            <path d="M32 50 Q28 55 28 60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                            <ellipse cx="28" cy="62" rx="2.5" ry="4" fill="white" opacity="0.95"/>
                          </svg>
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isCustomer ? 'order-first' : ''}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isCustomer
                              ? 'bg-gray-400 text-white rounded-br-md'
                              : 'bg-gray-200 text-gray-700 border border-gray-300 rounded-bl-md'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-line font-medium">{msg.message_text}</p>
                        </div>
                        <p className={`text-[11px] mt-1.5 px-1 ${isCustomer ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Session ended separator */}
                <div className="flex items-center gap-3 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <div className="bg-gray-100 px-4 py-2 rounded-full border border-gray-300">
                    <p className="text-xs font-semibold text-gray-600">Session Ended</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                
                {/* Start new chat button */}
                <div className="text-center pb-4">
                  <button
                    onClick={handleStartNewChat}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
            
            {messages.length === 0 && closedMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-semibold mb-3">How can we help you?</p>
                <div className="space-y-2 max-w-xs mx-auto">
                  <button
                    onClick={() => setNewMessage('I need help with my order')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md text-left flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '100ms' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Help with my order
                  </button>
                  <button
                    onClick={() => setNewMessage('I need help with my account')}
                    className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md text-left flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '200ms' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Help with my account
                  </button>
                  <button
                    onClick={() => setNewMessage('I have a question about a product')}
                    className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md text-left flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '300ms' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Question about a product
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isNewMessage = !previousMessageIds.has(msg.message_id);
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.message_id}
                    className={`flex gap-2 ${isCustomer ? 'justify-end' : 'justify-start'} ${isNewMessage ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
                  >
                    {/* Agent Avatar */}
                    {!isCustomer && (
                      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-emerald-200">
                        <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
                          <circle cx="50" cy="50" r="40" fill="white" opacity="0.1"/>
                          
                          {/* Head */}
                          <circle cx="50" cy="48" r="18" fill="white" opacity="0.95"/>
                          
                          {/* Hair */}
                          <ellipse cx="50" cy="35" rx="15" ry="8" fill="white" opacity="0.85"/>
                          
                          {/* Eyes */}
                          <circle cx="44" cy="46" r="2" fill="rgba(16, 185, 129, 0.9)"/>
                          <circle cx="56" cy="46" r="2" fill="rgba(16, 185, 129, 0.9)"/>
                          
                          {/* Smile */}
                          <path d="M44 54 Q50 57 56 54" stroke="rgba(16, 185, 129, 0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          
                          {/* Headset */}
                          <ellipse cx="32" cy="46" rx="5" ry="8" fill="white" opacity="0.95"/>
                          <circle cx="32" cy="46" r="3" fill="rgba(16, 185, 129, 0.6)"/>
                          <ellipse cx="68" cy="46" rx="5" ry="8" fill="white" opacity="0.95"/>
                          <circle cx="68" cy="46" r="3" fill="rgba(16, 185, 129, 0.6)"/>
                          <path d="M32 38 Q50 30 68 38" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95"/>
                          
                          {/* Mic */}
                          <path d="M32 50 Q28 55 28 60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                          <ellipse cx="28" cy="62" rx="2.5" ry="4" fill="white" opacity="0.95"/>
                        </svg>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`max-w-[75%] ${isCustomer ? 'order-first' : ''}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isCustomer
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-line font-medium">{msg.message_text}</p>
                      </div>
                      <p className={`text-[11px] mt-1.5 px-1 ${isCustomer ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Help Options */}
          {showHelpOptions && (
            <div className="p-4 bg-purple-50 border-t border-purple-200 animate-in slide-in-from-bottom-2 fade-in">
              <div className="mb-3">
                <p className="text-sm font-semibold text-purple-900 mb-3">🤔 What help do you need?</p>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      const message = `I need help with tracking for Order #${verifiedOrder?.order_number || verifiedOrder?.order_id}`;
                      await supportService.sendMessage({ 
                        message,
                        order_id: verifiedOrder?.order_id,
                        skip_telegram: true  // Don't send to Telegram - bot handles it
                      }, token!);
                      setShowHelpOptions(false);
                      await loadMessages();
                      // Bot handles tracking automatically - no Telegram notification
                      setTimeout(() => {
                        const botMessage = {
                          message_id: Date.now(),
                          message_text: `Your order is currently: ${verifiedOrder?.status}\n\n${verifiedOrder?.tracking_number ? `Tracking Number: ${verifiedOrder.tracking_number}` : 'Tracking information will be available once your order ships.'}`,
                          sender: 'admin' as const,
                          status: 'replied' as const,
                          created_at: new Date().toISOString(),
                        };
                        setMessages(prev => [...prev, botMessage]);
                      }, 500);
                    }}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105 text-left flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Track my order
                  </button>
                  <button
                    onClick={async () => {
                      const message = `I want to cancel/refund Order #${verifiedOrder?.order_number || verifiedOrder?.order_id}\nCustomer: ${orderFormData.name}`;
                      await supportService.sendMessage({ 
                        message,
                        order_id: verifiedOrder?.order_id 
                      }, token!);
                      setShowHelpOptions(false);
                      await loadMessages();
                      // Show connecting message
                      setTimeout(() => {
                        const connectingMessage = {
                          message_id: Date.now(),
                          message_text: "📞 Connecting you to a support agent...\n\nPlease wait while we transfer your request to our team. An agent will respond shortly.",
                          sender: 'admin' as const,
                          status: 'replied' as const,
                          created_at: new Date().toISOString(),
                        };
                        setMessages(prev => [...prev, connectingMessage]);
                      }, 500);
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105 text-left flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel or refund order
                  </button>
                  <button
                    onClick={async () => {
                      const message = `I have another issue with Order #${verifiedOrder?.order_number || verifiedOrder?.order_id}\nCustomer: ${orderFormData.name}`;
                      await supportService.sendMessage({ 
                        message,
                        order_id: verifiedOrder?.order_id 
                      }, token!);
                      setShowHelpOptions(false);
                      await loadMessages();
                      // Show connecting message
                      setTimeout(() => {
                        const connectingMessage = {
                          message_id: Date.now(),
                          message_text: "📞 Connecting you to a support agent...\n\nPlease describe your issue in detail. An agent will respond shortly to assist you.",
                          sender: 'admin' as const,
                          status: 'replied' as const,
                          created_at: new Date().toISOString(),
                        };
                        setMessages(prev => [...prev, connectingMessage]);
                      }, 500);
                    }}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105 text-left flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Other issue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Confirmation */}
          {showOrderConfirmation && verifiedOrder && (
            <div className="p-4 bg-green-50 border-t border-green-200 animate-in slide-in-from-bottom-2 fade-in">
              <div className="mb-3">
                <p className="text-sm font-semibold text-green-900 mb-2">✅ Order Found!</p>
                <div className="bg-white p-3 rounded-lg mb-3 text-sm">
                  <p className="font-medium">Order #{verifiedOrder.order_number || verifiedOrder.order_id}</p>
                  <p className="text-gray-600">Status: {verifiedOrder.status}</p>
                  <p className="text-gray-600">Total: ${verifiedOrder.total_amount}</p>
                </div>
                <p className="text-sm text-gray-700 mb-3">Is this your order?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowOrderConfirmation(false);
                      setShowHelpOptions(true);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Yes, that's it
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderConfirmation(false);
                      setVerifiedOrder(null);
                      setShowOrderForm(true);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    No, try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Form */}
          {showOrderForm && (
            <div className="p-4 bg-blue-50 border-t border-blue-200 animate-in slide-in-from-bottom-2 fade-in">
              <div className="mb-3">
                <p className="text-sm font-semibold text-blue-900 mb-3">📦 Order Help Form</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={orderFormData.name}
                      onChange={(e) => setOrderFormData({ ...orderFormData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={orderFormData.orderNumber}
                      onChange={(e) => setOrderFormData({ ...orderFormData, orderNumber: e.target.value })}
                      placeholder="e.g., ORD-12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (orderFormData.name && orderFormData.orderNumber && token) {
                        setLoading(true);
                        try {
                          // Fetch order by order number
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to fetch orders');
                          }
                          
                          const ordersData = await response.json();
                          // Handle different response formats
                          let orders = [];
                          if (Array.isArray(ordersData)) {
                            orders = ordersData;
                          } else if (ordersData.data && Array.isArray(ordersData.data)) {
                            orders = ordersData.data;
                          } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
                            orders = ordersData.orders;
                          }
                          
                          const foundOrder = orders.find((o: any) => 
                            o.order_number === orderFormData.orderNumber || 
                            o.order_id?.toString() === orderFormData.orderNumber
                          );

                          if (foundOrder) {
                            setVerifiedOrder(foundOrder);
                            setShowOrderForm(false);
                            setShowOrderConfirmation(true);
                          } else {
                            // Order not found
                            const botMessage = {
                              message_id: Date.now(),
                              message_text: `❌ I couldn't find an order with number "${orderFormData.orderNumber}".\n\nPlease double-check the order number and try again.`,
                              sender: 'admin' as const,
                              status: 'replied' as const,
                              created_at: new Date().toISOString(),
                            };
                            setMessages(prev => [...prev, botMessage]);
                            setShowOrderForm(false);
                            setOrderFormData({ name: '', orderNumber: '' });
                          }
                        } catch (error) {
                          console.error('Error fetching order:', error);
                          const botMessage = {
                            message_id: Date.now(),
                            message_text: `❌ Unable to verify order at this time. Please try again or contact support directly.`,
                            sender: 'admin' as const,
                            status: 'replied' as const,
                            created_at: new Date().toISOString(),
                          };
                          setMessages(prev => [...prev, botMessage]);
                          setShowOrderForm(false);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    disabled={!orderFormData.name || !orderFormData.orderNumber || loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {loading ? 'Checking...' : 'Submit Details'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  setLastActivity(Date.now()); // Track typing activity
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
