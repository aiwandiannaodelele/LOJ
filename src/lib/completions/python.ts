import type { Monaco } from "@monaco-editor/react";

type Item = {
  label: string;
  kind: number;
  insertText: string;
  detail: string;
  doc?: string;
  sortText?: string;
};

const K = (m: Monaco) => m.languages.CompletionItemKind;

// ─── Python 内置函数 ───
function builtins(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "print", kind: k.Function, insertText: "print(${1:x})", detail: "print(*args, sep=' ', end='\\n')", doc: "输出", sortText: "0" },
    { label: "input", kind: k.Function, insertText: "input(${1:''})", detail: "input(prompt='') -> str", doc: "读取一行输入", sortText: "0" },
    { label: "len", kind: k.Function, insertText: "len(${1:s})", detail: "len(s) -> int", doc: "返回长度", sortText: "0" },
    { label: "range", kind: k.Function, insertText: "range(${1:n})", detail: "range(stop) / range(start, stop, step)", doc: "整数序列", sortText: "0" },
    { label: "int", kind: k.Function, insertText: "int(${1:x})", detail: "int(x=0) -> int", doc: "转整数", sortText: "0" },
    { label: "float", kind: k.Function, insertText: "float(${1:x})", detail: "float(x=0) -> float", doc: "转浮点数", sortText: "0" },
    { label: "str", kind: k.Function, insertText: "str(${1:x})", detail: "str(x='') -> str", doc: "转字符串", sortText: "0" },
    { label: "list", kind: k.Function, insertText: "list(${1:iterable})", detail: "list(iterable=()) -> list", doc: "创建列表", sortText: "0" },
    { label: "dict", kind: k.Function, insertText: "dict(${1:})", detail: "dict(**kwargs) -> dict", doc: "创建字典", sortText: "0" },
    { label: "set", kind: k.Function, insertText: "set(${1:iterable})", detail: "set(iterable=()) -> set", doc: "创建集合", sortText: "0" },
    { label: "tuple", kind: k.Function, insertText: "tuple(${1:iterable})", detail: "tuple(iterable=()) -> tuple", doc: "创建元组", sortText: "0" },
    { label: "bool", kind: k.Function, insertText: "bool(${1:x})", detail: "bool(x) -> bool", doc: "转布尔值" },
    { label: "type", kind: k.Function, insertText: "type(${1:x})", detail: "type(x) -> type", doc: "返回类型" },
    { label: "isinstance", kind: k.Function, insertText: "isinstance(${1:obj}, ${2:cls})", detail: "isinstance(obj, cls) -> bool", doc: "类型检查" },
    { label: "enumerate", kind: k.Function, insertText: "enumerate(${1:iterable}, start=0)", detail: "enumerate(iterable, start=0)", doc: "带索引遍历", sortText: "0" },
    { label: "zip", kind: k.Function, insertText: "zip(${1:a}, ${2:b})", detail: "zip(*iterables)", doc: "并行遍历", sortText: "0" },
    { label: "map", kind: k.Function, insertText: "map(${1:func}, ${2:iterable})", detail: "map(func, iterable)", doc: "映射", sortText: "0" },
    { label: "filter", kind: k.Function, insertText: "filter(${1:func}, ${2:iterable})", detail: "filter(func, iterable)", doc: "过滤" },
    { label: "sorted", kind: k.Function, insertText: "sorted(${1:iterable}, key=${2:None}, reverse=${3:False})", detail: "sorted(iterable, key=None, reverse=False) -> list", doc: "排序返回新列表", sortText: "0" },
    { label: "reversed", kind: k.Function, insertText: "reversed(${1:seq})", detail: "reversed(seq) -> iterator", doc: "反转迭代器" },
    { label: "sum", kind: k.Function, insertText: "sum(${1:iterable}, start=0)", detail: "sum(iterable, start=0) -> number", doc: "求和" },
    { label: "min", kind: k.Function, insertText: "min(${1:iterable})", detail: "min(iterable) / min(a, b, ...)", doc: "最小值" },
    { label: "max", kind: k.Function, insertText: "max(${1:iterable})", detail: "max(iterable) / max(a, b, ...)", doc: "最大值" },
    { label: "abs", kind: k.Function, insertText: "abs(${1:x})", detail: "abs(x) -> number", doc: "绝对值" },
    { label: "round", kind: k.Function, insertText: "round(${1:x}, ${2:0})", detail: "round(x, ndigits=0) -> number", doc: "四舍五入" },
    { label: "pow", kind: k.Function, insertText: "pow(${1:x}, ${2:y})", detail: "pow(x, y) -> number", doc: "幂运算" },
    { label: "divmod", kind: k.Function, insertText: "divmod(${1:a}, ${2:b})", detail: "divmod(a, b) -> (quot, rem)", doc: "商和余数" },
    { label: "chr", kind: k.Function, insertText: "chr(${1:i})", detail: "chr(i) -> str", doc: "整数转字符" },
    { label: "ord", kind: k.Function, insertText: "ord(${1:c})", detail: "ord(c) -> int", doc: "字符转整数" },
    { label: "hex", kind: k.Function, insertText: "hex(${1:x})", detail: "hex(x) -> str", doc: "转十六进制字符串" },
    { label: "oct", kind: k.Function, insertText: "oct(${1:x})", detail: "oct(x) -> str", doc: "转八进制字符串" },
    { label: "bin", kind: k.Function, insertText: "bin(${1:x})", detail: "bin(x) -> str", doc: "转二进制字符串" },
    { label: "open", kind: k.Function, insertText: "open('${1:file}', '${2:r}')", detail: "open(file, mode='r') -> file", doc: "打开文件" },
    { label: "format", kind: k.Function, insertText: "format(${1:value}, '${2:}')", detail: "format(value, format_spec='')", doc: "格式化" },
    { label: "repr", kind: k.Function, insertText: "repr(${1:obj})", detail: "repr(obj) -> str", doc: "字符串表示" },
    { label: "id", kind: k.Function, insertText: "id(${1:obj})", detail: "id(obj) -> int", doc: "对象标识" },
    { label: "hash", kind: k.Function, insertText: "hash(${1:obj})", detail: "hash(obj) -> int", doc: "哈希值" },
    { label: "hasattr", kind: k.Function, insertText: "hasattr(${1:obj}, '${2:name}')", detail: "hasattr(obj, name) -> bool", doc: "是否有属性" },
    { label: "getattr", kind: k.Function, insertText: "getattr(${1:obj}, '${2:name}')", detail: "getattr(obj, name)", doc: "获取属性" },
    { label: "setattr", kind: k.Function, insertText: "setattr(${1:obj}, '${2:name}', ${3:value})", detail: "setattr(obj, name, value)", doc: "设置属性" },
    { label: "callable", kind: k.Function, insertText: "callable(${1:obj})", detail: "callable(obj) -> bool", doc: "是否可调用" },
    { label: "iter", kind: k.Function, insertText: "iter(${1:obj})", detail: "iter(obj) -> iterator", doc: "获取迭代器" },
    { label: "next", kind: k.Function, insertText: "next(${1:iterator})", detail: "next(iterator) -> item", doc: "下一个元素" },
    { label: "all", kind: k.Function, insertText: "all(${1:iterable})", detail: "all(iterable) -> bool", doc: "全为True" },
    { label: "any", kind: k.Function, insertText: "any(${1:iterable})", detail: "any(iterable) -> bool", doc: "任一为True" },
    { label: "super", kind: k.Function, insertText: "super()", detail: "super() -> proxy", doc: "父类代理" },
    { label: "property", kind: k.Function, insertText: "property(${1:fget})", detail: "property(fget=None, fset=None, fdel=None)", doc: "属性装饰器" },
    { label: "staticmethod", kind: k.Function, insertText: "staticmethod(${1:func})", detail: "staticmethod(func)", doc: "静态方法装饰器" },
    { label: "classmethod", kind: k.Function, insertText: "classmethod(${1:func})", detail: "classmethod(func)", doc: "类方法装饰器" },
  ];
}

// ─── 列表/字典/集合/字符串方法 ───
function methods(m: Monaco): Item[] {
  const k = K(m);
  return [
    // list
    { label: "append", kind: k.Method, insertText: "append(${1:x})", detail: "list.append(x)", doc: "末尾添加" },
    { label: "extend", kind: k.Method, insertText: "extend(${1:iterable})", detail: "list.extend(iterable)", doc: "扩展列表" },
    { label: "insert", kind: k.Method, insertText: "insert(${1:i}, ${2:x})", detail: "list.insert(i, x)", doc: "在位置i插入x" },
    { label: "remove", kind: k.Method, insertText: "remove(${1:x})", detail: "list.remove(x)", doc: "删除第一个x" },
    { label: "pop", kind: k.Method, insertText: "pop(${1:-1})", detail: "list.pop(i=-1)", doc: "弹出并返回元素" },
    { label: "index", kind: k.Method, insertText: "index(${1:x})", detail: "list.index(x)", doc: "x的索引" },
    { label: "count", kind: k.Method, insertText: "count(${1:x})", detail: "list.count(x)", doc: "x出现的次数" },
    { label: "sort", kind: k.Method, insertText: "sort(key=${1:None}, reverse=${2:False})", detail: "list.sort(key=None, reverse=False)", doc: "原地排序" },
    { label: "reverse", kind: k.Method, insertText: "reverse()", detail: "list.reverse()", doc: "原地反转" },
    { label: "copy", kind: k.Method, insertText: "copy()", detail: "list.copy()", doc: "浅拷贝" },
    { label: "clear", kind: k.Method, insertText: "clear()", detail: "list.clear()", doc: "清空" },
    // dict
    { label: "keys", kind: k.Method, insertText: "keys()", detail: "dict.keys()", doc: "所有键" },
    { label: "values", kind: k.Method, insertText: "values()", detail: "dict.values()", doc: "所有值" },
    { label: "items", kind: k.Method, insertText: "items()", detail: "dict.items()", doc: "所有键值对" },
    { label: "get", kind: k.Method, insertText: "get(${1:key}, ${2:None})", detail: "dict.get(key, default=None)", doc: "获取值（安全）" },
    { label: "setdefault", kind: k.Method, insertText: "setdefault(${1:key}, ${2:None})", detail: "dict.setdefault(key, default=None)", doc: "获取值，不存在则设置" },
    { label: "update", kind: k.Method, insertText: "update(${1:other})", detail: "dict.update(other)", doc: "更新字典" },
    // set
    { label: "add", kind: k.Method, insertText: "add(${1:x})", detail: "set.add(x)", doc: "添加元素" },
    { label: "discard", kind: k.Method, insertText: "discard(${1:x})", detail: "set.discard(x)", doc: "删除元素（安全）" },
    { label: "union", kind: k.Method, insertText: "union(${1:other})", detail: "set.union(other)", doc: "并集" },
    { label: "intersection", kind: k.Method, insertText: "intersection(${1:other})", detail: "set.intersection(other)", doc: "交集" },
    { label: "difference", kind: k.Method, insertText: "difference(${1:other})", detail: "set.difference(other)", doc: "差集" },
    // str
    { label: "strip", kind: k.Method, insertText: "strip('${1:}')", detail: "str.strip(chars='')", doc: "去除两端空白" },
    { label: "lstrip", kind: k.Method, insertText: "lstrip('${1:}')", detail: "str.lstrip(chars='')", doc: "去除左端空白" },
    { label: "rstrip", kind: k.Method, insertText: "rstrip('${1:}')", detail: "str.rstrip(chars='')", doc: "去除右端空白" },
    { label: "split", kind: k.Method, insertText: "split('${1: }')", detail: "str.split(sep=None)", doc: "分割字符串" },
    { label: "join", kind: k.Method, insertText: "join(${1:iterable})", detail: "str.join(iterable)", doc: "连接字符串" },
    { label: "replace", kind: k.Method, insertText: "replace('${1:old}', '${2:new}')", detail: "str.replace(old, new)", doc: "替换" },
    { label: "find", kind: k.Method, insertText: "find('${1:sub}')", detail: "str.find(sub) -> int", doc: "查找子串（返回索引）" },
    { label: "rfind", kind: k.Method, insertText: "rfind('${1:sub}')", detail: "str.rfind(sub) -> int", doc: "从右查找子串" },
    { label: "startswith", kind: k.Method, insertText: "startswith('${1:prefix}')", detail: "str.startswith(prefix) -> bool", doc: "是否以prefix开头" },
    { label: "endswith", kind: k.Method, insertText: "endswith('${1:suffix}')", detail: "str.endswith(suffix) -> bool", doc: "是否以suffix结尾" },
    { label: "upper", kind: k.Method, insertText: "upper()", detail: "str.upper() -> str", doc: "转大写" },
    { label: "lower", kind: k.Method, insertText: "lower()", detail: "str.lower() -> str", doc: "转小写" },
    { label: "title", kind: k.Method, insertText: "title()", detail: "str.title() -> str", doc: "每个单词首字母大写" },
    { label: "capitalize", kind: k.Method, insertText: "capitalize()", detail: "str.capitalize() -> str", doc: "首字母大写" },
    { label: "isdigit", kind: k.Method, insertText: "isdigit()", detail: "str.isdigit() -> bool", doc: "是否全为数字" },
    { label: "isalpha", kind: k.Method, insertText: "isalpha()", detail: "str.isalpha() -> bool", doc: "是否全为字母" },
    { label: "isalnum", kind: k.Method, insertText: "isalnum()", detail: "str.isalnum() -> bool", doc: "是否为字母或数字" },
    { label: "zfill", kind: k.Method, insertText: "zfill(${1:width})", detail: "str.zfill(width)", doc: "左侧补零" },
  ];
}

// ─── Python 代码片段 ───
function snippets(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "def", kind: k.Snippet, insertText: "def ${1:func}(${2:}):\n\t$0", detail: "def func():", doc: "函数定义", sortText: "0" },
    { label: "class", kind: k.Snippet, insertText: "class ${1:MyClass}:\n\tdef __init__(self${2:}):\n\t\t$0", detail: "class MyClass:", doc: "类定义", sortText: "0" },
    { label: "if", kind: k.Snippet, insertText: "if ${1:condition}:\n\t$0", detail: "if condition:", doc: "if语句" },
    { label: "ife", kind: k.Snippet, insertText: "if ${1:condition}:\n\t$2\nelse:\n\t$0", detail: "if-else", doc: "if-else语句" },
    { label: "elif", kind: k.Snippet, insertText: "elif ${1:condition}:\n\t$0", detail: "elif condition:", doc: "elif分支" },
    { label: "for", kind: k.Snippet, insertText: "for ${1:i} in ${2:range(n)}:\n\t$0", detail: "for i in range(n):", doc: "for循环", sortText: "0" },
    { label: "fore", kind: k.Snippet, insertText: "for ${1:x} in ${2:lst}:\n\t$0", detail: "for x in lst:", doc: "for-each循环", sortText: "0" },
    { label: "fori", kind: k.Snippet, insertText: "for ${1:i}, ${2:x} in enumerate(${3:lst}):\n\t$0", detail: "for i, x in enumerate(lst):", doc: "带索引for循环", sortText: "0" },
    { label: "while", kind: k.Snippet, insertText: "while ${1:condition}:\n\t$0", detail: "while condition:", doc: "while循环" },
    { label: "try", kind: k.Snippet, insertText: "try:\n\t$1\nexcept ${2:Exception} as e:\n\t$0", detail: "try-except", doc: "异常处理", sortText: "0" },
    { label: "with", kind: k.Snippet, insertText: "with ${1:open('file')} as ${2:f}:\n\t$0", detail: "with ... as ...:", doc: "上下文管理器" },
    { label: "lambda", kind: k.Snippet, insertText: "lambda ${1:x}: ${2:x}", detail: "lambda x: x", doc: "Lambda表达式" },
    { label: "list_comp", kind: k.Snippet, insertText: "[${1:expr} for ${2:x} in ${3:iterable}]", detail: "[expr for x in iterable]", doc: "列表推导式", sortText: "0" },
    { label: "dict_comp", kind: k.Snippet, insertText: "{${1:k}: ${2:v} for ${3:k}, ${4:v} in ${5:iterable}}", detail: "{k: v for k, v in iterable}", doc: "字典推导式" },
    { label: "main", kind: k.Snippet, insertText: "if __name__ == '__main__':\n\t$0", detail: "if __name__ == '__main__':", doc: "主函数入口", sortText: "0" },
    { label: "input_split", kind: k.Snippet, insertText: "input().split()", detail: "input().split()", doc: "读取一行分割为列表", sortText: "0" },
    { label: "map_int", kind: k.Snippet, insertText: "map(int, input().split())", detail: "map(int, input().split())", doc: "读取一行整数", sortText: "0" },
    { label: "read_n", kind: k.Snippet, insertText: "${1:n} = int(input())", detail: "n = int(input())", doc: "读取一个整数", sortText: "0" },
    { label: "read_list", kind: k.Snippet, insertText: "${1:lst} = list(map(int, input().split()))", detail: "lst = list(map(int, input().split()))", doc: "读取一行整数列表", sortText: "0" },
  ];
}

// ─── math 模块 ───
function mathModule(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "math.sqrt", kind: k.Function, insertText: "math.sqrt(${1:x})", detail: "math.sqrt(x)", doc: "平方根" },
    { label: "math.ceil", kind: k.Function, insertText: "math.ceil(${1:x})", detail: "math.ceil(x)", doc: "向上取整" },
    { label: "math.floor", kind: k.Function, insertText: "math.floor(${1:x})", detail: "math.floor(x)", doc: "向下取整" },
    { label: "math.log", kind: k.Function, insertText: "math.log(${1:x})", detail: "math.log(x)", doc: "自然对数" },
    { label: "math.log10", kind: k.Function, insertText: "math.log10(${1:x})", detail: "math.log10(x)", doc: "常用对数" },
    { label: "math.pow", kind: k.Function, insertText: "math.pow(${1:x}, ${2:y})", detail: "math.pow(x, y)", doc: "幂运算" },
    { label: "math.gcd", kind: k.Function, insertText: "math.gcd(${1:a}, ${2:b})", detail: "math.gcd(a, b)", doc: "最大公约数" },
    { label: "math.lcm", kind: k.Function, insertText: "math.lcm(${1:a}, ${2:b})", detail: "math.lcm(a, b)", doc: "最小公倍数(Python3.9+)" },
    { label: "math.factorial", kind: k.Function, insertText: "math.factorial(${1:n})", detail: "math.factorial(n)", doc: "阶乘" },
    { label: "math.comb", kind: k.Function, insertText: "math.comb(${1:n}, ${2:k})", detail: "math.comb(n, k)", doc: "组合数(Python3.8+)" },
    { label: "math.perm", kind: k.Function, insertText: "math.perm(${1:n}, ${2:k})", detail: "math.perm(n, k)", doc: "排列数(Python3.8+)" },
    { label: "math.fabs", kind: k.Function, insertText: "math.fabs(${1:x})", detail: "math.fabs(x)", doc: "绝对值(浮点)" },
    { label: "math.pi", kind: k.Constant, insertText: "math.pi", detail: "3.14159265358979...", doc: "π" },
    { label: "math.e", kind: k.Constant, insertText: "math.e", detail: "2.71828182845905...", doc: "自然常数e" },
    { label: "math.inf", kind: k.Constant, insertText: "math.inf", detail: "float('inf')", doc: "正无穷" },
  ];
}

// ─── 常用标准库 ───
function stdlib(m: Monaco): Item[] {
  const k = K(m);
  return [
    // sys
    { label: "sys.stdin", kind: k.Property, insertText: "sys.stdin", detail: "sys.stdin", doc: "标准输入" },
    { label: "sys.stdout", kind: k.Property, insertText: "sys.stdout", detail: "sys.stdout", doc: "标准输出" },
    { label: "sys.argv", kind: k.Property, insertText: "sys.argv", detail: "sys.argv", doc: "命令行参数" },
    { label: "sys.exit", kind: k.Function, insertText: "sys.exit(${1:0})", detail: "sys.exit(status)", doc: "退出程序" },
    { label: "sys.setrecursionlimit", kind: k.Function, insertText: "sys.setrecursionlimit(${1:10**6})", detail: "sys.setrecursionlimit(limit)", doc: "设置递归深度" },
    // heapq
    { label: "heapq.heappush", kind: k.Function, insertText: "heapq.heappush(${1:heap}, ${2:x})", detail: "heapq.heappush(heap, x)", doc: "入堆" },
    { label: "heapq.heappop", kind: k.Function, insertText: "heapq.heappop(${1:heap})", detail: "heapq.heappop(heap)", doc: "出堆（最小值）" },
    { label: "heapq.heapify", kind: k.Function, insertText: "heapq.heapify(${1:lst})", detail: "heapq.heapify(lst)", doc: "原地建堆" },
    { label: "heapq.nsmallest", kind: k.Function, insertText: "heapq.nsmallest(${1:k}, ${2:lst})", detail: "heapq.nsmallest(k, lst)", doc: "最小的k个元素" },
    { label: "heapq.nlargest", kind: k.Function, insertText: "heapq.nlargest(${1:k}, ${2:lst})", detail: "heapq.nlargest(k, lst)", doc: "最大的k个元素" },
    // bisect
    { label: "bisect.bisect_left", kind: k.Function, insertText: "bisect.bisect_left(${1:a}, ${2:x})", detail: "bisect.bisect_left(a, x)", doc: "二分左边界" },
    { label: "bisect.bisect_right", kind: k.Function, insertText: "bisect.bisect_right(${1:a}, ${2:x})", detail: "bisect.bisect_right(a, x)", doc: "二分右边界" },
    { label: "bisect.insort_left", kind: k.Function, insertText: "bisect.insort_left(${1:a}, ${2:x})", detail: "bisect.insort_left(a, x)", doc: "二分插入（左）" },
    // collections
    { label: "collections.Counter", kind: k.Class, insertText: "collections.Counter(${1:iterable})", detail: "Counter(iterable)", doc: "计数器" },
    { label: "collections.defaultdict", kind: k.Class, insertText: "collections.defaultdict(${1:int})", detail: "defaultdict(factory)", doc: "带默认值的字典" },
    { label: "collections.deque", kind: k.Class, insertText: "collections.deque(${1:iterable})", detail: "deque(iterable)", doc: "双端队列" },
    { label: "collections.OrderedDict", kind: k.Class, insertText: "collections.OrderedDict()", detail: "OrderedDict()", doc: "有序字典" },
    // itertools
    { label: "itertools.permutations", kind: k.Function, insertText: "itertools.permutations(${1:iterable}, ${2:r})", detail: "permutations(iterable, r)", doc: "排列" },
    { label: "itertools.combinations", kind: k.Function, insertText: "itertools.combinations(${1:iterable}, ${2:r})", detail: "combinations(iterable, r)", doc: "组合" },
    { label: "itertools.product", kind: k.Function, insertText: "itertools.product(${1:iterable1}, ${2:iterable2})", detail: "product(*iterables)", doc: "笛卡尔积" },
    { label: "itertools.accumulate", kind: k.Function, insertText: "itertools.accumulate(${1:iterable})", detail: "accumulate(iterable)", doc: "前缀和" },
    { label: "itertools.chain", kind: k.Function, insertText: "itertools.chain(${1:a}, ${2:b})", detail: "chain(*iterables)", doc: "连接迭代器" },
    // functools
    { label: "functools.lru_cache", kind: k.Function, insertText: "@functools.lru_cache(maxsize=${1:None})\n", detail: "@lru_cache", doc: "缓存装饰器" },
    { label: "functools.reduce", kind: k.Function, insertText: "functools.reduce(${1:func}, ${2:iterable})", detail: "reduce(func, iterable)", doc: "累积" },
  ];
}

// ─── 从 Python 代码中提取上下文 ───
export function extractPythonContext(code: string, monaco: Monaco): Item[] {
  const k = K(monaco);
  const items: Item[] = [];
  const seen = new Set<string>();

  // 提取 import 模块
  const importRe = /(?:import|from)\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Module, insertText: name, detail: `module ${name}`, sortText: "9" });
    }
  }

  // 提取变量赋值: name = ...
  const varRe = /^(\w+)\s*=/gm;
  while ((m = varRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name) && !["True", "False", "None"].includes(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Variable, insertText: name, detail: `var ${name}`, sortText: "8" });
    }
  }

  // 提取 for 循环变量
  const forRe = /for\s+(\w+)\s+in/g;
  while ((m = forRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Variable, insertText: name, detail: `loop var ${name}`, sortText: "8" });
    }
  }

  // 提取函数定义
  const fnRe = /def\s+(\w+)\s*\(/g;
  while ((m = fnRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Function, insertText: `${name}($0)`, detail: `def ${name}()`, sortText: "7" });
    }
  }

  // 提取类定义
  const classRe = /class\s+(\w+)/g;
  while ((m = classRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Class, insertText: name, detail: `class ${name}`, sortText: "6" });
    }
  }

  // 提取 self.xxx 属性
  const selfRe = /self\.(\w+)/g;
  while ((m = selfRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Property, insertText: name, detail: `self.${name}`, sortText: "7" });
    }
  }

  return items;
}

// ─── 汇总所有 Python 补全项 ───
export function getPythonCompletions(m: Monaco): Item[] {
  return [
    ...builtins(m),
    ...methods(m),
    ...snippets(m),
    ...mathModule(m),
    ...stdlib(m),
  ];
}
