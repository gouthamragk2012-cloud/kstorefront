'use client';

import { useState, useEffect } from 'react';

export default function AvatarDemo() {
  const [agentTalking, setAgentTalking] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0; }
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Chatbot Avatar Demo</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bot Avatar */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Bot Avatar</h2>
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/30">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="30" width="50" height="45" rx="8" fill="white" opacity="0.15"/>
                <line x1="50" y1="30" x2="50" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="50" cy="18" r="3" fill="white"/>
                <g className="animate-blink">
                  <circle cx="38" cy="48" r="4" fill="white"/>
                  <circle cx="62" cy="48" r="4" fill="white"/>
                </g>
                <path d="M35 60 L42 60 M45 60 L55 60 M58 60 L65 60" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="30" cy="55" r="2" fill="white" opacity="0.3"/>
                <circle cx="70" cy="55" r="2" fill="white" opacity="0.3"/>
              </svg>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Friendly bot with blinking eyes and digital smile
          </p>
        </div>

        {/* Agent Avatar - Idle */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Support Agent (Idle)</h2>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/40">
                <svg className="w-32 h-32" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" fill="white" opacity="0.1"/>
                  <circle cx="60" cy="60" r="42" fill="white" opacity="0.08"/>
                  
                  {/* Head/Face */}
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
                  
                  {/* Headset - Left */}
                  <path d="M32 45 Q30 55 32 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                  <ellipse cx="32" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                  <ellipse cx="32" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                  <circle cx="32" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                  
                  {/* Headset - Right */}
                  <path d="M88 45 Q90 55 88 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                  <ellipse cx="88" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                  <ellipse cx="88" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                  <circle cx="88" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                  
                  {/* Headset band */}
                  <path d="M32 45 Q60 28 88 45" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.95"/>
                  <path d="M35 45 Q60 32 85 45" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Microphone boom */}
                  <path d="M32 60 Q28 68 28 75" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
                  
                  {/* Microphone */}
                  <ellipse cx="28" cy="78" rx="4" ry="6" fill="white" opacity="0.95"/>
                  <ellipse cx="28" cy="78" rx="3" ry="5" fill="rgba(16, 185, 129, 0.5)"/>
                  
                  {/* Neck/Shoulders */}
                  <path d="M45 80 Q60 88 75 80" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-400 rounded-full border-3 border-white shadow-md">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Professional support agent with headset
          </p>
        </div>

        {/* Agent Avatar - Talking */}
        <div className="bg-white p-8 rounded-2xl shadow-lg md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-center">Support Agent (Talking)</h2>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`w-40 h-40 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/40 transition-all duration-300 ${agentTalking ? 'animate-pulse-glow animate-subtle-bounce' : ''}`}>
                <svg className="w-40 h-40" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" fill="white" opacity="0.1"/>
                  <circle cx="60" cy="60" r="42" fill="white" opacity="0.08"/>
                  
                  {/* Head/Face */}
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
                  
                  {/* Headset - Left */}
                  <path d="M32 45 Q30 55 32 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                  <ellipse cx="32" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                  <ellipse cx="32" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                  <circle cx="32" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                  
                  {/* Headset - Right */}
                  <path d="M88 45 Q90 55 88 65" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.95"/>
                  <ellipse cx="88" cy="55" rx="8" ry="12" fill="white" opacity="0.95"/>
                  <ellipse cx="88" cy="55" rx="6" ry="10" fill="rgba(16, 185, 129, 0.3)"/>
                  <circle cx="88" cy="55" r="4" fill="rgba(16, 185, 129, 0.6)"/>
                  
                  {/* Headset band */}
                  <path d="M32 45 Q60 28 88 45" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.95"/>
                  <path d="M35 45 Q60 32 85 45" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Microphone boom */}
                  <path d="M32 60 Q28 68 28 75" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
                  
                  {/* Microphone */}
                  <ellipse cx="28" cy="78" rx="4" ry="6" fill="white" opacity="0.95"/>
                  <ellipse cx="28" cy="78" rx="3" ry="5" fill="rgba(16, 185, 129, 0.5)"/>
                  
                  {/* Sound waves when talking */}
                  {agentTalking && (
                    <g opacity="0.8">
                      <path d="M20 75 Q18 78 20 81" stroke="rgba(16, 185, 129, 0.9)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse"/>
                      <path d="M15 73 Q12 78 15 83" stroke="rgba(16, 185, 129, 0.7)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse" style={{animationDelay: '0.15s'}}/>
                      <path d="M10 71 Q6 78 10 85" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
                    </g>
                  )}
                  
                  {/* Neck/Shoulders */}
                  <path d="M45 80 Q60 88 75 80" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-emerald-400 rounded-full border-3 border-white shadow-md">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setAgentTalking(true);
                setTimeout(() => setAgentTalking(false), 3000);
              }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium shadow-lg hover:shadow-xl"
            >
              Start Talking (3s)
            </button>
            <button
              onClick={() => setAgentTalking(false)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium shadow-lg hover:shadow-xl"
            >
              Stop
            </button>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            Sound waves animate from microphone when agent is speaking!
          </p>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
        <h3 className="font-semibold text-lg mb-3 text-emerald-900">Professional Support Agent Features:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">🎧</span>
            <span><strong>Professional headset:</strong> Full headset with ear cups, headband, and microphone boom</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">🎙️</span>
            <span><strong>Microphone indicator:</strong> Visible microphone positioned near mouth</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">📡</span>
            <span><strong>Sound waves:</strong> Animated sound waves emit from mic when agent is talking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">👀</span>
            <span><strong>Friendly face:</strong> Simple, clean face with blinking eyes and smile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✨</span>
            <span><strong>Glow effect:</strong> Pulsing glow around avatar when speaking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">💚</span>
            <span><strong>Online status:</strong> Animated green indicator showing agent availability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">🎨</span>
            <span><strong>Premium design:</strong> Clean, professional look perfect for customer support</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
