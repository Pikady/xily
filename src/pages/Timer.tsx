import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, RotateCcw, Clock } from 'lucide-react';

export function Timer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">计时器</h1>
          <p className="text-muted-foreground mt-1">
            专注时光，高效工作
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 计时器主体 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* 模式指示器 */}
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" className="bg-explore text-explore-foreground">
                    探索模式
                  </Button>
                  <Button variant="outline">
                    利用模式
                  </Button>
                </div>

                {/* 时间显示 */}
                <div className="relative">
                  <div className="w-64 h-64 mx-auto">
                    <Progress value={25} className="w-full h-full rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold">25:00</div>
                        <div className="text-sm text-muted-foreground mt-2">
                          汐律前端开发
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-center space-x-4">
                  <Button size="lg" className="bg-explore hover:bg-explore/90">
                    <Play className="w-5 h-5 mr-2" />
                    开始
                  </Button>
                  <Button size="lg" variant="outline">
                    <Square className="w-5 h-5 mr-2" />
                    停止
                  </Button>
                  <Button size="lg" variant="ghost">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快速设置 */}
          <Card>
            <CardHeader>
              <CardTitle>快速设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <label className="text-sm text-muted-foreground">专注时长</label>
                  <div className="text-lg font-semibold">25分钟</div>
                </div>
                <div className="text-center">
                  <label className="text-sm text-muted-foreground">短休息</label>
                  <div className="text-lg font-semibold">5分钟</div>
                </div>
                <div className="text-center">
                  <label className="text-sm text-muted-foreground">长休息</label>
                  <div className="text-lg font-semibold">15分钟</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边信息 */}
        <div className="space-y-6">
          {/* 今日统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                今日统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>完成番茄钟</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex justify-between">
                <span>专注时长</span>
                <span className="font-semibold">2h 30m</span>
              </div>
              <div className="flex justify-between">
                <span>探索模式</span>
                <span className="font-semibold text-explore">1h 45m</span>
              </div>
              <div className="flex justify-between">
                <span>利用模式</span>
                <span className="font-semibold text-utilize">45m</span>
              </div>
            </CardContent>
          </Card>

          {/* 作品选择 */}
          <Card>
            <CardHeader>
              <CardTitle>当前作品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-medium">汐律前端开发</div>
                      <div className="text-sm text-muted-foreground">75% 完成</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    切换
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <div className="font-medium">算法学习</div>
                      <div className="text-sm text-muted-foreground">45% 完成</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    切换
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 今日计划 */}
          <Card>
            <CardHeader>
              <CardTitle>今日计划</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>完成前端开发</span>
                  <span className="text-explore">3个番茄钟</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>算法练习</span>
                  <span className="text-explore">2个番茄钟</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>文档编写</span>
                  <span className="text-utilize">1个番茄钟</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}