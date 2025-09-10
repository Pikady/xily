import React from 'react';

export function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600">测试页面</h1>
      <p className="mt-4 text-gray-600">如果你能看到这个页面，说明应用正在正常工作！</p>
      <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700">✅ React 组件渲染正常</p>
        <p className="text-green-700">✅ Tailwind CSS 样式正常</p>
        <p className="text-green-700">✅ 路由系统正常</p>
      </div>
    </div>
  );
}