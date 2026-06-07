// Monk Quotes — 悟道语录库
// 调性：黑色幽默、自嘲、带刺的镜子。不是鸡汤，是冷水。
// 等级 1：温和自嘲（笑着点头）
// 等级 2：扎心暴击（笑着沉默）
// 等级 3：存在主义恐吓（笑着去干活）

export interface Quote {
  text: string;
  level: 1 | 2 | 3;
}

export const monkQuotes: Quote[] = [
  // ── Level 1：温和自嘲 ──
  {
    text: "你打开这个软件的次数，比给你妈发消息的次数还多，但任务完成率并没有因此变高。",
    level: 1,
  },
  {
    text: "计划做得越漂亮，现实崩得越响。好在崩溃也是白噪音，有助于专注。",
    level: 1,
  },
  {
    text: "别人在社交媒体表演生活，你在这里表演自律。至少观众只有你一个，不丢人。",
    level: 1,
  },
  {
    text: "时间管理的第一步是承认：时间其实不想被你管理，它只想静静流逝。",
    level: 1,
  },
  {
    text: "你收藏了 47 篇干货文章，此刻正在看第 48 篇。这叫边际效用递减，你懂。",
    level: 1,
  },
  {
    text: "任务列表就像冰箱，打开只是为了确认里面还有没什么想做的，然后关门。",
    level: 1,
  },
  {
    text: "‘明天开始’是人类语言中最美的祈使句，也是被执行率最低的。",
    level: 1,
  },
  {
    text: "你正在用最高效的软件，做着最低效的挣扎。这本身就是一种行为艺术。",
    level: 1,
  },

  // ── Level 2：扎心暴击 ──
  {
    text: "本周你有 3 天没写反思，但刷了 287 条短视频。你的大脑正在用多巴胺投票，而它投给了敌人。",
    level: 2,
  },
  {
    text: "那个被你拖到待安排任务里的任务，已经在里面住了两周。它没交房租，你也不赶它走。",
    level: 2,
  },
  {
    text: "你第 12 次把‘学习 Python’排到下周。Python 不会因此生气，但你的简历会。",
    level: 2,
  },
  {
    text: "‘忙’是现代版的‘狼来了’。说多了，连你自己都信了，但待办列表不会。",
    level: 2,
  },
  {
    text: "你的能力雷达图现在看起来像被狗啃过的饼干。不过别担心，狗至少吃得很开心。",
    level: 2,
  },
  {
    text: "凌晨 2 点打开任务管理软件，不是为了干活，是为了缓解焦虑。软件配合地亮了起来，像个尽职的共谋。",
    level: 2,
  },
  {
    text: "你给自己定了 8 个培养目标，今天完成了 0 个。数学上这叫归零，生活中这叫日常。",
    level: 2,
  },
  {
    text: "‘等我有空’翻译过来就是‘这件事的优先级低于我此刻想做的任何事’。包括发呆。",
    level: 2,
  },
  {
    text: "你的待安排任务不是任务暂存区，是任务养老院。送进去的任务，基本没有出来的。",
    level: 2,
  },

  // ── Level 3：存在主义恐吓 ──
  {
    text: "你这一生能清晰记住的日子不超过 30 天。不写反思的话，今天将毫无痕迹地消失在遗忘里，就像你上周二吃的那顿饭。",
    level: 3,
  },
  {
    text: "宇宙热寂之前，所有恒星都会熄灭。在那之前，你先把今天的任务做完，好吗？",
    level: 3,
  },
  {
    text: "你正在用自由意志选择拖延——如果自由意志存在的话。如果不存在，那你也怪不了自己，去干活吧。",
    level: 3,
  },
  {
    text: "存在先于本质，但你的本质正在由‘未完成任务’定义。萨特没说过这句，但如果他用过待办软件，他肯定会说。",
    level: 3,
  },
  {
    text: "一百年后没人记得你，但此刻这个软件记得你连续 4 天没打卡。软件的记忆力比人类永恒。",
    level: 3,
  },
  {
    text: "你不是在管理时间，你是在试图用任务清单对抗生命的无意义。清单偶尔会赢，前提是你真的去勾它。",
    level: 3,
  },
  {
    text: "如果你现在关掉软件去刷手机，今天将和昨天、前天、大前天一样，成为‘那些想不起来干了什么的某天’之一。",
    level: 3,
  },
  {
    text: "哲学家问：‘未经审视的人生不值得过。’软件问：‘未经勾选的任务不值得写。’后者更具体，因此更残忍。",
    level: 3,
  },
  {
    text: "你终将死去，而你的待办列表可能比你活得更久——如果你把它导出备份的话。让它成为你最短的遗书。",
    level: 3,
  },
];

export function getRandomQuote(levelFilter?: 1 | 2 | 3): Quote {
  const pool = levelFilter
    ? monkQuotes.filter((q) => q.level === levelFilter)
    : monkQuotes;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getDailyQuote(seed?: string): Quote {
  // Deterministic daily quote based on date string
  const key = seed ?? new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % monkQuotes.length;
  return monkQuotes[idx];
}
