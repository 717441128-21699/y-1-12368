import axios from 'axios';
import type { ApiResponse } from '../types';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  return request.get(url, { params });
}

export async function post<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
  return request.post(url, data);
}

export async function put<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
  return request.put(url, data);
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  return request.delete(url);
}

export async function uploadFile<T>(url: string, file: File): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export default request;
