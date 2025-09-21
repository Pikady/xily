import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MotivationData } from '@/types/ai-work';
import { Target, Heart, Shield, Clock, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MotivationSummaryProps {
  data: MotivationData;
  editable?: boolean;
  onEdit?: (data: MotivationData) => void;
}

export function MotivationSummary({ data, editable = false, onEdit }: MotivationSummaryProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<MotivationData>(data);

  const startEdit = (section: string, currentData: any) => {
    setEditingSection(section);
    setTempData({ ...tempData, [section]: currentData });
  };

  const saveEdit = (section: string) => {
    if (onEdit) {
      onEdit(tempData);
    }
    setEditingSection(null);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setTempData(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          动机策略
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* WOOP 方法 */}
        {data.woop && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              WOOP 方法
            </h4>

            <div className="grid gap-3">
              {/* Wish */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">愿望 (Wish)</label>
                {editingSection === 'wish' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempData.woop?.wish || ''}
                      onChange={(e) => setTempData({
                        ...tempData,
                        woop: { ...tempData.woop!, wish: e.target.value }
                      })}
                      placeholder="你的愿望是什么？"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit('woop')}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="text-sm bg-blue-50 border border-blue-200 rounded p-2">
                      {data.woop.wish}
                    </p>
                    {editable && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => startEdit('woop', data.woop)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Outcome */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">结果 (Outcome)</label>
                <p className="text-sm bg-green-50 border border-green-200 rounded p-2">
                  {data.woop.outcome}
                </p>
              </div>

              {/* Obstacle */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">障碍 (Obstacle)</label>
                <p className="text-sm bg-orange-50 border border-orange-200 rounded p-2">
                  {data.woop.obstacle}
                </p>
              </div>

              {/* Plan */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">计划 (Plan)</label>
                <p className="text-sm bg-purple-50 border border-purple-200 rounded p-2">
                  {data.woop.plan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 执行意图 */}
        {data.implementation_intentions && data.implementation_intentions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              执行意图
            </h4>

            <div className="space-y-2">
              {data.implementation_intentions.map((intention, index) => (
                <div key={index} className="border rounded p-3 bg-yellow-50">
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">如果 {intention.if}</span>
                    <br />
                    <span className="font-medium text-green-600">那么 {intention.then}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      优先级: {intention.priority}/5
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 承诺机制 */}
        {data.commitments && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              承诺声明
            </h4>

            <div className={cn(
              "border rounded p-3",
              data.commitments.type === 'public'
                ? "bg-red-50 border-red-200"
                : "bg-gray-50 border-gray-200"
            )}>
              <p className="text-sm italic">
                "{data.commitments.statement}"
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={data.commitments.type === 'public' ? 'default' : 'secondary'}>
                  {data.commitments.type === 'public' ? '公开承诺' : '私下承诺'}
                </Badge>
                {data.commitments.deadline && (
                  <Badge variant="outline">
                    截止: {data.commitments.deadline}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 激励因素 */}
        {data.motivation_factors && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              激励因素
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 内在动机 */}
              {data.motivation_factors.intrinsic && data.motivation_factors.intrinsic.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">内在动机</label>
                  <div className="space-y-1">
                    {data.motivation_factors.intrinsic.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 外在动机 */}
              {data.motivation_factors.extrinsic && data.motivation_factors.extrinsic.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">外在动机</label>
                  <div className="space-y-1">
                    {data.motivation_factors.extrinsic.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 价值观 */}
              {data.motivation_factors.values && data.motivation_factors.values.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">相关价值观</label>
                  <div className="space-y-1">
                    {data.motivation_factors.values.map((value, index) => (
                      <Badge key={index} variant="default" className="text-xs bg-indigo-100 text-indigo-700">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 动机强度指示 */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">动机策略完整度</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(data.woop ? 25 : 0) +
                           (data.implementation_intentions?.length ? 25 : 0) +
                           (data.commitments ? 25 : 0) +
                           (data.motivation_factors ? 25 : 0)}%`
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {data.woop ? '✓' : '✗'} WOOP
              </span>
              <span className="text-xs text-muted-foreground">
                {data.implementation_intentions?.length ? '✓' : '✗'} 意图
              </span>
              <span className="text-xs text-muted-foreground">
                {data.commitments ? '✓' : '✗'} 承诺
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}