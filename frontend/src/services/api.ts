import axios from "axios";
import type { DocumentChunk, DocumentDetail, DocumentListItem, UploadResponse } from "../types/document";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000
});

export async function uploadDocument(
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<UploadResponse>("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    }
  });
  return response.data;
}

export async function listDocuments(): Promise<DocumentListItem[]> {
  const response = await api.get<DocumentListItem[]>("/api/documents");
  return response.data;
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const response = await api.get<DocumentDetail>(`/api/documents/${id}`);
  return response.data;
}

export async function getDocumentChunks(id: string): Promise<DocumentChunk[]> {
  const response = await api.get<DocumentChunk[]>(`/api/documents/${id}/chunks`);
  return response.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/api/documents/${id}`);
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    return error.message;
  }
  return "Something went wrong";
}
