import React, { useState } from 'react';
import { WorkflowAPI } from '../services/api';
import { StepResult } from '../types';
import { Download, ShieldCheck, Layers, FileSpreadsheet, Play, Loader2, UploadCloud } from 'lucide-react';

interface StepState {
  status: 'idle' | 'in_progress' | 'completed' | 'error';
  result: StepResult | null;
  loading: boolean;
  error: string | null;
}

export default function WorkflowPipeline() {
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepState>>({
    1: { status: 'idle', result: null, loading: false, error: null },
    2: { status: 'idle', result: null, loading: false, error: null },
    3: { status: 'idle', result: null, loading: false, error: null },
    4: { status: 'idle', result: null, loading: false, error: null }
  });

  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['سهام']);
  const [customFiles, setCustomFiles] = useState<FileList | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string>('');

  const updateStepState = (step: number, updates: Partial<StepState>) => {
    setStepStatuses(prev => ({
      ...prev,
      [step]: { ...prev[step], ...updates }
    }));
  };

  const handleRunStep1 = async () => {
    updateStepState(1, { loading: true, error: null });
    try {
      const res = await WorkflowAPI.step1Download();
      updateStepState(1, { loading: false, status: 'completed', result: res.data.results });
    } catch (err: any) {
      updateStepState(1, { loading: false, status: 'error', error: err.response?.data?.detail || 'خطا در دانلود فایل‌ها' });
    }
  };

  const handleRunStep2 = async () => {
    updateStepState(2, { loading: true, error: null });
    try {
      const res = await WorkflowAPI.step2Unprotect();
      updateStepState(2, { loading: false, status: 'completed', result: res.data.results });
    } catch (err: any) {
      updateStepState(2, { loading: false, status: 'error', error: err.response?.data?.detail || 'خطا در رفع حالت Protected View' });
    }
  };

  const handleRunStep3Inspect = async () => {
    updateStepState(3, { loading: true, error: null });
    try {
      const res = await WorkflowAPI.step3Inspect();
      const data = res.data.results;
      setAvailableSheets(data.available_sheets || []);
      if (data.default_selected_sheet) {
        setSelectedSheets([data.default_selected_sheet]);
      }
      updateStepState(3, { loading: false, status: 'completed', result: data });
    } catch (err: any) {
      updateStepState(3, { loading: false, status: 'error', error: err.response?.data?.detail || 'خطا در بررسی فایل‌ها و شیت‌ها' });
    }
  };

  const handleRunStep4Consolidate = async () => {
    updateStepState(4, { loading: true, error: null });
    try {
      const res = await WorkflowAPI.consolidate(selectedSheets);
      updateStepState(4, { loading: false, status: 'completed', result: res.data.results });
    } catch (err: any) {
      updateStepState(4, { loading: false, status: 'error', error: err.response?.data?.detail || 'خطا در تلفیق فایل‌ها' });
    }
  };

  const handleUploadCustomFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFiles || customFiles.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < customFiles.length; i++) {
      data.append('files', customFiles[i]);
    }

    try {
      const res = await WorkflowAPI.uploadCustomFiles(data);
      setUploadMsg(res.data.message);
    } catch (err) {
      setUploadMsg('خطا در آپلود فایل‌های دستی');
    }
  };

  const handleSheetToggle = (sheet: string) => {
    if (selectedSheets.includes(sheet)) {
      setSelectedSheets(selectedSheets.filter(s => s !== sheet));
    } else {
      setSelectedSheets([...selectedSheets, sheet]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            فرآیند ۴ گام مجزا
          </span>
          <h2 className="text-xl font-bold">چرخه اجرای گام‌به‌گام دریافت و تلفیق پورتفوی</h2>
          <p className="text-slate-300 text-sm mt-1">
            هر گام را به صورت مستقل اجرا کنید یا ابتدا فایل‌های خود را برای تلفیق مستقیم آپلود کنید.
          </p>
        </div>

        <form onSubmit={handleUploadCustomFiles} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-2 min-w-[300px]">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            تلفیق فایل‌های از پیش دانلود شده
          </span>
          <input
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={(e) => setCustomFiles(e.target.files)}
            className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
          <button
            type="submit"
            disabled={!customFiles || customFiles.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs py-1.5 rounded-lg transition font-medium cursor-pointer"
          >
            ذخیره فایل‌های دستی
          </button>
          {uploadMsg && <p className="text-[11px] text-emerald-300 mt-1">{uploadMsg}</p>}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STEP 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  ۱
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">گام اول: دانلود فایل‌های اکسل</h3>
                  <p className="text-xs text-slate-500">دریافت آخرین گزارش ماهانه کدال برای تمامی صندوق‌ها</p>
                </div>
              </div>
              <Download className="w-5 h-5 text-slate-400" />
            </div>

            {stepStatuses[1].result && (
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 my-4">
                <p className="font-medium text-slate-700">نتیجه دانلود:</p>
                <div className="flex justify-between text-slate-600">
                  <span>کل صندوق‌ها: {stepStatuses[1].result.total}</span>
                  <span className="text-emerald-600">موفق: {stepStatuses[1].result.success}</span>
                  <span className="text-rose-600">ناموفق: {stepStatuses[1].result.failed}</span>
                </div>
              </div>
            )}

            {stepStatuses[1].error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4">
                {stepStatuses[1].error}
              </div>
            )}
          </div>

          <button
            onClick={handleRunStep1}
            disabled={stepStatuses[1].loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {stepStatuses[1].loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال دانلود از کدال...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                اجرای گام اول (دانلود)
              </>
            )}
          </button>
        </div>

        {/* STEP 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  ۲
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">گام دوم: رفع Protected View</h3>
                  <p className="text-xs text-slate-500">حذف قفل و آماده‌سازی خودکار فایل‌های اکسل دانلودی</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-slate-400" />
            </div>

            {stepStatuses[2].result && (
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 my-4">
                <p className="font-medium text-slate-700">نتیجه برطرف‌سازی قفل:</p>
                <div className="flex justify-between text-slate-600">
                  <span>کل فایل‌ها: {stepStatuses[2].result.total}</span>
                  <span className="text-emerald-600">پردازش شده: {stepStatuses[2].result.processed}</span>
                </div>
              </div>
            )}

            {stepStatuses[2].error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4">
                {stepStatuses[2].error}
              </div>
            )}
          </div>

          <button
            onClick={handleRunStep2}
            disabled={stepStatuses[2].loading}
            className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {stepStatuses[2].loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال رفع Protected View...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                اجرای گام دوم (آن‌پروتکت)
              </>
            )}
          </button>
        </div>

        {/* STEP 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ۳
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">گام سوم: انتخاب شیت‌ها (تلفیق خام)</h3>
                  <p className="text-xs text-slate-500">شناسایی شیت‌های اکسل و انتخاب جهت تلفیق کامل (پیش‌فرض: «سهام»)</p>
                </div>
              </div>
              <Layers className="w-5 h-5 text-slate-400" />
            </div>

            {availableSheets.length > 0 && (
              <div className="bg-emerald-50/50 p-3 rounded-xl my-4">
                <span className="text-xs font-semibold text-emerald-800 block mb-2">شیت‌های شناسایی شده:</span>
                <div className="flex flex-wrap gap-2">
                  {availableSheets.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSheetToggle(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedSheets.includes(s)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {s} {selectedSheets.includes(s) ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stepStatuses[3].error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4">
                {stepStatuses[3].error}
              </div>
            )}
          </div>

          <button
            onClick={handleRunStep3Inspect}
            disabled={stepStatuses[3].loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {stepStatuses[3].loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال بررسی شیت‌های اکسل...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                شناسایی و انتخاب شیت‌ها
              </>
            )}
          </button>
        </div>

        {/* STEP 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  ۴
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">گام چهارم: تولید اکسل تلفیقی نهایی</h3>
                  <p className="text-xs text-slate-500">حذف سربرگ، اضافه کردن ستون نام صندوق و ایجاد دو شیت خروجی</p>
                </div>
              </div>
              <FileSpreadsheet className="w-5 h-5 text-slate-400" />
            </div>

            {stepStatuses[4].result && (
              <div className="bg-purple-50 p-3 rounded-xl text-xs space-y-1 my-4">
                <p className="font-semibold text-purple-900">تلفیق با موفقیت انجام شد!</p>
                <p className="text-purple-700">تعداد صندوق‌های تلفیق شده: {stepStatuses[4].result.total_processed_files}</p>
                <p className="text-purple-700">تعداد ردیف داده تمیز: {stepStatuses[4].result.clean_total_rows}</p>
              </div>
            )}

            {stepStatuses[4].error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4">
                {stepStatuses[4].error}
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={handleRunStep4Consolidate}
              disabled={stepStatuses[4].loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {stepStatuses[4].loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ساخت اکسل تلفیقی...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  اجرای تلفیق نهایی (گام ۳ و ۴)
                </>
              )}
            </button>

            {stepStatuses[4].status === 'completed' && (
              <a
                href={WorkflowAPI.downloadResultUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition text-center"
              >
                <Download className="w-4 h-4" />
                دانلود فایل اکسل تلفیقی نهایی
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}