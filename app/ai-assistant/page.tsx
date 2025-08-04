import Layout from '@/components/layout/Layout';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function AIAssistantPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Get help with ERP processes and general questions</p>
        </div>
        
        <ChatAssistant />
      </div>
    </Layout>
  );
}