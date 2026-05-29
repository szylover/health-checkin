# 健康打卡 Health Check-in

一款轻量级的健康管理 PWA，帮助你追踪每日运动打卡与饮食摄入。

## 功能

- **首页**：一览今日训练进度与营养摄入，快速入口
- **训练**：每日运动打卡 + 训练计划管理
  - 今日打卡：从动作库中选择当天的训练项目，逐一完成后打勾
  - 训练计划：内置多套训练模板（下肢+核心、上肢力量、全身有氧），支持自定义组数/次数
- **饮食**：记录三餐及加餐，自动汇总热量与三大营养素
- **吃啥**：随机推荐今日菜单，解决"吃什么"的选择困难
- **进度**：连续打卡天数、打卡日历（近28天）、近7天饮食热量趋势

## 技术栈

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Zustand（状态管理，持久化到 localStorage）
- React Router v7
- PWA（vite-plugin-pwa）

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
