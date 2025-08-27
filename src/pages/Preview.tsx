import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Share2, Edit, RotateCcw, Settings } from 'lucide-react';

interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
  fileSize: string;
}

interface GeneratedVideo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  qualities: VideoQuality[];
  createdAt: Date;
}

export default function Preview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [showSettings, setShowSettings] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const video: GeneratedVideo = {
    id: 'video_001',
    title: '我的照片影片',
    duration: 30,
    thumbnail: '/api/placeholder/800/450',
    createdAt: new Date(),
    qualities: [
      {
        label: '4K Ultra HD',
        value: '2160p',
        resolution: '3840×2160',
        fileSize: '125 MB'
      },
      {
        label: 'Full HD',
        value: '1080p',
        resolution: '1920×1080',
        fileSize: '45 MB'
      },
      {
        label: 'HD',
        value: '720p',
        resolution: '1280×720',
        fileSize: '25 MB'
      },
      {
        label: 'Standard',
        value: '480p',
        resolution: '854×480',
        fileSize: '15 MB'
      }
    ]
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * video.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (quality: VideoQuality) => {
    setDownloadProgress(0);
    
    // 模擬下載進度
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 1000);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: '查看我用AI生成的影片！',
          url: window.location.href
        });
      } catch (err) {
        console.log('分享取消或失敗');
      }
    } else {
      // 複製連結到剪貼板
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼板！');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">影片預覽</h1>
          <p className="text-gray-600">您的影片已生成完成，可以預覽和下載</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 影片播放器 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 影片區域 */}
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  poster={video.thumbnail}
                >
                  <source src="/api/placeholder/video.mp4" type="video/mp4" />
                  您的瀏覽器不支援影片播放。
                </video>
                
                {/* 播放按鈕覆蓋層 */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                      <Play className="h-8 w-8 text-gray-800 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* 控制欄 */}
              <div className="p-4 bg-gray-900 text-white">
                <div className="flex items-center space-x-4">
                  {/* 播放/暫停 */}
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>

                  {/* 音量控制 */}
                  <button
                    onClick={toggleMute}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>

                  {/* 時間顯示 */}
                  <span className="text-sm text-gray-300">
                    {formatTime(currentTime)} / {formatTime(video.duration)}
                  </span>

                  {/* 進度條 */}
                  <div className="flex-1">
                    <div 
                      className="h-2 bg-gray-600 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(currentTime / video.duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 設定按鈕 */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 影片資訊 */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {video.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>時長: {formatTime(video.duration)}</span>
                    <span>•</span>
                    <span>生成時間: {video.createdAt.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>品質: {selectedQuality}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit className="h-4 w-4" />
                    <span>重新編輯</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 下載選項 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">下載選項</h3>
              
              <div className="space-y-3">
                {video.qualities.map((quality) => (
                  <div
                    key={quality.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuality === quality.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedQuality(quality.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {quality.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {quality.fileSize}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {quality.resolution}
                    </div>
                  </div>
                ))}
              </div>

              {/* 下載按鈕 */}
              <div className="mt-6">
                {downloadProgress !== null ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">下載中...</span>
                      <span className="text-blue-600">
                        {Math.round(downloadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const selectedQualityObj = video.qualities.find(q => q.value === selectedQuality);
                      if (selectedQualityObj) {
                        handleDownload(selectedQualityObj);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    <span>下載影片</span>
                  </button>
                )}
              </div>

              {/* 其他操作 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <RotateCcw className="h-4 w-4" />
                  <span>重新生成</span>
                </button>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">使用提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 建議選擇適合的品質進行下載</li>
                <li>• 可以分享連結給朋友觀看</li>
                <li>• 支援重新編輯和調整設定</li>
                <li>• 影片會保存30天供下載</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}