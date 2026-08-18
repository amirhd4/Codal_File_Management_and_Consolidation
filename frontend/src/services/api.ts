import axios from 'axios';
import { Fund, FundCreate, FundUpdate } from '../types';

const API_BASE = '/api/v1';

export const FundAPI = {
  getFunds: () => axios.get<Fund[]>(`${API_BASE}/funds/`),
  createFund: (data: FundCreate) => axios.post<Fund>(`${API_BASE}/funds/`, data),
  updateFund: (id: number, data: FundUpdate) => axios.put<Fund>(`${API_BASE}/funds/${id}`, data),
  deleteFund: (id: number) => axios.delete(`${API_BASE}/funds/${id}`),
  exportExcel: () => `${API_BASE}/funds/export/excel`,
  importExcel: (formData: FormData, replace: boolean) =>
    axios.post<Fund[]>(`${API_BASE}/funds/import/excel?replace_existing=${replace}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const WorkflowAPI = {
  step1Download: () => axios.post(`${API_BASE}/workflow/step1/download`),
  step2Unprotect: () => axios.post(`${API_BASE}/workflow/step2/unprotect`),
  step3Inspect: () => axios.get(`${API_BASE}/workflow/step3/inspect`),
  consolidate: (selectedSheets: string[]) =>
    axios.post(`${API_BASE}/workflow/step3-4/consolidate`, { selected_sheets: selectedSheets }),
  downloadResultUrl: () => `${API_BASE}/workflow/download-result`,
  uploadCustomFiles: (formData: FormData) =>
    axios.post(`${API_BASE}/workflow/upload-files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};