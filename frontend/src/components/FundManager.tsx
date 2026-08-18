import React, { useState, useEffect } from 'react';
import { FundAPI } from '../services/api';
import { Fund } from '../types';
import { Plus, Trash2, Edit3, Download, Upload, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FundManager() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [formData, setFormData] = useState({ name: '', codal_url: '' });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const res = await FundAPI.getFunds();
      setFunds(res.data);
      setError('');
    } catch (err) {
      setError('خطا در دریافت لیست صندوق‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (fund: Fund | null = null) => {
    if (fund) {
      setEditingFund(fund);
      setFormData({ name: fund.name, codal_url: fund.codal_url });
    } else {
      setEditingFund(null);
      setFormData({ name: '', codal_url: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.codal_url) {
      setError('لطفاً تمامی فیلدها را پر کنید.');
      return;
    }
    try {
      if (editingFund) {
        await FundAPI.updateFund(editingFund.id, formData);
        setSuccess('اطلاعات صندوق با موفقیت بروزرسانی شد.');
      } else {
        await FundAPI.createFund(formData);
        setSuccess('صندوق جدید با موفقیت اضافه شد.');
      }
      setShowModal(false);
      fetchFunds();
    } catch (err) {
      setError('خطا در ذخیره‌سازی اطلاعات صندوق');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این صندوق اطمینان دارید؟')) return;
    try {
      await FundAPI.deleteFund(id);
      setSuccess('صندوق با موفقیت حذف شد.');
      fetchFunds();
    } catch (err) {
      setError('خطا در حذف صندوق');
    }
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setError('لطفاً یک فایل اکسل انتخاب کنید.');
      return;
    }
    const data = new FormData();
    data.append('file', importFile);
    try {
      setLoading(true);
      const res = await FundAPI.importExcel(data, replaceExisting);
      setSuccess(`تعداد ${res.data.length} صندوق با موفقیت بارگذاری گردید.`);
      setImportFile(null);
      fetchFunds();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'خطا در بارگذاری فایل اکسل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">مدیریت لیست صندوق‌ها ({funds.length} صندوق)</h2>
          <p className="text-slate-500 text-sm mt-1">ویرایش، افزودن، خروجی و بارگذاری لیست صندوق‌های بورسی</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            افزودن صندوق جدید
          </button>
          <a
            href={FundAPI.exportExcel()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            خروجی اکسل
          </a>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          بارگذاری (Import) لیست صندوق‌ها از اکسل
        </h3>
        <form onSubmit={handleImportExcel} className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            جایگزینی کامل لیست موجود
          </label>
          <button
            type="submit"
            disabled={loading || !importFile}
            className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            بارگذاری فایل
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4 w-16">#</th>
                <th className="p-4">نام صندوق</th>
                <th className="p-4">لینک در سایت کدال</th>
                <th className="p-4 w-32 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    هیچ صندوقی یافت نشد. می‌توانید با دکمه بالا یا بارگذاری اکسل صندوق اضافه کنید.
                  </td>
                </tr>
              ) : (
                funds.map((fund, idx) => (
                  <tr key={fund.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-semibold text-slate-800">{fund.name}</td>
                    <td className="p-4">
                      <a
                        href={fund.codal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 truncate max-w-md text-xs dir-ltr"
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{fund.codal_url}</span>
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(fund)}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                          title="ویرایش"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingFund ? 'ویرایش اطلاعات صندوق' : 'افزودن صندوق جدید'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نام صندوق</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: صندوق سرمایه‌گذاری پیشتاز"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">لینک کدال</label>
                <input
                  type="url"
                  value={formData.codal_url}
                  onChange={(e) => setFormData({ ...formData, codal_url: e.target.value })}
                  placeholder="https://codal.ir/..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm dir-ltr"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}