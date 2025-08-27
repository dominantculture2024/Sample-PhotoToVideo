import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, Type, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentProject, useAppStore } from '../store';
import { SubtitleConfig } from '../types';

interface SubtitleItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface SubtitleStyle {
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

export default function Subtitle() {
  const navigate = useNavigate();
  const currentProject = useCurrentProject();
  const { updateProject, addNotification } = useAppStore();

  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([
    {
      id: '1',
      text: '歡迎來到我們的故事',
      startTime: 0,
      endTime: 3
    }
  ]);
  
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>('1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration] = useState(30); // 假設影片總長度30秒
  
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  });

  const [isSaving, setIsSaving] = useState(false);

  // 從當前項目加載字幕配置
  useEffect(() => {
    if (currentProject?.subtitles) {
      const config = currentProject.subtitles;
      if (config.items && config.items.length > 0) {
        setSubtitles(config.items.map(sub => ({
          id: sub.id || Date.now().toString(),
          text: sub.text,
          startTime: sub.startTime,
          endTime: sub.endTime
        })));
      }
      if (config.style) {
        setSubtitleStyle({
          fontSize: config.style.fontSize || 24,
          fontFamily: config.style.fontFamily || 'Arial',
          color: config.style.color || '#FFFFFF',
          backgroundColor: config.style.backgroundColor || 'rgba(0, 0, 0, 0.7)',
          backgroundOpacity: config.style.backgroundOpacity || 0.7,
          textAlign: config.style.textAlign || 'center',
          verticalAlign: config.style.verticalAlign || 'bottom',
          padding: config.style.padding || 8,
          borderRadius: config.style.borderRadius || 4,
          shadow: config.style.shadow || {
            enabled: true,
            color: '#000000',
            blur: 2,
            offsetX: 1,
            offsetY: 1
          }
        });
      }
    }
  }, [currentProject]);

  const fontFamilies = [
    'Arial', 'Microsoft YaHei', 'SimHei', 'Times New Roman', 'Georgia'
  ];

  // 保存字幕配置
  const saveSubtitleConfig = async () => {
    if (!currentProject) {
      addNotification({
        type: 'error',
        title: '錯誤',
        message: '請先選擇一個項目'
      });
      return;
    }

    setIsSaving(true);
    try {
      const subtitleConfig: SubtitleConfig = {
        items: subtitles.map(sub => ({
          id: sub.id,
          text: sub.text,
          startTime: sub.startTime,
          endTime: sub.endTime,
          position: {
            x: 50, // 默認居中
            y: subtitleStyle.verticalAlign === 'bottom' ? 90 : 
               subtitleStyle.verticalAlign === 'top' ? 10 : 50
          }
        })),
        style: {
          ...subtitleStyle,
          backgroundOpacity: 0.8,
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

      // 直接更新當前項目的字幕配置
      updateProject({ subtitles: subtitleConfig });
      addNotification({
        type: 'success',
        title: '保存成功',
        message: '字幕配置已保存'
      });
    } catch (error) {
      console.error('保存字幕配置失敗:', error);
      addNotification({
        type: 'error',
        title: '保存失敗',
        message: '保存失敗，請重試'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 導航處理
  const handleBack = () => {
    navigate('/prompt');
  };

  const handleNext = async () => {
    await saveSubtitleConfig();
    navigate('/processing');
  };

  const addSubtitle = () => {
    const newId = Date.now().toString();
    const newSubtitle: SubtitleItem = {
      id: newId,
      text: '新字幕',
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, totalDuration)
    };
    setSubtitles([...subtitles, newSubtitle]);
    setSelectedSubtitle(newId);
  };

  const deleteSubtitle = (id: string) => {
    setSubtitles(subtitles.filter(sub => sub.id !== id));
    if (selectedSubtitle === id) {
      setSelectedSubtitle(null);
    }
  };

  const updateSubtitle = (id: string, updates: Partial<SubtitleItem>) => {
    setSubtitles(subtitles.map(sub => 
      sub.id === id ? { ...sub, ...updates } : sub
    ));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * totalDuration;
    setCurrentTime(Math.max(0, Math.min(newTime, totalDuration)));
  };

  const selectedSub = subtitles.find(sub => sub.id === selectedSubtitle);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">設定字幕</h1>
              <p className="text-gray-600">為您的影片添加字幕並自定義樣式</p>
              {currentProject && (
                <p className="text-sm text-blue-600 mt-1">
                  當前項目 ({currentProject.photos?.length || 0} 張照片)
                </p>
              )}
            </div>
            
            <button
              onClick={saveSubtitleConfig}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 字幕預覽區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">預覽</h2>
              
              {/* 模擬影片預覽區域 */}
              <div className="relative bg-black rounded-lg aspect-video mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-full flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8" />
                      )}
                    </div>
                    <p>影片預覽</p>
                  </div>
                </div>
                
                {/* 字幕預覽 */}
                {subtitles
                  .filter(sub => currentTime >= sub.startTime && currentTime <= sub.endTime)
                  .map(sub => (
                    <div
                      key={sub.id}
                      className={`absolute px-4 py-2 rounded ${
                        subtitleStyle.verticalAlign === 'bottom' ? 'bottom-4' :
                        subtitleStyle.verticalAlign === 'top' ? 'top-4' : 'top-1/2 -translate-y-1/2'
                      } ${
                        subtitleStyle.textAlign === 'center' ? 'left-1/2 -translate-x-1/2' :
                        subtitleStyle.textAlign === 'left' ? 'left-4' : 'right-4'
                      }`}
                      style={{
                        fontSize: `${subtitleStyle.fontSize}px`,
                        fontFamily: subtitleStyle.fontFamily,
                        color: subtitleStyle.color,
                        backgroundColor: subtitleStyle.backgroundColor
                      }}
                    >
                      {sub.text}
                    </div>
                  ))
                }
              </div>

              {/* 播放控制 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>

                {/* 時間軸 */}
                <div 
                  className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                  onClick={handleTimelineClick}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                  
                  {/* 字幕時間段標記 */}
                  {subtitles.map(sub => (
                    <div
                      key={sub.id}
                      className="absolute top-0 h-full bg-green-400 opacity-60"
                      style={{
                        left: `${(sub.startTime / totalDuration) * 100}%`,
                        width: `${((sub.endTime - sub.startTime) / totalDuration) * 100}%`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 字幕編輯器 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">字幕列表</h2>
                <button
                  onClick={addSubtitle}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>添加</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subtitles.map((subtitle) => (
                  <div
                    key={subtitle.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubtitle === subtitle.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubtitle(subtitle.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubtitle(subtitle.id);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{subtitle.text}</p>
                  </div>
                ))}
              </div>

              {/* 字幕編輯表單 */}
              {selectedSub && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">編輯字幕</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">文字內容</label>
                      <textarea
                        value={selectedSub.text}
                        onChange={(e) => updateSubtitle(selectedSub.id, { text: e.target.value })}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">開始時間</label>
                        <input
                          type="number"
                          value={selectedSub.startTime}
                          onChange={(e) => updateSubtitle(selectedSub.id, { startTime: Number(e.target.value) })}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={0}
                          max={totalDuration}
                          step={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">結束時間</label>
                        <input
                          type="number"
                          value={selectedSub.endTime}
                          onChange={(e) => updateSubtitle(selectedSub.id, { endTime: Number(e.target.value) })}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={0}
                          max={totalDuration}
                          step={0.1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 樣式設定 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2" />
                字幕樣式
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">字體大小</label>
                  <input
                    type="range"
                    min={12}
                    max={48}
                    value={subtitleStyle.fontSize}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{subtitleStyle.fontSize}px</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">字體</label>
                  <select
                    value={subtitleStyle.fontFamily}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">文字顏色</label>
                  <input
                    type="color"
                    value={subtitleStyle.color}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">背景顏色</label>
                  <input
                    type="color"
                    value={subtitleStyle.backgroundColor.replace('rgba(0, 0, 0, 0.7)', '#000000')}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">位置</label>
                  <select
                    value={subtitleStyle.verticalAlign}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, verticalAlign: e.target.value as any }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bottom">底部</option>
                    <option value="center">中央</option>
                    <option value="top">頂部</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">對齊方式</label>
                  <select
                    value={subtitleStyle.textAlign}
                    onChange={(e) => setSubtitleStyle(prev => ({ ...prev, textAlign: e.target.value as any }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="left">靠左</option>
                    <option value="center">置中</option>
                    <option value="right">靠右</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 導航按鈕 */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>上一步</span>
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              步驟 3/4 - 字幕設定
            </p>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          
          <button
            onClick={handleNext}
            disabled={isSaving || subtitles.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{isSaving ? '保存中...' : '下一步：開始處理'}</span>
            {!isSaving && <ArrowLeft className="h-5 w-5 rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
}