# AU School Finder — Style Guide

## 设计参考
- [niche.com/k12](https://niche.com/k12/search/best-schools/) — 学校卡片布局、A+到D等级评分、筛选UX、排名列表信息密度
- [greatschools.org](https://greatschools.org) — 评分圆形徽章、学校对比入口、简洁信息卡
- [realestate.com.au](https://realestate.com.au) — 地图+列表并排、地理筛选、卡片悬停效果

## 配色方案
DaisyUI theme: `emerald`
- Primary: emerald green — 教育/成长感
- 评分等级色: emerald(A+/A) → green(B+) → lime(B) → yellow(C+) → orange(C) → red(D)
- 背景层级: base-100 → base-200 → base-300

## 设计决策
- 排名页: ICSEA等级评分(A+ to D)仿niche.com grade badge + 视觉进度条
- 筛选: 按州/学校类型/办学主体分组过滤
- 学校详情: 关键数据stat卡 + Leaflet交互地图 + SEA分布条
- 导航: sticky顶栏 + 州快捷入口 + 对比工具入口
- 响应式: 移动端隐藏次要列，保留核心数据
