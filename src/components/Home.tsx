import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Wand2, Type, Play, Download, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: '照片上傳',
      description: '支援批量上傳，拖放操作，多種格式',
      path: '/upload'
    },
    {
      icon: Wand2,
      title: 'AI提示詞',
      description: '智能提示詞生成，豐富的範例庫',
      path: '/prompt'
    },
    {
      icon: Type,
      title: '字幕設定',
      description: '自定義字幕樣式，時間軸控制',
      path: '/subtitle'
    },
    {
      icon: Play,
      title: '處理進度',
      description: '實時進度追蹤，狀態提示',
      path: '/processing'
    },
    {
      icon: Download,
      title: '結果預覽',
      description: '多品質選擇，一鍵下載分享',
      path: '/preview'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PhotoToVideo</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                開始創作
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄區塊 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            將照片轉換為
            <span className="text-blue-600">精彩影片</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            使用AI技術，輕鬆將您的照片轉換為動態影片，添加字幕和特效，創造令人驚艷的視覺體驗
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即開始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors">
              觀看示範
              <Play className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">強大功能</h2>
            <p className="text-lg text-gray-600">簡單五步驟，創造專業級影片</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.path}
                  className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 使用流程 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">使用流程</h2>
            <p className="text-lg text-gray-600">簡單幾步，輕鬆完成</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: '1', title: '上傳照片', desc: '選擇您要轉換的照片' },
              { step: '2', title: '設定提示詞', desc: '描述想要的影片風格' },
              { step: '3', title: '添加字幕', desc: '自定義字幕內容和樣式' },
              { step: '4', title: '開始處理', desc: 'AI自動生成影片' },
              { step: '5', title: '下載分享', desc: '預覽並下載成品' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA區塊 */}
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">準備好開始了嗎？</h2>
          <p className="text-xl mb-8 opacity-90">
            立即體驗AI照片轉影片的神奇魅力
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            開始創作
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PhotoToVideo</span>
            </div>
            <p className="text-gray-400">
              © 2024 PhotoToVideo. 讓每張照片都有故事。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}