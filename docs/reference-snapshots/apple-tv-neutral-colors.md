---
kind: reference
---

# Apple 官网与 Apple TV 中性色参考

取证日期：2026-10-27。使用浏览器加载官方页面，读取 `getComputedStyle`。本文件为人工笔记，不作为自动接受的上游原文快照。

- https://www.apple.com/apple-tv/ ：实测 body 背景 `rgb(0, 0, 0)`，正文 `rgb(245, 245, 247)`，本地导航背景 `rgb(17, 17, 17)`。
- https://www.apple.com/ ：实测 body 背景 `rgb(255, 255, 255)`，正文 `rgb(29, 29, 31)`。

vvs-club 采用黑白灰的内容层次，移除背景蓝紫染色。玻璃透明度、边缘与阴影是本项目适配，未声称复现苹果材质实现。布局继续使用已选影院方向，保留自有品牌与功能。
