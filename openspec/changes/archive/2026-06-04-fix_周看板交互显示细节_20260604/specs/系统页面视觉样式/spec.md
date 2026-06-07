## ADDED Requirements

> 中文：新增需求

### Requirement: Dashboard interaction details remain anchored and readable / 周看板交互细节保持定位与可读性

系统 MUST（必须）确保周看板中的日历弹出框和今日进度条在桌面端、滚动页面和不同视觉风格下保持稳定、可读且不产生误导性视觉块。

#### Scenario: Calendar popup stays anchored after page scroll / 页面滚动后日历弹出框保持锚定

- **WHEN** 用户在周看板页面滚动后点击日历日期
- **THEN** 日期详情弹出框贴近被点击的日期格展示
- **AND** 弹出框不因页面滚动偏移被推到页面底部或远离日历卡片
- **AND** 弹出框保持在当前视口可见区域内

#### Scenario: Today progress uses stable visual track / 今日进度使用稳定视觉轨道

- **WHEN** 用户查看今日进度卡片
- **THEN** 进度条使用 CSS 轨道和填充层表达完成比例
- **AND** 不使用 `░` 等空段字符绘制未完成部分
- **AND** 进度百分比文案仍然可见

#### Scenario: Today progress track fills the card rhythm / 今日进度轨道填充卡片节奏

- **WHEN** 今日进度卡片展示完成比例
- **THEN** 进度条主体占据卡片可用横向空间的约 80%
- **AND** 不因固定短字符宽度在卡片中留下大面积无意义空白
- **AND** 能力面板等其它复用进度条的紧凑展示不被强制拉长
