# 第三方组件与素材声明

本项目采用 MIT 许可证开源（见 [LICENSE](LICENSE)）。以下列出仓库内包含的第三方组件、外部服务与素材来源，以及各自的授权情况。

## 1. Vant Weapp（有赞）— MIT

- 包名：`@vant/weapp`，版本 `1.11.7`
- 来源：https://github.com/youzan/vant-weapp
- 用途：小程序 UI 组件库，构建产物位于 `miniprogram_npm/@vant/weapp/`
- 原始许可证文件：`node_modules/@vant/weapp/LICENSE`

按 MIT 要求，其版权与许可声明全文如下：

```
Copyright 2016-present Youzan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

Vant 组件内部自带的 `vant-icon` 字体，以及 `share-sheet`、`empty` 等组件中默认引用的外链占位图片，均属于 Vant 发行包的一部分，随其 MIT 许可一并提供，本项目未单独复制或修改。**本项目实际页面未使用这些会加载外链占位图的组件**（空状态已改为纯 CSS 自绘），因此运行时不会请求它们。

## 2. 地图与定位 — 无第三方服务依赖

- 本项目**不调用任何第三方地图 HTTP 接口**，不使用任何地图服务商的 SDK、POI 数据或地图瓦片；`utils/map-service.js` 中的地点、坐标、路线、时长与费用全部由本地虚构数据生成。
- 仓库内不含任何 API Key，也不需要使用者申请 Key。
- 地图底图显示（`<map>`）、设备定位（`wx.getLocation`）与选点（`wx.chooseLocation`）使用的是小程序运行平台的原生组件 / 接口，属于平台自带能力，由平台方提供与运营，不在本项目分发范围内。
- 这些演示数据均为虚构，不对应任何真实地点，不构成真实导航建议。

## 3. Emojiall 分类参考

- 参考页面：https://www.emojiall.com/zh-hans/all-emojis?type=normal
- `utils/emoji.js` 只使用 **Unicode 标准 emoji 字符**及其通用分类名称；字符由用户设备系统字体渲染。
- 未复制该网站的图片、图标、描述文案、数据库或页面设计；未分发其任何受版权保护的素材。
- 各平台 emoji 字形由系统字体厂商提供，其授权随操作系统，不在本项目授权范围内。

## 4. 图标资源 — 本项目原创


- 这些图标随本项目一并按 [MIT](LICENSE) 许可证授权。
- 页面内其余图标为纯 CSS 绘制或文字图形，同为本项目原创；`miniprogram_npm/` 中 Vant 组件自带的图标字体按第 1 节的 MIT 许可随包提供。

## 5. 商标

- 代码中出现的企业、机构、学校、社团、赛事、书目与联系方式均为虚构演示数据，不指向任何真实主体，不构成关联或背书。

## 6. 本项目自身

- 项目源码由本仓库贡献者编写，按 [LICENSE](LICENSE) 以 MIT 授权。

