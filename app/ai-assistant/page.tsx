'use client';
import Layout from '@/components/layout/Layout';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function AIAssistantPage() {
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm sm:text-base text-gray-600">Get help with ERP processes and general questions</p>
        </div>
        
        <ChatAssistant />
      </div>
    </Layout>
  );
}