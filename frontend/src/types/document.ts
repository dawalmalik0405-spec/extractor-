export interface DocumentListItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  total_chunks: number;
  created_at: string;
}

export interface DocumentDetail extends DocumentListItem {
  file_path: string;
  extracted_text: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}

export interface UploadResponse {
  document_id: string;
  status: string;
}
