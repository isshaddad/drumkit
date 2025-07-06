export interface Load {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: string;
  weight: number;
  created_at: string;
}

export interface CreateLoadRequest {
  reference: string;
  origin: string;
  destination: string;
  weight: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
