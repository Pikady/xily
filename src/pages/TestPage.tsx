import React from 'react';

export function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#2563eb' }}>
          🎉 汐律测试页面
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              React 状态检查
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#3b82f6', 
                color: '#ffffff', 
                padding: '0.75rem', 
                borderRadius: '0.375rem' 
              }}>
                ✅ React 组件正常渲染
              </div>
              <div style={{ 
                backgroundColor: '#10b981', 
                color: '#ffffff', 
                padding: '0.75rem', 
                borderRadius: '0.375rem' 
              }}>
                ✅ JSX 转换正常工作
              </div>
              <div style={{ 
                backgroundColor: '#f59e0b', 
                color: '#ffffff', 
                padding: '0.75rem', 
                borderRadius: '0.375rem' 
              }}>
                ✅ 样式内联正常
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              交互测试
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => alert('按钮点击正常！')}>
                点击测试
              </button>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db'
              }}>
                <input 
                  type="text" 
                  placeholder="输入测试..." 
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '2rem',
          backgroundColor: '#f0f9ff', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            🚀 项目状态
          </h2>
          <div style={{ color: '#374151' }}>
            <p>✅ React 18 + TypeScript 环境搭建完成</p>
            <p>✅ Vite 开发服务器正常运行</p>
            <p>✅ 基础项目结构创建完成</p>
            <p>✅ 路由系统配置完成</p>
            <p>🔄 Tailwind CSS 和 Shadcn UI 配置中</p>
            <p>⏳ 状态管理系统待配置</p>
          </div>
        </div>
      </div>
    </div>
  );
}