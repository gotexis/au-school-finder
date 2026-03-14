# AU School Finder — Style Guide

## 设计参考
- [niche.com/k12](https://niche.com/k12/search/best-schools/) — 学校卡片布局、A+ to D等级评分、筛选UX、排名列表信息密度、搜索前置hero设计
- [greatschools.org](https://greatschools.org) — 评分圆形徽章、学校对比入口、简洁信息卡、色彩编码评分系统
- [privy.io](https://privy.io) — 渐变hero动效、glassmorphism统计卡、现代SaaS landing page排版
- [linear.app](https://linear.app) — 极简信息层级、柔和渐变卡片、微动效hover效果、圆角设计语言

## 配色方案
DaisyUI theme: `emerald`
- Primary: emerald green — 教育/成长感
- Hero: 多色渐变动画 (emerald → cyan → indigo)
- 评分等级色: emerald(A+/A) → green(B+) → lime(B) → yellow(C+) → orange(C) → red(D)
- 州卡片: 每州独立渐变色 (NSW蓝/VIC粉/QLD黄/SA紫/WA橙/TAS绿/NT红/ACT靛)
- 排名卡片: 4色渐变 (ICSEA翡翠/NAPLAN琥珀/VCE靛蓝/HSC紫红)

## 设计决策
- **Hero**: 动画渐变背景 + 毛玻璃统计卡 + 搜索栏前置 (仿privy.io/linear.app)
- **排名展示**: 4个渐变色卡片，每个代表不同排名维度，hover有光泽扫过效果
- **州浏览**: 每州独立配色渐变卡片，视觉层次分明
- **对比CTA**: 居中大banner，圆角胶囊按钮
- **表格**: 前三名🥇🥈🥉图标，ICSEA值带色彩编码
- **全局**: 圆角3xl、阴影层次、fade-up入场动画
- **响应式**: 移动端4列→2列，hero搜索栏自适应宽度
