import { supabase, auth, storage, database } from '../lib/supabase';
import type {
  User,
  UploadedPhoto,
  VideoGenerationRequest,
  ProcessingJob,
  GeneratedVideo,
  SubtitleConfig,
  ApiResponse,
  PaginatedResponse
} from '../types';

// API基礎配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// HTTP請求工具函數
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: data.message || '請求失敗'
        },
        data: null,
        timestamp: new Date()
      };
    }

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REQUEST_ERROR',
        message: error instanceof Error ? error.message : '網絡錯誤'
      },
      data: null,
      timestamp: new Date()
    };
  }
};

// 認證API
export const authAPI = {
  // 註冊
  register: async (email: string, password: string, displayName?: string) => {
    const { data, error } = await auth.signUp(email, password, {
      display_name: displayName
    });
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 登入
  login: async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 登出
  logout: async () => {
    const { error } = await auth.signOut();
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data: null, error: null };
  },

  // 獲取當前用戶
  getCurrentUser: async () => {
    const { user, error } = await auth.getCurrentUser();
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data: user, error: null };
  },

  // 重置密碼
  resetPassword: async (email: string) => {
    const { data, error } = await auth.resetPassword(email);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 更新用戶資料
  updateProfile: async (updates: Partial<User>) => {
    const { data, error } = await auth.updateUser(updates);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  }
};

// 照片上傳API
export const photoAPI = {
  // 上傳照片
  upload: async (files: File[], onProgress?: (progress: number) => void) => {
    try {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: '用戶未登入', data: null };
      }

      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${user.id}/${Date.now()}-${index}-${file.name}`;
        const { data, error } = await storage.uploadPhoto(file, fileName);
        
        if (error) {
          throw new Error(`上傳失敗: ${error.message}`);
        }
        
        const url = storage.getPublicUrl('photos', fileName);
        
        return {
          id: `photo-${Date.now()}-${index}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          thumbnail: url, // 使用相同URL作為縮圖
          uploadedAt: new Date()
        } as UploadedPhoto;
      });

      const photos = await Promise.all(uploadPromises);
      onProgress?.(100);
      
      return { success: true, data: photos, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上傳失敗',
        data: null
      };
    }
  },

  // 刪除照片
  delete: async (photoPath: string) => {
    const { data, error } = await storage.deletePhoto(photoPath);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 獲取照片列表
  getList: async (userId: string, page = 1, limit = 20) => {
    return apiRequest<PaginatedResponse<UploadedPhoto>>(
      `/photos?userId=${userId}&page=${page}&limit=${limit}`
    );
  }
};

// 影片生成API
export const videoAPI = {
  // 創建影片生成任務
  generate: async (request: VideoGenerationRequest) => {
    return apiRequest<ProcessingJob>('/videos/generate', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  // 獲取處理任務狀態
  getJobStatus: async (jobId: string) => {
    const { data, error } = await database.jobs.getById(jobId);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 獲取用戶的影片列表
  getList: async (userId: string, page = 1, limit = 20) => {
    const { data, error } = await database.videos.getByUserId(userId);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    // 簡單分頁處理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data?.slice(startIndex, endIndex) || [];
    
    return {
      success: true,
      data: {
        items: paginatedData,
        total: data?.length || 0,
        page,
        limit,
        totalPages: Math.ceil((data?.length || 0) / limit)
      },
      error: null
    };
  },

  // 下載影片
  download: async (videoId: string, quality: string) => {
    return apiRequest<{ downloadUrl: string }>(
      `/videos/${videoId}/download?quality=${quality}`
    );
  },

  // 刪除影片
  delete: async (videoId: string) => {
    const { data, error } = await database.videos.delete(videoId);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  }
};

// 項目管理API
export const projectAPI = {
  // 創建項目
  create: async (name: string, description?: string) => {
    const { user } = await auth.getCurrentUser();
    if (!user) {
      return { success: false, error: '用戶未登入', data: null };
    }

    const project = {
      name,
      description,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await database.projects.create(project);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 獲取用戶項目列表
  getList: async (userId: string) => {
    const { data, error } = await database.projects.getByUserId(userId);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 更新項目
  update: async (projectId: string, updates: any) => {
    const { data, error } = await database.projects.update(projectId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  },

  // 刪除項目
  delete: async (projectId: string) => {
    const { data, error } = await database.projects.delete(projectId);
    
    if (error) {
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data, error: null };
  }
};

// 提示詞API
export const promptAPI = {
  // 獲取提示詞範例
  getExamples: async (category?: string) => {
    return apiRequest<any[]>(
      `/prompts/examples${category ? `?category=${category}` : ''}`
    );
  },

  // 保存用戶提示詞
  save: async (prompt: string, category?: string) => {
    return apiRequest<any>('/prompts', {
      method: 'POST',
      body: JSON.stringify({ prompt, category })
    });
  },

  // 獲取用戶提示詞歷史
  getHistory: async (userId: string, page = 1, limit = 20) => {
    return apiRequest<PaginatedResponse<any>>(
      `/prompts/history?userId=${userId}&page=${page}&limit=${limit}`
    );
  }
};

// 字幕API
export const subtitleAPI = {
  // 自動生成字幕
  generate: async (videoId: string, language = 'zh-TW') => {
    return apiRequest<SubtitleConfig[]>('/subtitles/generate', {
      method: 'POST',
      body: JSON.stringify({ videoId, language })
    });
  },

  // 保存字幕配置
  save: async (videoId: string, subtitles: SubtitleConfig[]) => {
    return apiRequest<any>('/subtitles', {
      method: 'POST',
      body: JSON.stringify({ videoId, subtitles })
    });
  },

  // 獲取字幕配置
  get: async (videoId: string) => {
    return apiRequest<SubtitleConfig[]>(`/subtitles/${videoId}`);
  }
};

// 統計API
export const analyticsAPI = {
  // 獲取用戶統計數據
  getUserStats: async (userId: string) => {
    return apiRequest<any>(`/analytics/users/${userId}`);
  },

  // 記錄用戶行為
  trackEvent: async (event: string, properties?: any) => {
    return apiRequest<any>('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ event, properties })
    });
  }
};

// 導出所有API
export const api = {
  auth: authAPI,
  photo: photoAPI,
  video: videoAPI,
  project: projectAPI,
  prompt: promptAPI,
  subtitle: subtitleAPI,
  analytics: analyticsAPI
};

export default api;