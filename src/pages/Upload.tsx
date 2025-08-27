import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Image, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';

export default function Upload() {
  const navigate = useNavigate();
  const { 
    currentProject, 
    uploadPhotos, 
    removePhoto, 
    addNotification 
  } = useAppStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const photos = currentProject?.photos || [];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        addNotification({
          type: 'error',
          title: '檔案格式錯誤',
          message: `${file.name} 不是有效的圖片格式`
        });
        return false;
      }
      
      if (!isValidSize) {
        addNotification({
          type: 'error',
          title: '檔案過大',
          message: `${file.name} 檔案大小超過 10MB 限制`
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;
    
    setIsUploading(true);
    const success = await uploadPhotos(validFiles);
    setIsUploading(false);
    
    if (!success) {
      // 錯誤處理已在store中完成
      return;
    }
  };

  const handleRemovePhoto = useCallback((photoId: string) => {
    removePhoto(photoId);
  }, [removePhoto]);
  
  const handleNext = () => {
    if (photos.length === 0) {
      addNotification({
        type: 'warning',
        title: '請上傳照片',
        message: '請至少上傳一張照片才能繼續'
      });
      return;
    }
    navigate('/prompt');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">上傳照片</h1>
          <p className="text-gray-600">選擇或拖放您想要轉換為影片的照片</p>
        </div>

        {/* 拖放上傳區域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            拖放照片到此處，或點擊選擇文件
          </h3>
          <p className="text-gray-500 mb-4">
            支援 JPG、PNG、GIF 格式，單個文件最大 10MB
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
          >
            選擇文件
          </label>
        </div>

        {/* 已上傳文件預覽 */}
        {(photos.length > 0 || isUploading) && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              已上傳的照片 ({photos.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 truncate" title={photo.name}>
                      {photo.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(photo.size)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* 上傳中的佔位符 */}
              {isUploading && (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">上傳中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 下一步按鈕 */}
        {photos.length > 0 && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleNext}
              disabled={photos.length === 0 || isUploading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  上傳中...
                </>
              ) : (
                '下一步：輸入提示詞'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}