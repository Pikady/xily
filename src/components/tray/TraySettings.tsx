import React, { useState } from 'react';
import { useTray } from '../../hooks/useTray';
import { TrayConfig } from '../../types/tray';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Settings } from 'lucide-react';

export function TraySettings() {
  const {
    isVisible,
    tooltip,
    showTray,
    hideTray,
    setTrayTooltip,
    showTrayNotification
  } = useTray();

  const [config, setConfig] = useState<TrayConfig>({
    icon: 'icons/tray-icon.png',
    tooltip: tooltip,
    menuItems: [],
    showOnStartup: true,
    minimizeToTray: true
  });

  const [testNotificationTitle, setTestNotificationTitle] = useState('测试通知');
  const [testNotificationBody, setTestNotificationBody] = useState('这是一个测试通知消息');

  const handleConfigChange = (key: keyof TrayConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveConfig = async () => {
    try {
      await setTrayTooltip(config.tooltip);
      showTrayNotification('设置已保存', '托盘设置已成功保存', 'success');
    } catch (error) {
      showTrayNotification('保存失败', '托盘设置保存失败', 'error');
    }
  };

  const handleTestNotification = async () => {
    try {
      await showTrayNotification(testNotificationTitle, testNotificationBody, 'info');
    } catch (error) {
      console.error('测试通知失败:', error);
    }
  };

  const handleToggleTray = async () => {
    try {
      if (isVisible) {
        await hideTray();
      } else {
        await showTray();
      }
    } catch (error) {
      console.error('切换托盘可见性失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>系统托盘设置</span>
          </CardTitle>
          <CardDescription>
            配置系统托盘的显示和行为选项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 托盘状态 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tray-status">托盘状态</Label>
                <p className="text-sm text-muted-foreground">
                  当前系统托盘的显示状态
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isVisible ? 'text-green-600' : 'text-red-600'}`}>
                  {isVisible ? '已显示' : '已隐藏'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleTray}
                >
                  {isVisible ? '隐藏托盘' : '显示托盘'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* 托盘提示文本 */}
            <div className="space-y-2">
              <Label htmlFor="tray-tooltip">托盘提示文本</Label>
              <Input
                id="tray-tooltip"
                value={config.tooltip}
                onChange={(e) => handleConfigChange('tooltip', e.target.value)}
                placeholder="输入托盘提示文本"
              />
              <p className="text-sm text-muted-foreground">
                鼠标悬停在托盘图标上时显示的提示信息
              </p>
            </div>

            <Separator />

            {/* 启动选项 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启动时显示托盘</Label>
                  <p className="text-sm text-muted-foreground">
                    应用启动时自动显示系统托盘图标
                  </p>
                </div>
                <Switch
                  checked={config.showOnStartup}
                  onCheckedChange={(checked) => handleConfigChange('showOnStartup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>最小化到托盘</Label>
                  <p className="text-sm text-muted-foreground">
                    关闭窗口时最小化到系统托盘而不是退出应用
                  </p>
                </div>
                <Switch
                  checked={config.minimizeToTray}
                  onCheckedChange={(checked) => handleConfigChange('minimizeToTray', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知测试 */}
      <Card>
        <CardHeader>
          <CardTitle>通知测试</CardTitle>
          <CardDescription>
            测试系统托盘通知功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">通知标题</Label>
              <Input
                id="notification-title"
                value={testNotificationTitle}
                onChange={(e) => setTestNotificationTitle(e.target.value)}
                placeholder="输入通知标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-body">通知内容</Label>
              <Input
                id="notification-body"
                value={testNotificationBody}
                onChange={(e) => setTestNotificationBody(e.target.value)}
                placeholder="输入通知内容"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTestNotification}>
              发送测试通知
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTestNotificationTitle('测试通知');
                setTestNotificationBody('这是一个测试通知消息');
              }}
            >
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的系统托盘操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => showTrayNotification('信息', '这是一个信息通知', 'info')}
            >
              测试信息通知
            </Button>
            <Button
              variant="outline"
              onClick={() => showTrayNotification('成功', '操作成功完成', 'success')}
            >
              测试成功通知
            </Button>
            <Button
              variant="outline"
              onClick={() => showTrayNotification('警告', '请注意检查设置', 'warning')}
            >
              测试警告通知
            </Button>
            <Button
              variant="outline"
              onClick={() => showTrayNotification('错误', '操作执行失败', 'error')}
            >
              测试错误通知
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setConfig({
          icon: 'icons/tray-icon.png',
          tooltip: '汐律 - 智能时间管理工具',
          menuItems: [],
          showOnStartup: true,
          minimizeToTray: true
        })}>
          重置设置
        </Button>
        <Button onClick={handleSaveConfig}>
          保存设置
        </Button>
      </div>
    </div>
  );
}