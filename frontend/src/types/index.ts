export interface Fund {
  id: number;
  name: string;
  codal_url: string;
  created_at: string;
  updated_at: string;
}

export interface FundCreate {
  name: string;
  codal_url: string;
}

export interface FundUpdate {
  name?: string;
  codal_url?: string;
}

export interface StepResult {
  total?: number;
  success?: number;
  failed?: number;
  processed?: number;
  files?: any[];
  errors?: any[];
  available_sheets?: string[];
  default_selected_sheet?: string;
  total_processed_files?: number;
  clean_total_rows?: number;
}