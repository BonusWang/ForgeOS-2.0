// ALO Copy Text — Empty States, Tooltips, Errors & Sarcastic Monologues
// Sprint 12: 黑色幽默全局替换版
// 调性：带刺的镜子。笑着笑着突然沉默，然后默默去把任务做了。

export const forgeCopy = {
  // ── Empty State Messages ──
  emptyStates: {
    inbox: "待澄清空空如也——或者你只是把所有事都拖到了‘明天’，那个永不抵达的国度。",
    weekBoardColumn: "暂无任务。太好了，一片空白，就像你对今天下午的规划一样。",
    reflectionLibrary: "暂无反思记录。你花了 0 秒审视今天，这意味着今天对你来说和昨天没有区别。",
    abilityTracker: "尚未创建能力。你的雷达图现在是一片纯洁的虚无，某种意义上也是一种天赋。",
    entertainment: "今天还没有娱乐活动。你是机器人吗？如果是，请跳过此提示。",
    habitTracker: "暂无习惯。习惯是复利，而你现在的本金是零。起步永远不晚，但确实越来越贵。",
    moodTracker: "暂无情绪记录。你的内心此刻是一团无法解析的混沌——也许记下来会清楚一点？",
    timeBlock: "今天的时间块一片空白。时间正在以每秒一秒的恒定速度逃离你，而你没有做任何挽留。",
    inspirationVault: "灵感仓库空空如也。灵感不会拜访不工作的人，它只会在你动手时出现。",
    okr: "暂无目标。没有方向的努力叫挣扎，有方向的努力才叫前进。你目前属于前者。",
    keyResults: "暂无关键结果。目标没有结果，就像烧烤没有调料——本质上还是生的。",
    radar: "暂无能力数据，雷达图无法生成。你的自我认知现在是一片黑洞，连光都逃不出去。",
    reflectionTemplate: "暂无可用模板。你连拷问自己的工具都没准备好，难怪逃避得这么顺利。",
    abilityManagement: "暂无能力。你的培养计划目前处于‘尚未发生’的量子态，观察一下就会坍缩。",
  },

  // ── Tutorial / Tooltip Messages ──
  tooltips: {
    dragReorder: "拖拽任务调整优先级。如果拖不动，可能是你的决心还不够重。",
    abilityScoring: "勾选完成的任务会自动累计能力分数。progress is silent，但你的雷达图会大声出卖你。",
    weeklyReset: "每周一 00:00，看板自动归档。未完成的任务会移入待安排任务——那里已经是它们的长期居住地了。",
    modulePicker: "隐藏你不用的模块，眼不见为净。但问题不会因为你闭上眼睛就消失。",
    reflectionTemplate: "反思模板是你给自己设下的拷问椅。问题越尖锐，答案越值钱。",
  },

  // ── Error & Exception Messages ──
  errors: {
    importFailed: "数据导入失败。文件格式不对，或者你又在试图导入一张表情包。",
    storageFull: "本地存储空间不足。你的数字人生已经胖到塞不下了，导出备份后删点过去的自己吧。",
    generic: "出错了。这不是你的错——好吧，可能有一点是你的错，但主要是代码的错。",
  },

  // ── Brand Slogans ──
  slogans: {
    primary: "在黑暗中，金箔是最谦卑的荣耀。",
    secondary: "Forge-OS — Forge yourself —— 自己锻造自己。",
  },

  // ── Navigation Hover Titles ──
  nav: {
    dashboardHover: "规划你的一周，然后看着它崩坏。至少崩得有序。",
    reflectionHover: "记录不是为了完美，是为了证明今天确实发生过。",
    systemHover: "检查版本、备份数据、阅读扎心语录——系统能做的就这些，剩下的靠你。",
    moduleHover: "关掉你不看的模块，节省的像素可以留给你的愧疚感。",
    themeHover: "切换主题。黑暗模式适合深夜自我感动，浅色模式适合白天自我欺骗。",
  },

  // ── Button / Action Labels ──
  actions: {
    save: "假装保存了",
    cancel: "算了",
    edit: "✎ 动手改",
    add: "+ 加一个",
    delete: "× 删掉",
    checkUpdate: "打听一下",
    exportData: "导出数据",
    importData: "导入数据",
    goBack: "< 溜了",
    goNext: "冲 >",
    currentWeek: "回到现实",
    prevWeek: "< 上周的烂摊子",
    nextWeek: "下周再说 >",
    viewEdit: "看看/改改",
    manageTemplate: "调教模板",
    addTask: "+ 添乱",
    addEntertainment: "+ 找点乐子",
    markComplete: "☑ 勾掉它",
    markIncomplete: "□ 放它一马",
  },

  // ── Progress / Status Labels ──
  status: {
    allComplete: "[*] 全部完成——此刻的你值得一杯水。别骄傲，明天还有。",
    noTasksToday: "今日无任务。是真的很闲，还是只是把该做的事藏进了‘下周’？",
    reflectionDone: "☑ 今日已反思——你的灵魂今天被照了一下，反光率待定。",
    reflectionNotDone: "今日无反思。24 小时又将被毫无痕迹地回收。",
    controlLevel: "掌控感",
    abilityPoints: "能力",
  },

  // ── Scene Monologues (used by useSarcasticMonologue) ──
  monologues: {
    emptyBoard: [
      "看板全空。不是因为你效率太高，是因为你连‘假装忙碌’都懒得装。",
      "0 个任务。软件此刻比你更清楚：你打开它只是为了缓解‘我应该做点什么’的焦虑。",
      "一片空白的周计划，配上一颗空白的大脑。至少很搭。",
    ],
    streakBroken: [
      "连续 {days} 天没写反思。你的‘坚持’像冰激凌一样融化了，而且没人给你再买一根。",
      "断更 {days} 天。软件不会生气，它只是默默把你的连续记录归零，像什么都没发生过——时间本来就是这样。",
    ],
    lateNight: [
      "凌晨了还在看任务板。你不是在规划明天，你是在用‘准备’逃避‘睡觉’，用‘焦虑’逃避‘做梦’。",
      "深夜 1 点的任务管理软件，是成年人的午夜冰箱。打开、看看、关上、一无所获。",
    ],
    allCompleted: [
      "全部完成了！这种罕见的时刻应该被刻进石碑——或者至少截图发个朋友圈。",
      "今日任务清零。你此刻的爽感会在明天早上重置，趁现在享受。",
    ],
  },
} as const;

export type ForgeCopy = typeof forgeCopy;
