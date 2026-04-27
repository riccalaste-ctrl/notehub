export interface Subject {
  id: string;
  name: string;
  slug: string;
  gas_url: string | null;
  gas_secret: string | null;
  enabled: boolean;
  created_at: string;
}

export interface Professor {
  id: string;
  name: string;
  created_at: string;
}

export interface SubjectProfessor {
  id: string;
  subject_id: string;
  professor_id: string;
}

export interface Upload {
  id: string;
  subject_id: string;
  professor_id: string | null;
  original_filename: string;
  drive_file_id: string;
  download_url: string;
  view_url: string;
  mime_type: string;
  size_bytes: number;
  uploader_name: string | null;
  created_at: string;
}

export interface UploadWithDetails extends Upload {
  subject_name?: string;
  subject_slug?: string;
  professor_name?: string;
}

export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  webViewLink: string;
  webContentLink: string;
  iconLink: string;
}

export interface GASResponse {
  success: boolean;
  fileId?: string;
  viewUrl?: string;
  downloadUrl?: string;
  files?: FileItem[];
  error?: string;
}

export interface UploadRequest {
  file: File;
  subjectId: string;
  professorId?: string;
  uploaderName?: string;
}

export interface UploadResponse {
  success: boolean;
  upload?: Upload;
  error?: string;
}