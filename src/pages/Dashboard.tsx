import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus, BarChart3, Clock } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">仪表板</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来！今天是专注的一天
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建作品
          </Button>
          <Button variant="default" className="bg-explore hover:bg-explore/90">
            <Play className="w-4 h-4 mr-2" />
            开始专注
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日专注</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 30m</div>
            <p className="text-xs text-muted-foreground">
              +20% 相比昨天
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周专注</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18h 45m</div>
            <p className="text-xs text-muted-foreground">
              +12% 相比上周
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成项目</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              本月完成数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">专注效率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              计划完成率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-explore/10"
            >
              <div className="w-8 h-8 rounded-full bg-explore flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span>探索模式</span>
              <span className="text-xs text-muted-foreground">学习输入阶段</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-utilize/10"
            >
              <div className="w-8 h-8 rounded-full bg-utilize flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span>利用模式</span>
              <span className="text-xs text-muted-foreground">创作输出阶段</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-explore"></div>
                <div>
                  <p className="font-medium">前端开发文档</p>
                  <p className="text-sm text-muted-foreground">探索模式 · 25分钟</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">10分钟前</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-utilize"></div>
                <div>
                  <p className="font-medium">代码重构</p>
                  <p className="text-sm text-muted-foreground">利用模式 · 45分钟</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">1小时前</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}