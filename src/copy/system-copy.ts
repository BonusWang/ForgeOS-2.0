// System Page Copy — Updates, Backup, About, Last Words
// Sprint 12: 软件人格化独白版
// 调性：软件不再是一个工具，是一个冷眼旁观你摆烂的室友。

export const systemCopy = {
  update: {
    currentVersion: '当前版本',
    checkButton: '打听一下',
    checking: '正在向远方修道院打听……',
    upToDate: '程序猿说在开发了在开发了',
    hasUpdate: '新的启示已降临——虽然你未必会因此变得更自律。',
    updateErrors: [
      '开发者说，没打听到消息。可能网络在摆烂，也可能发布通道还没修好。',
      '开发者说，刚问了一圈，大家都说还在开发了在开发了。',
      '开发者说，版本情报暂时失联。先别急，急也没用。',
      '开发者说，服务器没回话，像极了周一早会里的沉默。',
      '开发者说，发布通道正在装死，等它想开了再来。',
    ],
    downloadUrl: '去下载',
  },

  backup: {
    title: '数据备份',
    localStorageUrlLabel: '本机存储url',
    exportButton: '导出数据',
    importButton: '导入数据',
    syncLocalButton: '同步到本地',
    backupCloudButton: '备份到云服务',
    restoreHistoryButton: '恢复历史数据',
    confirmHistoryRestoreButton: '确认恢复',
    exportSuccess: '数据已导出。你的本地记录现在有了一份备份。',
    importSuccess: '数据已导入，即将刷新…',
    importFailed: '数据导入失败。请确认文件格式正确。',
    syncLocalRunning: '正在从云服务同步到本地…',
    backupCloudRunning: '正在备份到云服务…',
    historyLoading: '正在读取云端历史数据…',
    syncLocalSuccess: '已从云服务同步到本地。',
    backupCloudSuccess: '已备份到云服务。',
    historyLoaded: '已读取云端历史数据，请选择要恢复的版本。',
    historyEmpty: '云端暂无历史数据。',
    historyRestoreSuccess: '已恢复云端历史数据，即将刷新…',
    cloudConflict: '云端和本地同时变化，请到 COS 数据同步面板处理冲突。',
    sepiaHint: '导出、恢复或同步数据，入口统一放在系统页面。',
  },

  health: {
    title: '数据健康',
    summary: '只读摘要：看一眼本地数据、同步状态和待处理风险，不在这里改动任何同步基线。',
    localRecords: '本地记录',
    syncEnabled: '同步开关',
    syncPhase: '同步状态',
    v3Baseline: 'V3 基线',
    conflicts: 'V3 冲突',
    pendingUpload: '待上传本地变更',
    localStorageUrl: '本机存储',
    recentSync: '最近同步',
    enabled: '已启用',
    disabled: '未启用',
    initialized: '已初始化',
    notInitialized: '暂无基线',
    none: '无',
    unavailable: '暂无',
  },

  ritual: {
    title: '使用指南',
    collapsedSummary: '早上定向，白天推进，晚上留证，周末复盘，月底修正目标。',
    expandButton: '展开节奏',
    collapseButton: '收起节奏',
    steps: {
      morning: {
        label: '早上',
        text: '清空待澄清，选出今日承诺。',
      },
      daytime: {
        label: '白天',
        text: '推进最多三件事，临时想法先收集。',
      },
      evening: {
        label: '晚上',
        text: '写每日反思，留下今天的证据。',
      },
      weekend: {
        label: '周末',
        text: '打开周复盘，沉淀完成、卡点和下周一件调整。',
      },
      monthEnd: {
        label: '月底',
        text: '查看成长证据，修正下月目标。',
      },
    },
  },

  about: {
    title: '关于与更新',
    appName: 'Forge-OS',
    description: '一个面向个人目标确认与成长复盘的生活管理系统。Forge yourself —— 自己锻造自己。',
    author: 'Forge-OS Contributors',
    license: 'MIT',
  },

  // Last words: app-before-quit, softer than quotes
  lastWords: [
    '今日无反思，你的 24 小时又将被毫无痕迹地回收。',
    '你没有留下任何文字就离开了，仿佛今天从未存在过——客观上，也确实不存在了。',
    '系统即将关闭，而你今天的答案栏里，只有沉默。',
    '别忘了：记录不是为了完美，是为了证明今天确实发生过。',
    '又一天过去了。你记住了什么？软件帮你记住了：什么也没记。',
    '关闭窗口只需要 0.3 秒，关闭愧疚感需要更久——如果你选择去感受它的话。',
  ],

  nav: {
    systemTitle: '系统设置与备份',
    hasUpdateMarker: '*',
  },

  // Monk quote box title
  quoteTitle: '每日真相',
} as const;

export function pickUpdateErrorCopy(random: () => number = Math.random): string {
  const messages = systemCopy.update.updateErrors;
  const index = Math.min(Math.floor(random() * messages.length), messages.length - 1);
  return messages[index] ?? systemCopy.update.updateErrors[0];
}

export type SystemCopy = typeof systemCopy;
