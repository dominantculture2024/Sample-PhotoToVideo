import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '../services/api';
import { supabase, realtime } from '../lib/supabase';
import type {
  AppState,
  User,
  UploadedPhoto,
  SubtitleConfig,
  VideoGenerationRequest,
  ProcessingJob,
  GeneratedVideo,
  Notification
} from '../types';

// 初始字幕配置
const initialSubtitleConfig: SubtitleConfig = {
  items: [],
  style: {
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    textAlign: 'center',
    verticalAlign: 'bottom',
    padding: 8,
    borderRadius: 4,
    shadow: {
      enabled: true,
      color: '#000000',
      blur: 2,
      offsetX: 1,
      offsetY: 1
    }
  },
  enabled: true
};

// 初始影片設定
const initialVideoSettings: VideoGenerationRequest['settings'] = {
  duration: 30,
  resolution: '1080p',
  frameRate: 30,
  aspectRatio: '16:9',
  transition: 'fade',
  backgroundMusic: {
    enabled: false,
    volume: 0.5
  }
};

interface AppStore extends AppState {
  // 認證相關操作
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // 用戶相關操作
  setUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  
  // 項目相關操作
  setPhotos: (photos: UploadedPhoto[]) => void;
  addPhoto: (photo: UploadedPhoto) => void;
  removePhoto: (photoId: string) => void;
  setPrompt: (prompt: string) => void;
  setSubtitles: (subtitles: SubtitleConfig) => void;
  setVideoSettings: (settings: VideoGenerationRequest['settings']) => void;
  updateProject: (updates: Partial<{ prompt: string; subtitles: SubtitleConfig; settings: VideoGenerationRequest['settings'] }>) => void;
  clearCurrentProject: () => void;
  createProject: (name: string, description?: string) => Promise<boolean>;
  loadUserProjects: () => Promise<void>;
  
  // 照片相關操作
  uploadPhotos: (files: File[]) => Promise<boolean>;
  
  // 處理進度相關操作
  setCurrentJob: (job: ProcessingJob | null) => void;
  updateJobProgress: (jobId: string, progress: number) => void;
  updateJobStatus: (jobId: string, status: ProcessingJob['status']) => void;
  addJobToHistory: (job: ProcessingJob) => void;
  startVideoGeneration: () => Promise<boolean>;
  subscribeToJobUpdates: (jobId: string) => void;
  
  // 影片相關操作
  addVideo: (video: GeneratedVideo) => void;
  removeVideo: (videoId: string) => void;
  setVideos: (videos: GeneratedVideo[]) => void;
  loadUserVideos: () => Promise<void>;
  
  // 字幕相關操作
  addSubtitle: (subtitle: any) => void;
  updateSubtitle: (id: string, updates: any) => void;
  removeSubtitle: (id: string) => void;
  generateSubtitles: (videoId: string) => Promise<boolean>;
  downloadVideo: (videoId: string, quality: string) => Promise<boolean>;
  
  // UI狀態操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // 初始化相關操作
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(devtools(
  persist(
    (set, get) => ({
        // 初始狀態
        user: null,
        currentProject: null,
        processing: {
          currentJob: null,
          history: []
        },
        videos: [],
        ui: {
          loading: false,
          error: null,
          notifications: []
        },

        // 認證相關操作
        login: async (email, password) => {
          const result = await api.auth.login(email, password);
          if (result.success && result.data?.user) {
            set({ user: result.data.user as User });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '登入失敗',
              message: result.error || '請檢查您的帳號密碼'
            });
            return false;
          }
        },
        
        register: async (email, password, displayName) => {
          const result = await api.auth.register(email, password, displayName);
          if (result.success) {
            get().addNotification({
              type: 'success',
              title: '註冊成功',
              message: '請檢查您的信箱以驗證帳號'
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '註冊失敗',
              message: result.error || '註冊過程中發生錯誤'
            });
            return false;
          }
        },
        
        logout: async () => {
          await api.auth.logout();
          set({
            user: null,
            currentProject: null,
            processing: {
              currentJob: null,
              history: []
            },
            videos: []
          });
        },
        
        checkAuth: async () => {
          const result = await api.auth.getCurrentUser();
          if (result.success && result.data) {
            set({ user: result.data as User });
          }
        },
        
        // 用戶相關操作
        setUser: (user) => set({ user }),
        
        updateUserProfile: async (updates) => {
          const result = await api.auth.updateProfile(updates);
          if (result.success && result.data) {
            set((state) => ({
              user: state.user ? { ...state.user, ...updates } : null
            }));
            get().addNotification({
              type: 'success',
              title: '更新成功',
              message: '個人資料已更新'
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '更新失敗',
              message: result.error || '更新個人資料時發生錯誤'
            });
            return false;
          }
        },

        // 項目相關操作
        createProject: async (name, description) => {
          const result = await api.project.create(name, description);
          if (result.success) {
            get().addNotification({
              type: 'success',
              title: '項目創建成功',
              message: `項目 "${name}" 已創建`
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '創建失敗',
              message: result.error || '創建項目時發生錯誤'
            });
            return false;
          }
        },
        
        loadUserProjects: async () => {
          const { user } = get();
          if (!user) return;
          
          const result = await api.project.getList(user.id);
          if (result.success && result.data) {
            // 可以在這裡處理項目列表，例如存儲到狀態中
          }
        },
        
        setPhotos: (photos) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            photos,
            prompt: state.currentProject?.prompt || '',
            subtitles: state.currentProject?.subtitles || initialSubtitleConfig,
            settings: state.currentProject?.settings || initialVideoSettings
          }
        })),
        
        // 照片相關操作
        uploadPhotos: async (files) => {
          const result = await api.photo.upload(files, (progress) => {
            // 可以在這裡更新上傳進度
          });
          
          if (result.success && result.data) {
            set((state) => ({
              currentProject: {
                ...state.currentProject,
                photos: [...(state.currentProject?.photos || []), ...result.data],
                prompt: state.currentProject?.prompt || '',
                subtitles: state.currentProject?.subtitles || initialSubtitleConfig,
                settings: state.currentProject?.settings || initialVideoSettings
              }
            }));
            get().addNotification({
              type: 'success',
              title: '上傳成功',
              message: `成功上傳 ${result.data.length} 張照片`
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '上傳失敗',
              message: result.error || '照片上傳時發生錯誤'
            });
            return false;
          }
        },

        addPhoto: (photo) => set((state) => {
          const currentPhotos = state.currentProject?.photos || [];
          return {
            currentProject: {
              ...state.currentProject,
              photos: [...currentPhotos, photo],
              prompt: state.currentProject?.prompt || '',
              subtitles: state.currentProject?.subtitles || initialSubtitleConfig,
              settings: state.currentProject?.settings || initialVideoSettings
            }
          };
        }),

        removePhoto: (photoId) => set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              photos: state.currentProject.photos.filter(p => p.id !== photoId)
            }
          };
        }),

        setPrompt: (prompt) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            photos: state.currentProject?.photos || [],
            prompt,
            subtitles: state.currentProject?.subtitles || initialSubtitleConfig,
            settings: state.currentProject?.settings || initialVideoSettings
          }
        })),

        setSubtitles: (subtitles) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            photos: state.currentProject?.photos || [],
            prompt: state.currentProject?.prompt || '',
            subtitles,
            settings: state.currentProject?.settings || initialVideoSettings
          }
        })),

        setVideoSettings: (settings) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            photos: state.currentProject?.photos || [],
            prompt: state.currentProject?.prompt || '',
            subtitles: state.currentProject?.subtitles || initialSubtitleConfig,
            settings
          }
        })),

        updateProject: (updates) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            photos: state.currentProject?.photos || [],
            prompt: updates.prompt ?? state.currentProject?.prompt ?? '',
            subtitles: updates.subtitles ?? state.currentProject?.subtitles ?? initialSubtitleConfig,
            settings: updates.settings ?? state.currentProject?.settings ?? initialVideoSettings
          }
        })),

        clearCurrentProject: () => set({ currentProject: null }),

        // 處理進度相關操作
        startVideoGeneration: async () => {
          const { currentProject, user } = get();
          if (!currentProject || !user) {
            get().addNotification({
              type: 'error',
              title: '生成失敗',
              message: '請先完成項目設置'
            });
            return false;
          }
          
          const request: VideoGenerationRequest = {
            id: Date.now().toString(),
            userId: user.id,
            photos: currentProject.photos,
            prompt: currentProject.prompt,
            subtitles: currentProject.subtitles,
            settings: currentProject.settings,
            createdAt: new Date()
          };
          
          const result = await api.video.generate(request);
          if (result.success && result.data) {
            get().setCurrentJob(result.data);
            get().subscribeToJobUpdates(result.data.id);
            get().addNotification({
              type: 'success',
              title: '開始生成影片',
              message: '影片生成任務已開始，請稍候'
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '生成失敗',
              message: typeof result.error === 'string' ? result.error : (result.error?.message || '啟動影片生成時發生錯誤')
            });
            return false;
          }
        },

        subscribeToJobUpdates: (jobId) => {
          const subscription = realtime.subscribeToJobUpdates(jobId, (payload) => {
            if (payload.new) {
              get().updateJobStatus(jobId, payload.new.status);
              get().updateJobProgress(jobId, payload.new.progress);
              
              // 如果任務完成，添加通知
              if (payload.new.status === 'completed') {
                get().addNotification({
                  type: 'success',
                  title: '影片生成完成',
                  message: '您的影片已成功生成，可以預覽和下載了'
                });
              } else if (payload.new.status === 'failed') {
                get().addNotification({
                  type: 'error',
                  title: '影片生成失敗',
                  message: payload.new.error || '生成過程中發生錯誤'
                });
              }
            }
          });
          
          // 可以將訂閱存儲起來以便後續取消
          return subscription;
        },

        setCurrentJob: (currentJob) => set((state) => ({
          processing: {
            ...state.processing,
            currentJob
          }
        })),

        updateJobProgress: (jobId, progress) => set((state) => {
          if (state.processing.currentJob?.id === jobId) {
            return {
              processing: {
                ...state.processing,
                currentJob: {
                  ...state.processing.currentJob,
                  progress
                }
              }
            };
          }
          return state;
        }),

        updateJobStatus: (jobId, status) => set((state) => {
          if (state.processing.currentJob?.id === jobId) {
            return {
              processing: {
                ...state.processing,
                currentJob: {
                  ...state.processing.currentJob,
                  status
                }
              }
            };
          }
          return state;
        }),

        addJobToHistory: (job) => set((state) => ({
          processing: {
            ...state.processing,
            history: [job, ...state.processing.history]
          }
        })),

        // 影片相關操作
        loadUserVideos: async () => {
          const { user } = get();
          if (!user) return;
          
          const result = await api.video.getList(user.id);
          if (result.success && result.data) {
            set({ videos: result.data.items });
          }
        },

        downloadVideo: async (videoId, quality) => {
          const result = await api.video.download(videoId, quality);
          if (result.success && result.data) {
            // 觸發下載
            const link = document.createElement('a');
            link.href = result.data.downloadUrl;
            link.download = `video-${videoId}-${quality}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            get().addNotification({
              type: 'success',
              title: '下載開始',
              message: '影片下載已開始'
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '下載失敗',
              message: typeof result.error === 'string' ? result.error : (result.error?.message || '下載影片時發生錯誤')
            });
            return false;
          }
        },

        addVideo: (video) => set((state) => ({
          videos: [video, ...state.videos]
        })),

        removeVideo: (videoId) => set((state) => ({
          videos: state.videos.filter(v => v.id !== videoId)
        })),

        setVideos: (videos) => set({ videos }),

        // UI狀態操作
        setLoading: (loading) => set((state) => ({
          ui: {
            ...state.ui,
            loading
          }
        })),

        setError: (error) => set((state) => ({
          ui: {
            ...state.ui,
            error
          }
        })),

        addNotification: (notification) => set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            createdAt: new Date()
          };
          return {
            ui: {
              ...state.ui,
              notifications: [...state.ui.notifications, newNotification]
            }
          };
        }),

        removeNotification: (notificationId) => set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== notificationId)
          }
        })),

        clearNotifications: () => set((state) => ({
          ui: {
            ...state.ui,
            notifications: []
          }
        })),

        // 字幕相關操作
        addSubtitle: (subtitle) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            subtitles: {
              ...state.currentProject?.subtitles,
              items: [...(state.currentProject?.subtitles?.items || []), subtitle]
            }
          }
        })),
        
        updateSubtitle: (id, updates) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            subtitles: {
              ...state.currentProject?.subtitles,
              items: (state.currentProject?.subtitles?.items || []).map(s => 
                s.id === id ? { ...s, ...updates } : s
              )
            }
          }
        })),
        
        removeSubtitle: (id) => set((state) => ({
          currentProject: {
            ...state.currentProject,
            subtitles: {
              ...state.currentProject?.subtitles,
              items: (state.currentProject?.subtitles?.items || []).filter(s => s.id !== id)
            }
          }
        })),
        
        generateSubtitles: async (videoId) => {
          const result = await api.subtitle.generate(videoId);
          if (result.success && result.data) {
            // result.data 是 SubtitleConfig[]，取第一個配置的 items
            const subtitleConfig = result.data[0];
            
            set((state) => ({
              currentProject: {
                ...state.currentProject,
                subtitles: {
                  ...state.currentProject?.subtitles,
                  items: subtitleConfig?.items || [],
                  enabled: subtitleConfig?.enabled ?? true
                }
              }
            }));
            get().addNotification({
              type: 'success',
              title: '字幕生成成功',
              message: '已自動生成字幕，您可以進行編輯'
            });
            return true;
          } else {
            get().addNotification({
              type: 'error',
              title: '字幕生成失敗',
              message: typeof result.error === 'string' ? result.error : (result.error?.message || '生成字幕時發生錯誤')
            });
            return false;
          }
        },

        // 初始化相關操作
        initialize: async () => {
          // 檢查用戶認證狀態
          await get().checkAuth();
          
          // 監聽認證狀態變化
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const user: User = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email,
                avatar: session.user.user_metadata?.avatar_url,
                createdAt: new Date(session.user.created_at),
                updatedAt: new Date(session.user.updated_at || session.user.created_at)
              };
              set({ user });
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                currentProject: null,
                processing: {
                  currentJob: null,
                  history: []
                },
                videos: []
              });
            }
          });
          
          // 如果用戶已登入，載入相關數據
          const { user } = get();
          if (user) {
            await Promise.all([
              get().loadUserProjects(),
              get().loadUserVideos()
            ]);
          }
        }
    }),
    {
      name: 'photo-to-video-store',
      // 只持久化部分狀態
      partialize: (state) => ({
        user: state.user,
        currentProject: state.currentProject,
        videos: state.videos
      })
    }
  ),
  {
    name: 'photo-to-video-store'
  }
));

// 選擇器函數，用於獲取特定狀態
export const useUser = () => useAppStore((state) => state.user);
export const useCurrentProject = () => useAppStore((state) => state.currentProject);
export const usePhotos = () => useAppStore((state) => state.currentProject?.photos || []);
export const usePrompt = () => useAppStore((state) => state.currentProject?.prompt || '');
export const useSubtitles = () => useAppStore((state) => state.currentProject?.subtitles || initialSubtitleConfig);
export const useVideoSettings = () => useAppStore((state) => state.currentProject?.settings || initialVideoSettings);
export const useProcessing = () => useAppStore((state) => state.processing);
export const useVideos = () => useAppStore((state) => state.videos);
export const useUI = () => useAppStore((state) => state.ui);
export const useNotifications = () => useAppStore((state) => state.ui.notifications);