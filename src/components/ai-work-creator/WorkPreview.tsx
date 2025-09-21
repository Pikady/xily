import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtractedWorkData } from '@/types/ai-work';
import { Palette, Target, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkPreviewProps {
  data: ExtractedWorkData;
  onEdit?: (field: string, value: any) => void;
  isValid?: boolean;
}

const COLOR_OPTIONS = [
  { value: '#3498db', name: '蓝色' },
  { value: '#e67e22', name: '橙色' },
  { value: '#2ecc71', name: '绿色' },
  { value: '#e74c3c', name: '红色' },
  { value: '#9b59b6', name: '紫色' },
  { value: '#1abc9c', name: '青色' },
  { value: '#34495e', name: '深灰' },
  { value: '#f39c12', name: '黄色' },
];

const TARGET_HOUR_OPTIONS = [
  { value: 0.5, label: '30分钟' },
  { value: 1, label: '1小时' },
  { value: 2, label: '2小时' },
  { value: 4, label: '4小时' },
  { value: 8, label: '8小时' },
  { value: 16, label: '16小时' },
  { value: 24, label: '24小时' },
  { value: 48, label: '48小时' },
  { value: 80, label: '80小时' },
  { value: 120, label: '120小时' },
];

export function WorkPreview({ data, onEdit, isValid = true }: WorkPreviewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: currentValue });
  };

  const saveEdit = (field: string) => {
    if (onEdit) {
      onEdit(field, tempValues[field]);
    }
    setEditingField(null);
  };

  const cancelEdit = (field: string) => {
    setEditingField(null);
    setTempValues({ ...tempValues, [field]: data[field as keyof ExtractedWorkData] });
  };

  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          作品预览
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 作品名称 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            作品名称
          </label>
          {editingField === 'name' ? (
            <div className="flex gap-2">
              <Input
                value={tempValues.name || ''}
                onChange={(e) => setTempValues({ ...tempValues, name: e.target.value })}
                placeholder="输入作品名称..."
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => saveEdit('name')}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => cancelEdit('name')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="font-medium text-lg">{data.name}</div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEdit('name', data.name)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 作品描述 */}
        {data.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              作品描述
            </label>
            {editingField === 'description' ? (
              <div className="space-y-2">
                <Textarea
                  value={tempValues.description || ''}
                  onChange={(e) => setTempValues({ ...tempValues, description: e.target.value })}
                  placeholder="描述作品内容..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit('description')}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelEdit('description')}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-0 right-0"
                  onClick={() => startEdit('description', data.description)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 目标时间 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            目标时间
          </label>
          {editingField === 'target_hours' ? (
            <div className="flex gap-2">
              <Select
                value={tempValues.target_hours?.toString() || ''}
                onValueChange={(value) => setTempValues({ ...tempValues, target_hours: parseFloat(value) })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择目标时间" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_HOUR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => saveEdit('target_hours')}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => cancelEdit('target_hours')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                {TARGET_HOUR_OPTIONS.find(opt => opt.value === data.target_hours)?.label || `${data.target_hours}小时`}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEdit('target_hours', data.target_hours)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 颜色选择 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            作品颜色
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onEdit?.('color', color.value)}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  data.color === color.value
                    ? 'border-primary scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          {data.color && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-sm text-muted-foreground">
                {COLOR_OPTIONS.find(c => c.value === data.color)?.name}
              </span>
            </div>
          )}
        </div>

        {/* AI建议 */}
        {data.suggestions && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              AI 建议
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {data.suggestions.name_alternatives && data.suggestions.name_alternatives.length > 0 && (
                <div>
                  <span className="font-medium">名称建议：</span>
                  {data.suggestions.name_alternatives.join('、')}
                </div>
              )}
              {data.suggestions.color_recommendations && data.suggestions.color_recommendations.length > 0 && (
                <div>
                  <span className="font-medium">颜色建议：</span>
                  <div className="flex gap-1 mt-1">
                    {data.suggestions.color_recommendations.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color }}
                        title={COLOR_OPTIONS.find(c => c.value === color)?.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 提取说明 */}
        {data.extraction_notes && (
          <div className="text-xs text-muted-foreground italic">
            {data.extraction_notes}
          </div>
        )}

        {/* 验证状态 */}
        {!isValid && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
            <p className="text-sm text-destructive">
              请完善作品信息后再创建
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}