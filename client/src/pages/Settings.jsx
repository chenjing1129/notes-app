import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; // 假设导航栏组件路径

const Settings = () => {
  // 主题状态，默认为白天模式
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  // 字体大小状态，默认为 16px
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem('fontSize')) || 16,
  );

  // 保存主题到本地存储
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);

  // 保存字体大小到本地存储
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // 备份数据函数
  const handleBackup = () => {
    // 这里可以添加实际的备份逻辑，例如导出数据到文件
    console.log('数据备份成功');
  };

  // 恢复数据函数
  const handleRestore = () => {
    // 这里可以添加实际的恢复逻辑，例从文件导入数据
    console.log('数据恢复成功');
  };

  return (
    <>
      <Navbar /> {/* 引入导航栏组件 */}
      <div className="p-4">
        <h1>设置页面</h1>
        {/* 丰富设置页面的具体内容 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">个人信息设置</h2>
          <p className="mb-2">在这里可以修改您的个人信息。</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            修改个人信息
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">通知设置</h2>
          <p className="mb-2">管理您的通知偏好。</p>
          <div className="flex items-center mb-2">
            <input type="checkbox" className="mr-2" checked />
            <label>接收新笔记通知</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <label>接收系统消息通知</label>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">隐私设置</h2>
          <p className="mb-2">调整您的隐私选项。</p>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="public"
              name="privacy"
              value="public"
              className="mr-2"
            />
            <label htmlFor="public">公开所有笔记</label>
          </div>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="private"
              name="privacy"
              value="private"
              className="mr-2"
            />
            <label htmlFor="private">仅自己可见</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="custom"
              name="privacy"
              value="custom"
              className="mr-2"
            />
            <label htmlFor="custom">自定义隐私设置</label>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">主题设置</h2>
          <p className="mb-2">切换应用的主题。</p>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="light"
              name="theme"
              value="light"
              className="mr-2"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
            />
            <label htmlFor="light">白天模式</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="dark"
              name="theme"
              value="dark"
              className="mr-2"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
            />
            <label htmlFor="dark">夜间模式</label>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">字体大小设置</h2>
          <p className="mb-2">调整应用的字体大小。</p>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="mt-2">当前字体大小: {fontSize}px</p>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">备份与恢复</h2>
          <p className="mb-2">管理您的数据备份和恢复。</p>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleBackup}
          >
            备份数据
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleRestore}
          >
            恢复数据
          </button>
        </div>
      </div>
    </>
  );
};

export default Settings;
