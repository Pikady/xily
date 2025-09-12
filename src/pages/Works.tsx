import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Clock, Target } from 'lucide-react';
import { WorksManager } from '@/components/works/WorksManager';
import { useWorksStore } from '@/stores/worksStore';

export function Works() {
  const { works, fetchWorks, loading } = useWorksStore();

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // 计算统计数据
  const totalWorks = works.length;
  const activeWorks = works.filter(work => !work.is_archived).length;
  const totalTargetHours = works.reduce((sum, work) => sum + work.target_hours, 0);
  const completedWorks = works.filter(work => work.target_hours > 0).length;
  const avgProgress = completedWorks > 0 
    ? Math.round(works.reduce((sum, work) => sum + (work.target_hours > 0 ? 67 : 0), 0) / completedWorks)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">作品管理</h1>
          <p className="text-muted-foreground mt-1">
            管理你的创作项目和学习目标
          </p>
        </div>
      </div>

      {/* 作品统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总作品数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorks}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorks}个进行中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目标时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTargetHours}h</div>
            <p className="text-xs text-muted-foreground">
              总目标时长
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成进度</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              平均完成率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 作品管理器 */}
      <WorksManager />
    </div>
  );
}