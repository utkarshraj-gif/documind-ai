// ============================================
// Types that mirror the backend Pydantic schemas
// ============================================

// --- Auth ---
export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// --- Documents ---
export interface DocumentPageText {
  page: number;
  text: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail extends DocumentItem {
  extracted_text_pages?: DocumentPageText[];
  analysis?: DocumentAnalysis | null;
  chat_session_id?: string;
}

// --- Analysis ---
export interface ExtractedEntities {
  document_type: string;
  person_names: string[];
  organizations: string[];
  dates: string[];
  addresses: string[];
  amounts: string[];
  document_numbers: string[];
}

export interface DocumentAnalysis {
  id: string;
  document_id: string;
  document_type: string;
  summary: string;
  key_points: string[];
  extracted_entities: ExtractedEntities;
  created_at: string;
  updated_at: string;
}

// --- Chat ---
export interface SourceItem {
  page: number;
  text: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  created_at?: string;
}

export interface ChatHistory {
  session_id: string;
  document_id: string;
  messages: ChatMessage[];
}

// --- Dashboard ---
export interface DashboardStats {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  total_questions: number;
  recent_documents: DocumentItem[];
}
