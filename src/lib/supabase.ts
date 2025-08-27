import { createClient } from '@supabase/supabase-js';

// 模擬模式開關
const MOCK_MODE = true;

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

if (MOCK_MODE) {
  console.log('🔧 運行在模擬模式下，不會連接真實的Supabase服務');
}

// 創建Supabase客戶端（模擬模式下使用假配置）
export const supabase = MOCK_MODE ? 
  null as any : // 模擬模式下不創建真實客戶端
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

// 模擬數據生成器
const generateMockId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateMockUser = () => ({
  id: generateMockId(),
  email: 'user@example.com',
  created_at: new Date().toISOString(),
  user_metadata: { name: '測試用戶' }
});

const generateMockProject = () => ({
  id: generateMockId(),
  user_id: generateMockId(),
  title: '測試項目',
  prompt: '這是一個測試提示詞',
  settings: {},
  status: 'draft',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const generateMockJob = () => ({
  id: generateMockId(),
  user_id: generateMockId(),
  project_id: generateMockId(),
  status: 'pending',
  progress: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const generateMockVideo = () => ({
  id: generateMockId(),
  user_id: generateMockId(),
  project_id: generateMockId(),
  video_url: 'https://example.com/mock-video.mp4',
  format: 'MP4',
  quality: 'HD',
  file_size: 1024000,
  duration: 30.5,
  status: 'completed',
  created_at: new Date().toISOString()
});

// 數據庫表名常量
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  PROCESSING_JOBS: 'processing_jobs',
  PROMPTS: 'prompts'
} as const;

// 存儲桶名稱常量
export const BUCKETS = {
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails'
} as const;

// 認證相關函數
export const auth = {
  // 註冊
  signUp: async (email: string, password: string, metadata?: any) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬註冊:', email);
      const mockUser = generateMockUser();
      return {
        data: {
          user: { ...mockUser, email },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: { ...mockUser, email }
          }
        },
        error: null
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // 登入
  signIn: async (email: string, password: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬登入:', email);
      const mockUser = generateMockUser();
      return {
        data: {
          user: { ...mockUser, email },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: { ...mockUser, email }
          }
        },
        error: null
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // 登出
  signOut: async () => {
    if (MOCK_MODE) {
      console.log('🔧 模擬登出');
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 獲取當前用戶
  getCurrentUser: async () => {
    if (MOCK_MODE) {
      console.log('🔧 模擬獲取當前用戶');
      const mockUser = generateMockUser();
      return { user: mockUser, error: null };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 重置密碼
  resetPassword: async (email: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬重置密碼:', email);
      return { data: { message: '密碼重置郵件已發送' }, error: null };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // 更新用戶資料
  updateUser: async (updates: any) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬更新用戶資料:', updates);
      const mockUser = { ...generateMockUser(), ...updates };
      return { data: { user: mockUser }, error: null };
    }
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  }
};

// 存儲相關函數
export const storage = {
  // 上傳照片
  uploadPhoto: async (file: File, userId: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬上傳照片:', file.name);
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const publicUrl = `https://mock.supabase.co/storage/v1/object/public/photos/${fileName}`;
      return { data: { path: fileName, publicUrl }, error: null };
    }
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(BUCKETS.PHOTOS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.PHOTOS)
      .getPublicUrl(fileName);
    
    return { data: { path: fileName, publicUrl }, error: null };
  },

  // 上傳視頻
  uploadVideo: async (file: File, userId: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬上傳視頻:', file.name);
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const publicUrl = `https://mock.supabase.co/storage/v1/object/public/videos/${fileName}`;
      return { data: { path: fileName, publicUrl }, error: null };
    }
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(BUCKETS.VIDEOS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.VIDEOS)
      .getPublicUrl(fileName);
    
    return { data: { path: fileName, publicUrl }, error: null };
  },

  // 刪除照片
  deletePhoto: async (path: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬刪除照片:', path);
      return { data: [{ name: path }], error: null };
    }
    const { data, error } = await supabase.storage
      .from(BUCKETS.PHOTOS)
      .remove([path]);
    return { data, error };
  },

  // 刪除視頻
  deleteVideo: async (path: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬刪除視頻:', path);
      return { data: [{ name: path }], error: null };
    }
    const { data, error } = await supabase.storage
      .from(BUCKETS.VIDEOS)
      .remove([path]);
    return { data, error };
  },

  // 獲取公開URL
  getPublicUrl: (bucket: string, path: string) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬獲取公開URL:', bucket, path);
      return `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}`;
    }
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
};

// 數據庫操作相關函數
export const database = {
  // 項目相關操作
  projects: {
    create: async (project: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬創建項目:', project);
        const mockProject = {
          ...generateMockProject(),
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { data: mockProject, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .insert(project)
        .select()
        .single();
      return { data, error };
    },

    getByUserId: async (userId: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬獲取用戶項目列表:', userId);
        const mockProjects = Array.from({ length: 3 }, () => ({
          ...generateMockProject(),
          user_id: userId
        }));
        return { data: mockProjects, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬獲取單個項目:', id);
        const mockProject = { ...generateMockProject(), id };
        return { data: mockProject, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬更新項目:', id, updates);
        const mockProject = {
          ...generateMockProject(),
          id,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return { data: mockProject, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬刪除項目:', id);
        return { data: null, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // 處理任務相關操作
  jobs: {
    create: async (job: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬創建處理任務:', job);
        const mockJob = {
          ...generateMockJob(),
          ...job,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { data: mockJob, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROCESSING_JOBS)
        .insert(job)
        .select()
        .single();
      return { data, error };
    },

    getById: async (id: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬獲取任務狀態:', id);
        const mockJob = { ...generateMockJob(), id };
        return { data: mockJob, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROCESSING_JOBS)
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬更新任務狀態:', id, updates);
        const mockJob = {
          ...generateMockJob(),
          id,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return { data: mockJob, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROCESSING_JOBS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    getByUserId: async (userId: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬獲取用戶處理任務:', userId);
        const mockJobs = Array.from({ length: 2 }, () => ({
          ...generateMockJob(),
          user_id: userId
        }));
        return { data: mockJobs, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.PROCESSING_JOBS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    }
  },

  // 影片相關操作
  videos: {
    create: async (video: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬創建影片記錄:', video);
        const mockVideo = {
          ...generateMockVideo(),
          ...video,
          created_at: new Date().toISOString()
        };
        return { data: mockVideo, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.VIDEOS)
        .insert(video)
        .select()
        .single();
      return { data, error };
    },

    getByUserId: async (userId: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬獲取用戶影片列表:', userId);
        const mockVideos = Array.from({ length: 3 }, () => ({
          ...generateMockVideo(),
          user_id: userId
        }));
        return { data: mockVideos, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.VIDEOS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬更新影片記錄:', id, updates);
        const mockVideo = {
          ...generateMockVideo(),
          id,
          ...updates
        };
        return { data: mockVideo, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.VIDEOS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      if (MOCK_MODE) {
        console.log('🔧 模擬刪除影片記錄:', id);
        return { data: null, error: null };
      }
      const { data, error } = await supabase
        .from(TABLES.VIDEOS)
        .delete()
        .eq('id', id);
      return { data, error };
    }
  }
};

// 實時訂閱函數
export const realtime = {
  // 訂閱處理任務狀態變化
  subscribeToJobUpdates: (jobId: string, callback: (payload: any) => void) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬訂閱任務狀態變化:', jobId);
      // 模擬定期更新任務狀態
      const interval = setInterval(() => {
        const mockPayload = {
          eventType: 'UPDATE',
          new: {
            ...generateMockJob(),
            id: jobId,
            progress: Math.min(100, Math.floor(Math.random() * 100)),
            status: Math.random() > 0.7 ? 'completed' : 'processing'
          },
          old: null
        };
        callback(mockPayload);
      }, 2000);
      
      return () => {
        console.log('🔧 取消模擬任務狀態訂閱:', jobId);
        clearInterval(interval);
      };
    }
    
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.PROCESSING_JOBS,
          filter: `id=eq.${jobId}`
        },
        callback
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 訂閱項目變化
  subscribeToProjectUpdates: (userId: string, callback: (payload: any) => void) => {
    if (MOCK_MODE) {
      console.log('🔧 模擬訂閱項目變化:', userId);
      // 模擬項目變化事件
      const interval = setInterval(() => {
        const mockPayload = {
          eventType: 'UPDATE',
          new: {
            ...generateMockProject(),
            user_id: userId,
            updated_at: new Date().toISOString()
          },
          old: null
        };
        callback(mockPayload);
      }, 5000);
      
      return () => {
        console.log('🔧 取消模擬項目變化訂閱:', userId);
        clearInterval(interval);
      };
    }
    
    const channel = supabase
      .channel(`projects-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PROJECTS,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export default supabase;