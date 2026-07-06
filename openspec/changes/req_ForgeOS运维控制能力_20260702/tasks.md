> 开发任务（dev-coder / Codex 主 agent 执行）

## Task 1:清理废弃 Go launcher

- [ ] 1.1 删除 launcher/ 目录
- [ ] 1.2 删除 scripts/build-launcher.mjs
- [ ] 1.3 移除 package.json 中 launcher:build 命令
- [ ] 1.4 清理 README.md 中 launcher 相关描述
- [ ] 1.5 清理 .gitignore 中 launcher/web 引用
- [ ] 1.6 验证:npm run lint + npm run build 通过

## Task 2:实现 forge-service.ps1 运维脚本

- [ ] 2.1 创建 scripts/forge-service.ps1(status / stop / start / restart)
- [ ] 2.2 start 命令实现 detached 后台启动
- [ ] 2.3 stop 命令实现端口清理(5173-5180,仅 node/electron)
- [ ] 2.4 status 命令实现端口检测 + PID 返回
- [ ] 2.5 验证:restart 后服务运行,关闭 AI 会话后服务不断

## Task 3:创建 forge-launcher Skill

- [ ] 3.1 创建 .codex/skills/forge-launcher/SKILL.md
- [ ] 3.2 编写 skill 说明和触发词
- [ ] 3.3 验证:AI 能通过 skill 触发运维命令

## Task 4:验收

- [ ] 4.1 openspec validate 通过
- [ ] 4.2 lint + build 通过
- [ ] 4.3 端到端:restart -> 服务运行 -> 会话关闭 -> 服务仍运行
