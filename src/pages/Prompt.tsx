import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Copy, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useCurrentProject, useAppStore } from '../store';

interface PromptExample {
  id: string;
  title: string;
  content: string;
  category: string;
}

const promptExamples: PromptExample[] = [
  {
    id: '1',
    title: '風景攝影',
    content: '將這些美麗的風景照片轉換成一個令人驚嘆的延時攝影風格影片，展現自然的壯麗和寧靜',
    category: '風景'
  },
  {
    id: '2',
    title: '人物寫真',
    content: '創建一個溫馨的人物故事影片，突出情感表達和人物特色，配以柔和的過渡效果',
    category: '人物'
  },
  {
    id: '3',
    title: '產品展示',
    content: '製作專業的產品展示影片，強調產品細節和特色，使用現代簡約的視覺風格',
    category: '商業'
  },
  {
    id: '4',
    title: '旅行回憶',
    content: '將旅行照片編織成一個充滿冒險感的故事影片，展現旅程中的精彩瞬間和美好回憶',
    category: '旅行'
  }
];

export default function Prompt() {
  const navigate = useNavigate();
  const currentProject = useCurrentProject();
  const { updateProject, addNotification } = useAppStore();
  
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 從store中載入現有的提示詞
  useEffect(() => {
    if (currentProject?.prompt) {
      setPrompt(currentProject.prompt);
    }
  }, [currentProject?.prompt]);

  const categories = ['全部', '風景', '人物', '商業', '旅行'];
  
  const filteredExamples = selectedCategory === '全部' 
    ? promptExamples 
    : promptExamples.filter(example => example.category === selectedCategory);

  const handleCopyExample = async (example: PromptExample) => {
    try {
      await navigator.clipboard.writeText(example.content);
      setCopiedId(example.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  const handleUseExample = (content: string) => {
    setPrompt(content);
    addNotification({
      type: 'success',
      title: '範例已套用',
      message: '範例提示詞已填入編輯器'
    });
  };
  
  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    // 模擬AI生成提示詞的過程
    setTimeout(() => {
      const generatedPrompt = '根據您上傳的照片，建議創建一個充滿活力和創意的影片，使用動態的過渡效果和鮮明的色彩對比，營造現代感和專業感。';
      setPrompt(generatedPrompt);
      setIsGenerating(false);
      addNotification({
        type: 'success',
        title: 'AI提示詞已生成',
        message: '基於您的照片內容生成了個性化提示詞'
      });
    }, 2000);
  };
  
  const handleBack = () => {
    navigate('/upload');
  };
  
  const handleNext = () => {
    if (!prompt.trim()) {
      addNotification({
        type: 'warning',
        title: '請輸入提示詞',
        message: '請輸入提示詞描述您想要的影片風格'
      });
      return;
    }
    
    if (wordCount > maxWords) {
      addNotification({
        type: 'error',
        title: '提示詞過長',
        message: '請將提示詞縮短至500字以內'
      });
      return;
    }
    
    // 保存提示詞到store
    updateProject({ prompt: prompt.trim() });
    navigate('/subtitle');
  };

  const wordCount = prompt.length;
  const maxWords = 500;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 頁面標題和導航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回上傳</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">輸入提示詞</h1>
            <p className="text-gray-600">描述您希望生成的影片風格和內容</p>
          </div>
          <div className="w-20"></div> {/* 平衡佈局 */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 提示詞編輯器 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">AI 提示詞</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !currentProject?.photos?.length}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? '生成中...' : 'AI生成'}</span>
                  </button>
                  <span className={`text-sm ${
                    wordCount > maxWords ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {wordCount}/{maxWords}
                  </span>
                </div>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="請描述您希望生成的影片風格、主題、情感氛圍等。例如：將這些照片製作成一個溫馨的家庭回憶影片，使用柔和的過渡效果和溫暖的色調..."
                className={`w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  wordCount > maxWords ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isGenerating}
              />
              
              {wordCount > maxWords && (
                <p className="mt-2 text-sm text-red-500">
                  提示詞長度超出限制，請縮短內容
                </p>
              )}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 mb-1">提示詞建議</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 描述期望的影片風格（如：電影感、溫馨、專業等）</li>
                      <li>• 指定色調和氛圍（如：溫暖、冷色調、復古等）</li>
                      <li>• 說明過渡效果偏好（如：淡入淡出、滑動、縮放等）</li>
                      <li>• 提及目標受眾或用途（如：社交媒體、商業展示等）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 範例提示詞 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">範例提示詞</h2>
              
              {/* 分類篩選 */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* 範例列表 */}
              <div className="space-y-3">
                {filteredExamples.map((example) => (
                  <div key={example.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {example.title}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {example.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {example.content}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyExample(example)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedId === example.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === example.id ? '已複製' : '複製'}</span>
                      </button>
                      <button
                        onClick={() => handleUseExample(example.content)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        使用此範例
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            已上傳 {currentProject?.photos?.length || 0} 張照片
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
            <button 
              onClick={handleNext}
              disabled={!prompt.trim() || wordCount > maxWords || isGenerating}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              下一步：設定字幕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}