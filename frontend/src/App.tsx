import { useState } from 'react';
import FundManager from './components/FundManager';
import WorkflowPipeline from './components/WorkflowPipeline.tsx';
import { Database, FileSpreadsheet, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'funds'>('workflow');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">سامانه تلفیق پورتفوی صندوق‌های کدال</h1>
              <p className="text-xs text-slate-500">نرم‌افزار جامع دریافت، آن‌پروتکت و تلفیق اکسل‌های بورس</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'workflow'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              چرخه تلفیق ۴ گامه
            </button>
            <button
              onClick={() => setActiveTab('funds')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'funds'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              مدیریت لیست صندوق‌ها
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workflow' && <WorkflowPipeline />}
        {activeTab === 'funds' && <FundManager />}
      </main>
    </div>
  );
}
