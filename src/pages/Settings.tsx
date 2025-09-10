import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Bell, Clock, Palette, Monitor, Download, Info } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="text-muted-foreground mt-1">
            个性化你的汐律体验
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧菜单 */}
        <div className="space-y-2">
          <Card>
            <CardContent className="p-2">
              <Button variant="default" className="w-full justify-start">
                <SettingsIcon className="w-4 h-4 mr-2" />
                通用设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                计时器设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                通知设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="w-4 h-4 mr-2" />
                外观设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Monitor className="w-4 h-4 mr-2" />
                快捷键
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                数据管理
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Info className="w-4 h-4 mr-2" />
                关于
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 通用设置 */}
          <Card>
            <CardHeader>
              <CardTitle>通用设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">语言</div>
                  <div className="text-sm text-muted-foreground">选择界面显示语言</div>
                </div>
                <select className="px-3 py-2 border rounded-md">
                  <option>简体中文</option>
                  <option>English</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">自动开始</div>
                  <div className="text-sm text-muted-foreground">自动开始下一个番茄钟</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">悬浮窗</div>
                  <div className="text-sm text-muted-foreground">启用计时器悬浮窗</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 计时器设置 */}
          <Card>
            <CardHeader>
              <CardTitle>计时器设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">专注时长</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>25分钟</option>
                    <option>30分钟</option>
                    <option>45分钟</option>
                    <option>60分钟</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">短休息</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>3分钟</option>
                    <option>5分钟</option>
                    <option>10分钟</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">长休息</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>15分钟</option>
                    <option>20分钟</option>
                    <option>30分钟</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">音效</div>
                  <div className="text-sm text-muted-foreground">播放完成提示音</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">桌面通知</div>
                  <div className="text-sm text-muted-foreground">计时完成时发送通知</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="font-medium mb-3">主题模式</div>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Monitor className="w-6 h-6" />
                    <span className="text-sm">跟随系统</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                    <span className="text-sm">浅色</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                    <span className="text-sm">深色</span>
                  </Button>
                </div>
              </div>

              <div>
                <div className="font-medium mb-3">主题色彩</div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 cursor-pointer border-2 border-blue-600"></div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 cursor-pointer"></div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500 cursor-pointer"></div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500 cursor-pointer"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button>保存设置</Button>
          </div>
        </div>
      </div>
    </div>
  );
}