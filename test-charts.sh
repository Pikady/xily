#!/bin/bash

# 图表功能测试脚本
echo "开始运行图表功能测试..."

# 检查依赖
echo "检查测试依赖..."
if ! npm list | grep -q "@testing-library/react"; then
    echo "安装测试依赖..."
    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
fi

# 运行单元测试
echo "运行单元测试..."
npm test -- --testPathPattern="src/components/charts/__tests__/ChartComponents.test.tsx"

# 运行集成测试
echo "运行集成测试..."
npm test -- --testPathPattern="src/components/charts/__tests__/AnalyticsComponents.test.tsx"

# 运行Hook测试
echo "运行Hook测试..."
npm test -- --testPathPattern="src/hooks/__tests__/useDataSync.test.ts"

# 运行所有相关测试
echo "运行所有图表相关测试..."
npm test -- --testPathPattern="src/components/charts|src/hooks"

# 检查测试覆盖率
echo "检查测试覆盖率..."
npm test -- --coverage --testPathPattern="src/components/charts|src/hooks"

echo "图表功能测试完成！"

# 生成测试报告
echo "生成测试报告..."
npm run test:report 2>/dev/null || echo "测试报告生成工具未配置"

echo "所有测试执行完毕！"