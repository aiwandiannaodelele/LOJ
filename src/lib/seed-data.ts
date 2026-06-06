import { pinyin } from "pinyin-pro";

function toPinyin(text: string): string {
  const spaced = pinyin(text, { toneType: "none" });
  const joined = spaced.replace(/\s+/g, "");
  return spaced + " " + joined;
}

const problemTemplates = [
  {
    title: "A + B Problem",
    difficulty: "Easy",
    description: "计算两个整数的和。",
    inputDesc: "两个整数 a 和 b。",
    outputDesc: "一个整数，表示 a + b 的和。",
    sampleInput: "1 2",
    sampleOutput: "3",
    testCases: JSON.stringify([
      { input: "1 2", output: "3" },
      { input: "100 200", output: "300" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "奇偶判断",
    difficulty: "Easy",
    description: "判断一个整数是奇数还是偶数。",
    inputDesc: "一个整数 n。",
    outputDesc: "输出 'odd' 或 'even'。",
    sampleInput: "3",
    sampleOutput: "odd",
    testCases: JSON.stringify([
      { input: "3", output: "odd" },
      { input: "4", output: "even" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "最大值",
    difficulty: "Easy",
    description: "找出三个整数中的最大值。",
    inputDesc: "三个整数 a, b, c。",
    outputDesc: "输出最大值。",
    sampleInput: "1 5 3",
    sampleOutput: "5",
    testCases: JSON.stringify([
      { input: "1 5 3", output: "5" },
      { input: "10 2 8", output: "10" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "斐波那契数列",
    difficulty: "Medium",
    description: "求斐波那契数列的第 n 项。",
    inputDesc: "一个整数 n (1 <= n <= 30)。",
    outputDesc: "第 n 个斐波那契数。",
    sampleInput: "5",
    sampleOutput: "5",
    testCases: JSON.stringify([
      { input: "5", output: "5" },
      { input: "10", output: "55" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "排序",
    difficulty: "Medium",
    description: "对 n 个整数进行升序排序。",
    inputDesc: "第一行一个整数 n，第二行 n 个整数。",
    outputDesc: "升序排序后的整数，空格分隔。",
    sampleInput: "3\n3 1 2",
    sampleOutput: "1 2 3",
    testCases: JSON.stringify([
      { input: "3\n3 1 2", output: "1 2 3" },
      { input: "5\n5 4 3 2 1", output: "1 2 3 4 5" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "二分查找",
    difficulty: "Medium",
    description: "在有序数组中查找目标值的位置。",
    inputDesc: "第一行 n，第二行 n 个有序整数，第三行目标值 x。",
    outputDesc: "目标值的索引（从0开始），不存在输出 -1。",
    sampleInput: "5\n1 2 3 4 5\n3",
    sampleOutput: "2",
    testCases: JSON.stringify([
      { input: "5\n1 2 3 4 5\n3", output: "2" },
      { input: "4\n1 2 3 4\n5", output: "-1" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
  {
    title: "最长递增子序列",
    difficulty: "Hard",
    description: "求数组的最长严格递增子序列长度。",
    inputDesc: "第一行 n，第二行 n 个整数。",
    outputDesc: "最长递增子序列的长度。",
    sampleInput: "6\n1 3 2 4 3 5",
    sampleOutput: "4",
    testCases: JSON.stringify([
      { input: "6\n1 3 2 4 3 5", output: "4" },
      { input: "5\n5 4 3 2 1", output: "1" },
    ]),
    timeLimit: 5,
    memoryLimit: 256,
  },
];

const problemData = [
  { slug: "a-plus-b", title: "A + B Problem", pinyin: toPinyin("A + B Problem"), difficulty: "Easy", description: "计算两个整数的和。", inputDesc: "两个整数 a 和 b。", outputDesc: "一个整数，表示 a + b 的和。", sampleInput: "1 2", sampleOutput: "3", testCases: JSON.stringify([{ input: "1 2", output: "3" }, { input: "100 200", output: "300" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["入门"]) },
  { slug: "odd-even", title: "奇偶判断", pinyin: toPinyin("奇偶判断"), difficulty: "Easy", description: "判断一个整数是奇数还是偶数。", inputDesc: "一个整数 n。", outputDesc: "输出 'odd' 或 'even'。", sampleInput: "3", sampleOutput: "odd", testCases: JSON.stringify([{ input: "3", output: "odd" }, { input: "4", output: "even" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["入门"]) },
  { slug: "max-of-three", title: "最大值", pinyin: toPinyin("最大值"), difficulty: "Easy", description: "找出三个整数中的最大值。", inputDesc: "三个整数 a, b, c。", outputDesc: "输出最大值。", sampleInput: "1 5 3", sampleOutput: "5", testCases: JSON.stringify([{ input: "1 5 3", output: "5" }, { input: "10 2 8", output: "10" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["入门"]) },
  { slug: "fibonacci", title: "斐波那契数列", pinyin: toPinyin("斐波那契数列"), difficulty: "Medium", description: "求斐波那契数列的第 n 项。", inputDesc: "一个整数 n (1 <= n <= 30)。", outputDesc: "第 n 个斐波那契数。", sampleInput: "5", sampleOutput: "5", testCases: JSON.stringify([{ input: "5", output: "5" }, { input: "10", output: "55" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["递推"]) },
  { slug: "sorting", title: "排序", pinyin: toPinyin("排序"), difficulty: "Medium", description: "对 n 个整数进行升序排序。", inputDesc: "第一行一个整数 n，第二行 n 个整数。", outputDesc: "升序排序后的整数，空格分隔。", sampleInput: "3\n3 1 2", sampleOutput: "1 2 3", testCases: JSON.stringify([{ input: "3\n3 1 2", output: "1 2 3" }, { input: "5\n5 4 3 2 1", output: "1 2 3 4 5" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["排序"]) },
  { slug: "binary-search", title: "二分查找", pinyin: toPinyin("二分查找"), difficulty: "Medium", description: "在有序数组中查找目标值的位置。", inputDesc: "第一行 n，第二行 n 个有序整数，第三行目标值 x。", outputDesc: "目标值的索引（从0开始），不存在输出 -1。", sampleInput: "5\n1 2 3 4 5\n3", sampleOutput: "2", testCases: JSON.stringify([{ input: "5\n1 2 3 4 5\n3", output: "2" }, { input: "4\n1 2 3 4\n5", output: "-1" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["二分"]) },
  { slug: "lis", title: "最长递增子序列", pinyin: toPinyin("最长递增子序列"), difficulty: "Hard", description: "求数组的最长严格递增子序列长度。", inputDesc: "第一行 n，第二行 n 个整数。", outputDesc: "最长递增子序列的长度。", sampleInput: "6\n1 3 2 4 3 5", sampleOutput: "4", testCases: JSON.stringify([{ input: "6\n1 3 2 4 3 5", output: "4" }, { input: "5\n5 4 3 2 1", output: "1" }]), timeLimit: 5, memoryLimit: 256, tags: JSON.stringify(["动态规划"]) },
];

const trainingsData = [
  {
    title: "入门必刷 50 题",
    pinyin: toPinyin("入门必刷 50 题"),
    description: "适合初学者的基础算法训练，涵盖输入输出、循环、条件判断等基础语法。",
    difficulty: "入门",
    tags: ["入门", "基础语法"],
    problemIndices: [0, 1, 2],
  },
  {
    title: "动态规划专题",
    pinyin: toPinyin("动态规划专题"),
    description: "从递推到动态规划，逐步掌握 DP 的核心思想与经典模型。",
    difficulty: "Medium",
    tags: ["动态规划", "递推"],
    problemIndices: [3, 6],
  },
  {
    title: "排序与二分查找",
    pinyin: toPinyin("排序与二分查找"),
    description: "深入理解各类排序算法和二分查找的应用场景。",
    difficulty: "Medium",
    tags: ["排序", "二分查找"],
    problemIndices: [4, 5],
  },
];

const contestsData = [
  {
    title: "2026 春季编程挑战赛",
    description: "面向全校学生的编程竞赛，采用 ACM 赛制，欢迎大家报名参加！",
    type: "ACM",
    daysUntilStart: 7,
    durationHours: 3,
    problemIndices: [0, 1, 2, 3],
  },
  {
    title: "周赛 #1",
    description: "每周例行训练赛，OI 赛制，适合巩固基础。",
    type: "OI",
    daysUntilStart: -2,
    durationHours: 24,
    problemIndices: [0, 2, 4],
  },
  {
    title: "新手入门赛",
    description: "专为编程新手设计的入门比赛，题目难度较低。",
    type: "ACM",
    daysUntilStart: -1 / 24,
    durationHours: 3,
    problemIndices: [0, 1],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedDefaultData(prisma: any, adminId?: number) {
  const now = new Date();
  const uid = adminId ?? 0;

  // ── Problems ──
  for (const pd of problemData) {
    const existing = await prisma.problem.findFirst({ where: { slug: pd.slug } });
    if (!existing) {
      await prisma.problem.create({ data: pd });
    } else if (!existing.pinyin) {
      await prisma.problem.update({ where: { id: existing.id }, data: { pinyin: pd.pinyin } });
    }
  }

  // ── Trainings ──
  for (const t of trainingsData) {
    const existing = await prisma.training.findFirst({ where: { title: t.title } });
    if (existing) {
      if (!existing.pinyin) {
        await prisma.training.update({ where: { id: existing.id }, data: { pinyin: t.pinyin } });
      }
      continue;
    }

    await prisma.training.create({
      data: {
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        pinyin: t.pinyin,
        tags: JSON.stringify(t.tags),
        authorId: uid,
        problems: {
          create: t.problemIndices.map((idx, order) => ({
            order,
            ...problemTemplates[idx],
          })),
        },
      },
    });
  }

  // ── Contests ──
  for (const c of contestsData) {
    const existing = await prisma.contest.findFirst({ where: { title: c.title } });
    if (existing) continue;

    await prisma.contest.create({
      data: {
        title: c.title,
        description: c.description,
        type: c.type,
        startTime: new Date(now.getTime() + c.daysUntilStart * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + c.daysUntilStart * 24 * 60 * 60 * 1000 + c.durationHours * 60 * 60 * 1000),
        createdBy: uid,
        problems: {
          create: c.problemIndices.map((idx, order) => ({
            order,
            ...problemTemplates[idx],
          })),
        },
      },
    });
  }
}
