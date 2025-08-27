import { Link } from 'react-router-dom';
import { Camera, Sparkles, Video, ArrowRight, Upload, Edit, Download } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: '上傳照片',
      description: '支援批量上傳多張照片，自動優化處理'
    },
    {
      icon: <Edit className="h-8 w-8" />,
      title: 'AI 提示詞',
      description: '智能生成或自定義提示詞，創造獨特風格'
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: '字幕設定',
      description: '添加個性化字幕，豐富影片內容表達'
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: '影片生成',
      description: '一鍵生成高品質影片，支援多種格式下載'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* 英雄區域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-20 animate-pulse-slow"></div>
                <div className="relative bg-white p-4 rounded-full shadow-glow">
                  <Camera className="h-12 w-12 text-primary-600" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">照片轉影片</span>
              <br />
              <span className="text-secondary-900">AI 創作平台</span>
            </h1>
            
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              運用先進的 AI 技術，將您的照片轉換為精美的影片作品。
              <br className="hidden sm:block" />
              簡單幾步，創造專業級的視覺內容。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/upload" 
                className="btn-primary group inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>開始創作</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-secondary text-lg px-8 py-4">
                觀看示例
              </button>
            </div>
          </div>
        </div>
        
        {/* 裝飾性元素 */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-primary-300 rounded-full opacity-10 animate-ping"></div>
      </section>

      {/* 功能特色 */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              四步完成創作
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              簡化的創作流程，讓每個人都能輕鬆製作專業影片
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="card text-center hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-100 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* 步驟編號 */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 優勢展示 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
                為什麼選擇我們？
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      AI 智能處理
                    </h3>
                    <p className="text-secondary-600">
                      採用最新的人工智能技術，自動分析照片內容，生成最適合的影片效果
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      高品質輸出
                    </h3>
                    <p className="text-secondary-600">
                      支援 4K 高清輸出，多種格式選擇，滿足不同平台的需求
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      快速便捷
                    </h3>
                    <p className="text-secondary-600">
                      簡化的操作流程，幾分鐘內即可完成影片創作，節省您的寶貴時間
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8 shadow-strong">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-soft">
                    <div className="w-full h-20 bg-gradient-to-r from-primary-200 to-primary-300 rounded mb-3"></div>
                    <div className="h-2 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-2 bg-secondary-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft">
                    <div className="w-full h-20 bg-gradient-to-r from-accent-200 to-accent-300 rounded mb-3"></div>
                    <div className="h-2 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-2 bg-secondary-200 rounded w-2/3"></div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft">
                    <div className="w-full h-20 bg-gradient-to-r from-primary-300 to-accent-200 rounded mb-3"></div>
                    <div className="h-2 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-2 bg-secondary-200 rounded w-4/5"></div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft">
                    <div className="w-full h-20 bg-gradient-to-r from-accent-300 to-primary-200 rounded mb-3"></div>
                    <div className="h-2 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-2 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                {/* 播放按鈕 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Video className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 區域 */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            準備開始您的創作之旅？
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            立即上傳您的照片，體驗 AI 影片創作的魅力
          </p>
          <Link 
            to="/upload" 
            className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl group"
          >
            <span>立即開始</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}