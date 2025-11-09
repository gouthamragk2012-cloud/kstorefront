'use client';

import ChatWidget from '@/components/ChatWidget';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Customer Support
          </h1>
          <p className="text-gray-600 text-lg">We're here to help you!</p>
        </div>
        
        <ChatWidget />
      </div>
    </div>
  );
}
