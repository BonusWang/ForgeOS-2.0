## ADDED Requirements
> 中文：新增需求

### Requirement: COS sync status prioritizes active V3 baseline / COS 同步状态优先展示有效 V3 基线

系统 MUST 在同步状态主展示区域优先展示当前有效的 V3 同步状态，避免旧基线和 V3 基线并列造成误导。

#### Scenario: V3 status hides legacy baseline from main status / V3 状态隐藏主区旧基线
- **WHEN** 用户打开系统页 COS 数据同步区域
- **AND** 系统存在 V3 revision 或已完成 V3 初始化
- **THEN** 主状态区域 MUST 展示 V3 基线或 V3 revision
- **AND** 主状态区域 MUST NOT 同时以同级字段展示旧 `基线`

#### Scenario: Legacy baseline remains secondary diagnostics / 旧基线仅作为次级诊断
- **WHEN** 系统仍保存旧同步基线信息
- **THEN** 系统 MAY 在调试信息、旧版快照或展开式次级区域展示旧基线
- **AND** 系统 MUST 明确日常同步使用当前 V3 对象

#### Scenario: V3 sync controls remain usable / V3 同步控制仍可用
- **WHEN** 用户查看精简后的同步状态
- **THEN** 用户 MUST 仍可看到最近同步、设备、V3 初始化、V3 合并、V3 冲突和待上传本地变更
- **AND** 用户 MUST 仍可手动触发立即同步

### Requirement: Mobile local-only visual style is excluded from cross-device sync / 移动端本机风格不进入跨端同步

系统 MUST 将用户主动开启的移动端本机独立风格与跨端同步的全局视觉风格区分，避免手机端风格切换影响桌面端。

#### Scenario: Default style still follows synced style / 默认风格仍跟随同步风格
- **WHEN** 用户未开启移动端本机独立风格
- **THEN** 手机端视觉风格 MUST 继续使用跨端同步或桌面端当前视觉风格
- **AND** 系统 MUST 保持现有默认同步体验

#### Scenario: Local-only style does not upload as desktop style / 本机独立风格不上传为桌面风格
- **WHEN** 用户开启移动端本机独立风格
- **AND** 用户在手机端切换视觉风格
- **AND** 系统随后执行 COS V3 同步
- **THEN** 系统 MUST NOT 将该手机端视觉风格写成会改变桌面端视觉风格的同步字段
- **AND** 桌面端业务数据同步 MUST 不受影响

#### Scenario: Business data continues to sync with local-only style / 本机风格下业务数据继续同步
- **WHEN** 用户开启移动端本机独立风格
- **AND** 用户新增任务、保存灵感或保存反思
- **THEN** 系统 MUST 继续通过 V3 同步这些业务数据
- **AND** 系统 MUST NOT 因本机风格偏好改变 V3 业务实体合并规则
