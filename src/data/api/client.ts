/** @format */

import { create, type AxiosRequestConfig } from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const instance = create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.post<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.delete<T>(url, config);
    return response.data;
  },
};
