import React from 'react';

export function SimplePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">简单页面</h1>
      <div className="bg-white p-4 rounded shadow">
        <p>这是一个简单的页面，没有任何复杂的依赖。</p>
      </div>
    </div>
  );
}