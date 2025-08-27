import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Download, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProcessingJob } from '../types';

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  estimatedTime?: number;
}

export default function Processing() {
  const navigate = useNavigate();
  const {
    currentProject,
    processing,
    startVideoGeneration,
    subscribeToJobUpdates,
    addNotification,
    ui
  } = useAppStore();
  
  const currentJob = processing.currentJob;
  const isLoading = ui.loading;

  const [localJob, setLocalJob] = useState<ProcessingJob | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      name: '上傳照片',
      description: '正在上傳您的照片到雲端...',
      status: 'completed',
      progress: 100
    },
    {
      id: 'analysis',
      name: '分析內容',
      description: '使用AI分析照片內容和構圖...',
      status: 'processing',
      progress: 0,
      estimatedTime: 30
    },
    {
      id: 'generation',
      name: '生成影片',
      description: '根據提示詞生成影片內容...',
      status: 'pending',
      progress: 0,
      estimatedTime: 120
    },
    {
      id: 'subtitle',
      name: '添加字幕',
      description: '將字幕嵌入到影片中...',
      status: 'pending',
      progress: 0,
      estimatedTime: 15
    },
    {
      id: 'finalize',
      name: '最終處理',
      description: '優化影片品質並準備下載...',
      status: 'pending',
      progress: 0,
      estimatedTime: 20
    }
  ]);

  const [elapsedTime, setElapsedTime] = useState(0);

  // 初始化處理作業
  useEffect(() => {
    if (!currentProject) {
      addNotification({
        type: 'error',
        title: '錯誤',
        message: '未找到項目信息'
      });
      navigate('/upload');
      return;
    }

    // 如果沒有當前作業，啟動影片生成
    if (!currentJob) {
      const startGeneration = async () => {
        try {
          await startVideoGeneration();

        } catch (error) {
          console.error('Failed to start video generation:', error);
          addNotification({
            type: 'error',
            title: '生成失敗',
            message: '啟動影片生成失敗'
          });
        }
      };
      startGeneration();
    }
  }, [currentProject, currentJob, startVideoGeneration, addNotification, navigate]);

  // 訂閱作業更新
  useEffect(() => {
    if (currentJob) {
      setLocalJob(currentJob);
      const unsubscribe = subscribeToJobUpdates(currentJob.id);
      return unsubscribe;
    }
  }, [currentJob, subscribeToJobUpdates]);

  // 模擬處理進度更新（當沒有真實作業時）
  useEffect(() => {
    if (localJob) return; // 如果有真實作業，不使用模擬

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      setSteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        let currentStepIndex = updatedSteps.findIndex(step => step.status === 'processing');
        
        if (currentStepIndex === -1) {
          currentStepIndex = updatedSteps.findIndex(step => step.status === 'pending');
          if (currentStepIndex !== -1) {
            updatedSteps[currentStepIndex].status = 'processing';
          }
        }

        if (currentStepIndex !== -1) {
          const currentStep = updatedSteps[currentStepIndex];
          const increment = Math.random() * 10 + 5;
          currentStep.progress = Math.min(100, currentStep.progress + increment);

          if (currentStep.progress >= 100) {
            currentStep.status = 'completed';
            currentStep.progress = 100;
          }
        }

        return updatedSteps;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localJob]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 從作業更新步驟狀態
  const updateStepsFromJob = (job: ProcessingJob) => {
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      // 根據作業進度更新步驟狀態
      const progressPerStep = 100 / updatedSteps.length;
      const completedSteps = Math.floor(job.progress / progressPerStep);
      
      updatedSteps.forEach((step, index) => {
        if (index < completedSteps) {
          step.status = 'completed';
          step.progress = 100;
        } else if (index === completedSteps) {
          step.status = 'processing';
          step.progress = (job.progress % progressPerStep) * (100 / progressPerStep);
        } else {
          step.status = 'pending';
          step.progress = 0;
        }
      });
      
      return updatedSteps;
    });
  };

  const getEstimatedRemainingTime = () => {
    const remainingSteps = steps.filter(step => step.status === 'pending' || step.status === 'processing');
    const currentStep = steps.find(step => step.status === 'processing');
    
    let totalEstimatedTime = 0;
    
    if (currentStep && currentStep.estimatedTime) {
      const remainingProgress = (100 - currentStep.progress) / 100;
      totalEstimatedTime += currentStep.estimatedTime * remainingProgress;
    }
    
    remainingSteps
      .filter(step => step.status === 'pending')
      .forEach(step => {
        if (step.estimatedTime) {
          totalEstimatedTime += step.estimatedTime;
        }
      });
    
    return Math.ceil(totalEstimatedTime);
  };

  // 計算總體進度
  const totalProgress = () => {
    if (localJob) return localJob.progress;
    return Math.round(steps.reduce((sum, step) => sum + step.progress, 0) / steps.length);
  };

  // 檢查是否完成
  const isCompleted = () => {
    if (localJob) return localJob.status === 'completed';
    return steps.every(step => step.status === 'completed');
  };

  // 檢查是否失敗
  const isFailed = () => {
    if (localJob) return localJob.status === 'failed';
    return steps.some(step => step.status === 'error');
  };

  // 導航處理
  const handleBack = () => {
    navigate('/subtitles');
  };

  const handleViewResult = () => {
    if (isCompleted()) {
      navigate('/preview');
    }
  };

  const handleRetry = () => {
    // 重置步驟狀態
    setSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        status: step.id === 'upload' ? 'completed' : 'pending',
        progress: step.id === 'upload' ? 100 : 0
      }))
    );
    
    // 重新啟動處理
    if (currentProject) {
      startVideoGeneration();
    }
  };

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 項目信息 */}
        {currentProject && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">我的項目</h2>
                <p className="text-sm text-gray-600">
                  {currentProject.photos.length} 張照片
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 font-medium">處理中</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">影片生成中</h1>
          <p className="text-gray-600">
            我們正在為您生成精美的影片，請稍候...
          </p>
        </div>

        {/* 總體進度 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">總體進度</h2>
            <span className="text-sm text-gray-600">
              {totalProgress()}% 完成
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalProgress()}%` }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">已用時間:</span>
              <span className="font-medium">{formatTime(elapsedTime)}</span>
            </div>
            
            {!isCompleted() && !isFailed() && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">預估剩餘:</span>
                <span className="font-medium text-blue-600">
                  {formatTime(getEstimatedRemainingTime())}
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                !isCompleted() && !isFailed() ? 'bg-blue-500 animate-pulse' :
                isCompleted() ? 'bg-green-500' :
                isFailed() ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span className="text-gray-600">狀態:</span>
              <span className={`font-medium ${
                !isCompleted() && !isFailed() ? 'text-blue-600' :
                isCompleted() ? 'text-green-600' :
                isFailed() ? 'text-red-600' : 'text-gray-600'
              }`}>
                {!isCompleted() && !isFailed() ? '處理中' :
                 isCompleted() ? '已完成' :
                 isFailed() ? '處理失敗' : '等待中'}
              </span>
            </div>
          </div>
        </div>

        {/* 詳細步驟 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">處理步驟</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* 連接線 */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  getStatusColor(step.status)
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {step.name}
                      </h3>
                      {step.status === 'processing' && step.estimatedTime && (
                        <span className="text-xs text-gray-500">
                          預估 {formatTime(step.estimatedTime)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {step.description}
                    </p>
                    
                    {(step.status === 'processing' || step.status === 'completed') && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {step.status === 'processing' && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Math.round(step.progress)}% 完成
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 完成後的操作 */}
        {isCompleted() && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-medium text-green-900">
                影片生成完成！
              </h3>
            </div>
            <p className="text-green-700 mb-4">
              您的影片已成功生成，現在可以預覽和下載了。
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={handleViewResult}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                預覽影片
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                下載影片
              </button>
            </div>
          </div>
        )}

        {/* 錯誤處理 */}
        {isFailed() && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-red-900">
                處理失敗
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              {localJob?.error || '影片生成過程中發生錯誤，請重試或聯繫客服。'}
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={handleRetry}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                重新處理
              </button>
              <button 
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回編輯
              </button>
            </div>
          </div>
        )}

        {/* 導航按鈕 */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回字幕設定
          </button>

          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">步驟 4/4</span>
          </div>

          <button
            onClick={handleViewResult}
            disabled={!isCompleted()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            查看結果
          </button>
        </div>
      </div>
    </div>
  );
}