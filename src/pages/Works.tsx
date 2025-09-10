import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Clock, Target } from 'lucide-react';

export function Works() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">作品管理</h1>
          <p className="text-muted-foreground mt-1">
            管理你的创作项目和学习目标
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新建作品
        </Button>
      </div>

      {/* 作品统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总作品数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2个进行中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总投入时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45h 30m</div>
            <p className="text-xs text-muted-foreground">
              本月统计
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成进度</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">
              平均完成率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 作品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <CardTitle className="text-lg">汐律前端开发</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              基于React和Tauri的桌面时间管理应用
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>完成进度</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>已投入: 30h</span>
                <span>目标: 40h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <CardTitle className="text-lg">产品设计文档</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              用户体验设计和产品需求文档编写
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>完成进度</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>已投入: 15h</span>
                <span>目标: 15h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <CardTitle className="text-lg">算法学习</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              系统学习数据结构与算法
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>完成进度</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>已投入: 18h</span>
                <span>目标: 40h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}