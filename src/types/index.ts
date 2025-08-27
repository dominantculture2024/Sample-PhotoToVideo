// 用戶相關類型
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 照片上傳相關類型
export interface UploadedPhoto {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
}

export interface PhotoUploadProgress {
  photoId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

// AI提示詞相關類型
export interface AIPrompt {
  id: string;
  content: string;
  category: 'landscape' | 'portrait' | 'commercial' | 'travel' | 'custom';
  tags: string[];
  isExample: boolean;
  createdAt: Date;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  examples: AIPrompt[];
}

// 字幕相關類型
export interface SubtitleItem {
  id: string;
  text: string;
  startTime: number; // 秒
  endTime: number; // 秒
  position: {
    x: number; // 百分比 0-100
    y: number; // 百分比 0-100
  };
}

export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  padding: number;
  borderRadius: number;
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface SubtitleConfig {
  items: SubtitleItem[];
  style: SubtitleStyle;
  enabled: boolean;
}

// 影片生成相關類型
export interface VideoGenerationRequest {
  id: string;
  userId: string;
  photos: UploadedPhoto[];
  prompt: string;
  subtitles: SubtitleConfig;
  settings: {
    duration: number; // 秒
    resolution: '480p' | '720p' | '1080p' | '2160p';
    frameRate: 24 | 30 | 60;
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
    transition: 'fade' | 'slide' | 'zoom' | 'dissolve';
    backgroundMusic?: {
      enabled: boolean;
      file?: File;
      volume: number;
    };
  };
  createdAt: Date;
}

// 處理進度相關類型
export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface ProcessingJob {
  id: string;
  requestId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  steps: ProcessingStep[];
  currentStep?: string;
  estimatedTimeRemaining?: number; // 秒
  startTime: Date;
  endTime?: Date;
  error?: string;
}

// 生成結果相關類型
export interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
  fileSize: string;
  bitrate: number;
  url?: string;
}

export interface GeneratedVideo {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  duration: number;
  thumbnail: string;
  qualities: VideoQuality[];
  metadata: {
    originalPhotos: number;
    promptUsed: string;
    subtitlesCount: number;
    processingTime: number; // 秒
  };
  createdAt: Date;
  expiresAt: Date;
}

// API響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<{ items: T[] }> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 應用狀態類型
export interface AppState {
  user: User | null;
  currentProject: {
    photos: UploadedPhoto[];
    prompt: string;
    subtitles: SubtitleConfig;
    settings: VideoGenerationRequest['settings'];
  } | null;
  processing: {
    currentJob: ProcessingJob | null;
    history: ProcessingJob[];
  };
  videos: GeneratedVideo[];
  ui: {
    loading: boolean;
    error: string | null;
    notifications: Notification[];
  };
}

// 通知類型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // 毫秒，undefined表示不自動消失
  createdAt: Date;
}

// 表單驗證類型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

// 文件上傳類型
export interface FileUploadConfig {
  maxSize: number; // bytes
  allowedTypes: string[];
  maxFiles: number;
  quality?: number; // 0-1 for image compression
}

// 導出所有類型的聯合類型，方便使用
export type PhotoToVideoTypes = {
  User: User;
  UploadedPhoto: UploadedPhoto;
  PhotoUploadProgress: PhotoUploadProgress;
  AIPrompt: AIPrompt;
  PromptCategory: PromptCategory;
  SubtitleItem: SubtitleItem;
  SubtitleStyle: SubtitleStyle;
  SubtitleConfig: SubtitleConfig;
  VideoGenerationRequest: VideoGenerationRequest;
  ProcessingStep: ProcessingStep;
  ProcessingJob: ProcessingJob;
  VideoQuality: VideoQuality;
  GeneratedVideo: GeneratedVideo;
  ApiResponse: ApiResponse<any>;
  AppState: AppState;
  Notification: Notification;
  ValidationError: ValidationError;
  FileUploadConfig: FileUploadConfig;
};