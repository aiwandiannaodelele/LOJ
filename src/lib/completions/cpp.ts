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

// ─── C++ STL 容器 ───
function stlContainers(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "vector", kind: k.Class, insertText: "vector<${1:int}> ${2:v};", detail: "std::vector<T>", doc: "动态数组", sortText: "0" },
    { label: "map", kind: k.Class, insertText: "map<${1:int}, ${2:int}> ${3:m};", detail: "std::map<K,V>", doc: "有序映射", sortText: "0" },
    { label: "unordered_map", kind: k.Class, insertText: "unordered_map<${1:int}, ${2:int}> ${3:m};", detail: "std::unordered_map<K,V>", doc: "哈希映射", sortText: "0" },
    { label: "set", kind: k.Class, insertText: "set<${1:int}> ${2:s};", detail: "std::set<T>", doc: "有序集合", sortText: "0" },
    { label: "unordered_set", kind: k.Class, insertText: "unordered_set<${1:int}> ${2:s};", detail: "std::unordered_set<T>", doc: "哈希集合", sortText: "0" },
    { label: "stack", kind: k.Class, insertText: "stack<${1:int}> ${2:st};", detail: "std::stack<T>", doc: "栈", sortText: "0" },
    { label: "queue", kind: k.Class, insertText: "queue<${1:int}> ${2:q};", detail: "std::queue<T>", doc: "队列", sortText: "0" },
    { label: "priority_queue", kind: k.Class, insertText: "priority_queue<${1:int}> ${2:pq};", detail: "std::priority_queue<T>", doc: "优先队列（大根堆）", sortText: "0" },
    { label: "deque", kind: k.Class, insertText: "deque<${1:int}> ${2:d};", detail: "std::deque<T>", doc: "双端队列", sortText: "0" },
    { label: "string", kind: k.Class, insertText: "string ${2:s} = \"${3:}\";", detail: "std::string", doc: "字符串", sortText: "0" },
    { label: "pair", kind: k.Class, insertText: "pair<${1:int}, ${2:int}> ${3:p};", detail: "std::pair<A,B>", doc: "二元组", sortText: "0" },
    { label: "tuple", kind: k.Class, insertText: "tuple<${1:int}, ${2:int}, ${3:int}> ${4:t};", detail: "std::tuple<Ts...>", doc: "多元组", sortText: "0" },
    { label: "array", kind: k.Class, insertText: "array<${1:int}, ${2:10}> ${3:a};", detail: "std::array<T,N>", doc: "固定大小数组", sortText: "0" },
    { label: "bitset", kind: k.Class, insertText: "bitset<${1:32}> ${2:b};", detail: "std::bitset<N>", doc: "位集", sortText: "0" },
  ];
}

// ─── STL 容器方法（点号后触发） ───
function stlMethods(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "push_back", kind: k.Method, insertText: "push_back(${1:x})", detail: "void push_back(const T& x)", doc: "末尾添加元素" },
    { label: "pop_back", kind: k.Method, insertText: "pop_back()", detail: "void pop_back()", doc: "删除末尾元素" },
    { label: "push_front", kind: k.Method, insertText: "push_front(${1:x})", detail: "void push_front(const T& x)", doc: "头部添加元素" },
    { label: "pop_front", kind: k.Method, insertText: "pop_front()", detail: "void pop_front()", doc: "删除头部元素" },
    { label: "size", kind: k.Method, insertText: "size()", detail: "size_t size() const", doc: "返回元素个数" },
    { label: "empty", kind: k.Method, insertText: "empty()", detail: "bool empty() const", doc: "是否为空" },
    { label: "clear", kind: k.Method, insertText: "clear()", detail: "void clear()", doc: "清空" },
    { label: "begin", kind: k.Method, insertText: "begin()", detail: "iterator begin()", doc: "起始迭代器" },
    { label: "end", kind: k.Method, insertText: "end()", detail: "iterator end()", doc: "末尾迭代器" },
    { label: "rbegin", kind: k.Method, insertText: "rbegin()", detail: "reverse_iterator rbegin()", doc: "反向起始迭代器" },
    { label: "rend", kind: k.Method, insertText: "rend()", detail: "reverse_iterator rend()", doc: "反向末尾迭代器" },
    { label: "insert", kind: k.Method, insertText: "insert(${1:pos}, ${2:val})", detail: "iterator insert(iterator pos, const T& val)", doc: "在指定位置插入" },
    { label: "erase", kind: k.Method, insertText: "erase(${1:pos})", detail: "iterator erase(iterator pos)", doc: "删除指定位置元素" },
    { label: "find", kind: k.Method, insertText: "find(${1:key})", detail: "iterator find(const Key& key)", doc: "查找键" },
    { label: "count", kind: k.Method, insertText: "count(${1:key})", detail: "size_t count(const Key& key) const", doc: "键出现的次数" },
    { label: "lower_bound", kind: k.Method, insertText: "lower_bound(${1:key})", detail: "iterator lower_bound(const Key& key)", doc: "不小于key的第一个位置" },
    { label: "upper_bound", kind: k.Method, insertText: "upper_bound(${1:key})", detail: "iterator upper_bound(const Key& key)", doc: "大于key的第一个位置" },
    { label: "top", kind: k.Method, insertText: "top()", detail: "const T& top() const", doc: "栈/优先队列顶部元素" },
    { label: "push", kind: k.Method, insertText: "push(${1:x})", detail: "void push(const T& x)", doc: "入栈/入队" },
    { label: "pop", kind: k.Method, insertText: "pop()", detail: "void pop()", doc: "出栈/出队" },
    { label: "front", kind: k.Method, insertText: "front()", detail: "T& front()", doc: "队首元素" },
    { label: "back", kind: k.Method, insertText: "back()", detail: "T& back()", doc: "队尾元素" },
    { label: "emplace_back", kind: k.Method, insertText: "emplace_back(${1:args})", detail: "void emplace_back(Args&&... args)", doc: "原地构造并添加到末尾" },
    { label: "emplace", kind: k.Method, insertText: "emplace(${1:key}, ${2:val})", detail: "pair<iterator,bool> emplace(K&&, V&&)", doc: "原地构造插入" },
    { label: "emplace_front", kind: k.Method, insertText: "emplace_front(${1:args})", detail: "void emplace_front(Args&&... args)", doc: "原地构造并添加到头部" },
    { label: "resize", kind: k.Method, insertText: "resize(${1:n})", detail: "void resize(size_t n)", doc: "改变大小" },
    { label: "reserve", kind: k.Method, insertText: "reserve(${1:n})", detail: "void reserve(size_t n)", doc: "预留空间" },
    { label: "at", kind: k.Method, insertText: "at(${1:i})", detail: "T& at(size_t i)", doc: "带越界检查的访问" },
    { label: "data", kind: k.Method, insertText: "data()", detail: "T* data()", doc: "返回底层数组指针" },
    { label: "shrink_to_fit", kind: k.Method, insertText: "shrink_to_fit()", detail: "void shrink_to_fit()", doc: "释放多余内存" },
    { label: "first", kind: k.Property, insertText: "first", detail: "A first", doc: "pair第一个元素" },
    { label: "second", kind: k.Property, insertText: "second", detail: "B second", doc: "pair第二个元素" },
    { label: "length", kind: k.Property, insertText: "length()", detail: "size_t length() const", doc: "字符串长度" },
    { label: "substr", kind: k.Method, insertText: "substr(${1:pos}, ${2:len})", detail: "string substr(size_t pos, size_t len) const", doc: "取子串" },
    { label: "c_str", kind: k.Method, insertText: "c_str()", detail: "const char* c_str() const", doc: "返回C风格字符串" },
    { label: "append", kind: k.Method, insertText: "append(${1:s})", detail: "string& append(const string& s)", doc: "追加字符串" },
    { label: "compare", kind: k.Method, insertText: "compare(${1:s})", detail: "int compare(const string& s) const", doc: "比较字符串" },
    { label: "replace", kind: k.Method, insertText: "replace(${1:pos}, ${2:len}, ${3:s})", detail: "string& replace(size_t pos, size_t len, const string& s)", doc: "替换子串" },
  ];
}

// ─── STL 算法 ───
function stlAlgorithms(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "sort", kind: k.Function, insertText: "sort(${1:v}.begin(), ${2:v}.end())", detail: "void sort(RanIt first, RanIt last)", doc: "排序（升序）", sortText: "0" },
    { label: "sort_desc", kind: k.Function, insertText: "sort(${1:v}.begin(), ${2:v}.end(), greater<>())", detail: "sort + greater<>()", doc: "排序（降序）", sortText: "0" },
    { label: "stable_sort", kind: k.Function, insertText: "stable_sort(${1:v}.begin(), ${2:v}.end())", detail: "void stable_sort(RanIt first, RanIt last)", doc: "稳定排序", sortText: "0" },
    { label: "lower_bound", kind: k.Function, insertText: "lower_bound(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "FwdIt lower_bound(FwdIt first, FwdIt last, const T& val)", doc: "不小于val的第一个位置", sortText: "0" },
    { label: "upper_bound", kind: k.Function, insertText: "upper_bound(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "FwdIt upper_bound(FwdIt first, FwdIt last, const T& val)", doc: "大于val的第一个位置", sortText: "0" },
    { label: "binary_search", kind: k.Function, insertText: "binary_search(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "bool binary_search(FwdIt first, FwdIt last, const T& val)", doc: "二分查找是否存在", sortText: "0" },
    { label: "find", kind: k.Function, insertText: "find(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "FwdIt find(FwdIt first, FwdIt last, const T& val)", doc: "线性查找", sortText: "0" },
    { label: "find_if", kind: k.Function, insertText: "find_if(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "FwdIt find_if(FwdIt first, FwdIt last, Pred pred)", doc: "条件查找", sortText: "0" },
    { label: "count", kind: k.Function, insertText: "count(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "ptrdiff_t count(FwdIt first, FwdIt last, const T& val)", doc: "计数", sortText: "0" },
    { label: "reverse", kind: k.Function, insertText: "reverse(${1:v}.begin(), ${2:v}.end())", detail: "void reverse(BidIt first, BidIt last)", doc: "反转", sortText: "0" },
    { label: "unique", kind: k.Function, insertText: "unique(${1:v}.begin(), ${2:v}.end())", detail: "FwdIt unique(FwdIt first, FwdIt last)", doc: "去重（需先排序）", sortText: "0" },
    { label: "next_permutation", kind: k.Function, insertText: "next_permutation(${1:v}.begin(), ${2:v}.end())", detail: "bool next_permutation(BidIt first, BidIt last)", doc: "下一个排列", sortText: "0" },
    { label: "prev_permutation", kind: k.Function, insertText: "prev_permutation(${1:v}.begin(), ${2:v}.end())", detail: "bool prev_permutation(BidIt first, BidIt last)", doc: "上一个排列", sortText: "0" },
    { label: "min", kind: k.Function, insertText: "min(${1:a}, ${2:b})", detail: "const T& min(const T& a, const T& b)", doc: "最小值", sortText: "0" },
    { label: "max", kind: k.Function, insertText: "max(${1:a}, ${2:b})", detail: "const T& max(const T& a, const T& b)", doc: "最大值", sortText: "0" },
    { label: "min_element", kind: k.Function, insertText: "min_element(${1:v}.begin(), ${2:v}.end())", detail: "FwdIt min_element(FwdIt first, FwdIt last)", doc: "最小元素迭代器", sortText: "0" },
    { label: "max_element", kind: k.Function, insertText: "max_element(${1:v}.begin(), ${2:v}.end())", detail: "FwdIt max_element(FwdIt first, FwdIt last)", doc: "最大元素迭代器", sortText: "0" },
    { label: "swap", kind: k.Function, insertText: "swap(${1:a}, ${2:b})", detail: "void swap(T& a, T& b)", doc: "交换", sortText: "0" },
    { label: "fill", kind: k.Function, insertText: "fill(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "void fill(FwdIt first, FwdIt last, const T& val)", doc: "填充", sortText: "0" },
    { label: "copy", kind: k.Function, insertText: "copy(${1:src}.begin(), ${2:src}.end(), ${3:dst}.begin())", detail: "OutIt copy(InIt first, InIt last, OutIt dest)", doc: "复制", sortText: "0" },
    { label: "accumulate", kind: k.Function, insertText: "accumulate(${1:v}.begin(), ${2:v}.end(), ${3:0})", detail: "T accumulate(InIt first, InIt last, T init)", doc: "累加", sortText: "0" },
    { label: "nth_element", kind: k.Function, insertText: "nth_element(${1:v}.begin(), ${2:v}.begin()+${3:k}, ${4:v}.end())", detail: "void nth_element(RanIt first, RanIt nth, RanIt last)", doc: "第k小元素", sortText: "0" },
    { label: "partial_sort", kind: k.Function, insertText: "partial_sort(${1:v}.begin(), ${2:v}.begin()+${3:k}, ${4:v}.end())", detail: "void partial_sort(RanIt first, RanIt middle, RanIt last)", doc: "部分排序", sortText: "0" },
    { label: "merge", kind: k.Function, insertText: "merge(${1:a}.begin(), ${2:a}.end(), ${3:b}.begin(), ${4:b}.end(), ${5:c}.begin())", detail: "OutIt merge(InIt1, InIt1, InIt2, InIt2, OutIt)", doc: "归并", sortText: "0" },
    { label: "distance", kind: k.Function, insertText: "distance(${1:first}, ${2:last})", detail: "ptrdiff_t distance(InIt first, InIt last)", doc: "迭代器距离", sortText: "0" },
    { label: "make_heap", kind: k.Function, insertText: "make_heap(${1:v}.begin(), ${2:v}.end())", detail: "void make_heap(RanIt first, RanIt last)", doc: "建堆", sortText: "0" },
    { label: "push_heap", kind: k.Function, insertText: "push_heap(${1:v}.begin(), ${2:v}.end())", detail: "void push_heap(RanIt first, RanIt last)", doc: "入堆", sortText: "0" },
    { label: "pop_heap", kind: k.Function, insertText: "pop_heap(${1:v}.begin(), ${2:v}.end())", detail: "void pop_heap(RanIt first, RanIt last)", doc: "出堆", sortText: "0" },
    { label: "sort_heap", kind: k.Function, insertText: "sort_heap(${1:v}.begin(), ${2:v}.end())", detail: "void sort_heap(RanIt first, RanIt last)", doc: "堆排序", sortText: "0" },
    { label: "transform", kind: k.Function, insertText: "transform(${1:first}, ${2:last}, ${3:result}, ${4:op})", detail: "OutIt transform(InIt first, InIt last, OutIt result, UnaryOp op)", doc: "变换", sortText: "0" },
    { label: "remove", kind: k.Function, insertText: "remove(${1:v}.begin(), ${2:v}.end(), ${3:val})", detail: "FwdIt remove(FwdIt first, FwdIt last, const T& val)", doc: "移除指定值（配合erase）", sortText: "0" },
    { label: "remove_if", kind: k.Function, insertText: "remove_if(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "FwdIt remove_if(FwdIt first, FwdIt last, Pred pred)", doc: "按条件移除", sortText: "0" },
    { label: "count_if", kind: k.Function, insertText: "count_if(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "ptrdiff_t count_if(FwdIt first, FwdIt last, Pred pred)", doc: "按条件计数", sortText: "0" },
    { label: "for_each", kind: k.Function, insertText: "for_each(${1:v}.begin(), ${2:v}.end(), ${3:f})", detail: "Function for_each(InIt first, InIt last, Function f)", doc: "对每个元素执行操作", sortText: "0" },
    { label: "any_of", kind: k.Function, insertText: "any_of(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "bool any_of(InIt first, InIt last, Pred pred)", doc: "是否存在满足条件的元素", sortText: "0" },
    { label: "all_of", kind: k.Function, insertText: "all_of(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "bool all_of(InIt first, InIt last, Pred pred)", doc: "是否所有元素都满足条件", sortText: "0" },
    { label: "none_of", kind: k.Function, insertText: "none_of(${1:v}.begin(), ${2:v}.end(), ${3:pred})", detail: "bool none_of(InIt first, InIt last, Pred pred)", doc: "是否没有元素满足条件", sortText: "0" },
    { label: "shuffle", kind: k.Function, insertText: "shuffle(${1:v}.begin(), ${2:v}.end(), ${3:rng})", detail: "void shuffle(RanIt first, RanIt last, URBG&& g)", doc: "随机打乱(C++11)", sortText: "0" },
    { label: "iota", kind: k.Function, insertText: "iota(${1:v}.begin(), ${2:v}.end(), ${3:0})", detail: "void iota(InIt first, InIt last, T value)", doc: "递增填充", sortText: "0" },
    { label: "minmax", kind: k.Function, insertText: "minmax(${1:a}, ${2:b})", detail: "pair<const T&,const T&> minmax(const T& a, const T& b)", doc: "同时返回最小最大值", sortText: "0" },
    { label: "replace_if", kind: k.Function, insertText: "replace_if(${1:v}.begin(), ${2:v}.end()}, ${3:pred}, ${4:new_val})", detail: "void replace_if(FwdIt first, FwdIt last, Pred pred, const T& new_val)", doc: "按条件替换", sortText: "0" },
    { label: "generate", kind: k.Function, insertText: "generate(${1:v}.begin(), ${2:v}.end()}, ${3:gen})", detail: "void generate(FwdIt first, FwdIt last, Generator gen)", doc: "用生成器填充", sortText: "0" },
    { label: "partition", kind: k.Function, insertText: "partition(${1:v}.begin(), ${2:v}.end()}, ${3:pred})", detail: "FwdIt partition(FwdIt first, FwdIt last, Pred pred)", doc: "分区", sortText: "0" },
  ];
}

// ─── C/C++ 常用函数 ───
function cFunctions(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "printf", kind: k.Function, insertText: "printf(\"${1:%d}\\n\", ${2:x})", detail: "int printf(const char* fmt, ...)", doc: "格式化输出" },
    { label: "scanf", kind: k.Function, insertText: "scanf(\"${1:%d}\", &${2:x})", detail: "int scanf(const char* fmt, ...)", doc: "格式化输入" },
    { label: "puts", kind: k.Function, insertText: "puts(\"${1:}\")", detail: "int puts(const char* s)", doc: "输出字符串（带换行）" },
    { label: "gets", kind: k.Function, insertText: "gets(${1:s})", detail: "char* gets(char* s)", doc: "读入一行" },
    { label: "malloc", kind: k.Function, insertText: "malloc(${1:n} * sizeof(${2:int}))", detail: "void* malloc(size_t size)", doc: "动态分配内存" },
    { label: "free", kind: k.Function, insertText: "free(${1:ptr})", detail: "void free(void* ptr)", doc: "释放内存" },
    { label: "memset", kind: k.Function, insertText: "memset(${1:arr}, ${2:0}, sizeof(${1:arr}))", detail: "void* memset(void* s, int c, size_t n)", doc: "填充内存" },
    { label: "memcpy", kind: k.Function, insertText: "memcpy(${1:dst}, ${2:src}, sizeof(${2:src}))", detail: "void* memcpy(void* dst, const void* src, size_t n)", doc: "复制内存" },
    { label: "strlen", kind: k.Function, insertText: "strlen(${1:s})", detail: "size_t strlen(const char* s)", doc: "字符串长度" },
    { label: "strcpy", kind: k.Function, insertText: "strcpy(${1:dst}, ${2:src})", detail: "char* strcpy(char* dst, const char* src)", doc: "复制字符串" },
    { label: "strcmp", kind: k.Function, insertText: "strcmp(${1:s1}, ${2:s2})", detail: "int strcmp(const char* s1, const char* s2)", doc: "比较字符串" },
    { label: "strcat", kind: k.Function, insertText: "strcat(${1:dst}, ${2:src})", detail: "char* strcat(char* dst, const char* src)", doc: "连接字符串" },
    { label: "abs", kind: k.Function, insertText: "abs(${1:x})", detail: "int abs(int x)", doc: "绝对值" },
    { label: "labs", kind: k.Function, insertText: "labs(${1:x})", detail: "long labs(long x)", doc: "长整型绝对值" },
    { label: "sqrt", kind: k.Function, insertText: "sqrt(${1:x})", detail: "double sqrt(double x)", doc: "平方根" },
    { label: "pow", kind: k.Function, insertText: "pow(${1:x}, ${2:y})", detail: "double pow(double x, double y)", doc: "幂运算" },
    { label: "ceil", kind: k.Function, insertText: "ceil(${1:x})", detail: "double ceil(double x)", doc: "向上取整" },
    { label: "floor", kind: k.Function, insertText: "floor(${1:x})", detail: "double floor(double x)", doc: "向下取整" },
    { label: "round", kind: k.Function, insertText: "round(${1:x})", detail: "double round(double x)", doc: "四舍五入" },
    { label: "log", kind: k.Function, insertText: "log(${1:x})", detail: "double log(double x)", doc: "自然对数" },
    { label: "log10", kind: k.Function, insertText: "log10(${1:x})", detail: "double log10(double x)", doc: "常用对数" },
    { label: "sin", kind: k.Function, insertText: "sin(${1:x})", detail: "double sin(double x)", doc: "正弦" },
    { label: "cos", kind: k.Function, insertText: "cos(${1:x})", detail: "double cos(double x)", doc: "余弦" },
    { label: "tan", kind: k.Function, insertText: "tan(${1:x})", detail: "double tan(double x)", doc: "正切" },
    { label: "atan2", kind: k.Function, insertText: "atan2(${1:y}, ${2:x})", detail: "double atan2(double y, double x)", doc: "反正切" },
    { label: "exit", kind: k.Function, insertText: "exit(${1:0})", detail: "void exit(int status)", doc: "退出程序" },
    { label: "qsort", kind: k.Function, insertText: "qsort(${1:arr}, ${2:n}, sizeof(${3:int}), ${4:cmp})", detail: "void qsort(void* base, size_t nmemb, size_t size, cmpfun cmp)", doc: "快速排序" },
    { label: "atoi", kind: k.Function, insertText: "atoi(${1:s})", detail: "int atoi(const char* s)", doc: "字符串转int" },
    { label: "atol", kind: k.Function, insertText: "atol(${1:s})", detail: "long atol(const char* s)", doc: "字符串转long" },
    { label: "atof", kind: k.Function, insertText: "atof(${1:s})", detail: "double atof(const char* s)", doc: "字符串转double" },
    { label: "sprintf", kind: k.Function, insertText: "sprintf(${1:buf}, \"${2:%d}\", ${3:x})", detail: "int sprintf(char* buf, const char* fmt, ...)", doc: "格式化写入字符串" },
    { label: "sscanf", kind: k.Function, insertText: "sscanf(${1:s}, \"${2:%d}\", &${3:x})", detail: "int sscanf(const char* s, const char* fmt, ...)", doc: "从字符串读入" },
    { label: "toupper", kind: k.Function, insertText: "toupper(${1:c})", detail: "int toupper(int c)", doc: "转大写" },
    { label: "tolower", kind: k.Function, insertText: "tolower(${1:c})", detail: "int tolower(int c)", doc: "转小写" },
    { label: "isdigit", kind: k.Function, insertText: "isdigit(${1:c})", detail: "int isdigit(int c)", doc: "是否为数字" },
    { label: "isalpha", kind: k.Function, insertText: "isalpha(${1:c})", detail: "int isalpha(int c)", doc: "是否为字母" },
    { label: "isalnum", kind: k.Function, insertText: "isalnum(${1:c})", detail: "int isalnum(int c)", doc: "是否为字母或数字" },
    { label: "isspace", kind: k.Function, insertText: "isspace(${1:c})", detail: "int isspace(int c)", doc: "是否为空白字符" },
    { label: "isupper", kind: k.Function, insertText: "isupper(${1:c})", detail: "int isupper(int c)", doc: "是否为大写字母" },
    { label: "islower", kind: k.Function, insertText: "islower(${1:c})", detail: "int islower(int c)", doc: "是否为小写字母" },
    { label: "rand", kind: k.Function, insertText: "rand()", detail: "int rand()", doc: "生成随机数" },
    { label: "srand", kind: k.Function, insertText: "srand(${1:seed})", detail: "void srand(unsigned seed)", doc: "设置随机种子" },
    { label: "time", kind: k.Function, insertText: "time(nullptr)", detail: "time_t time(time_t* timer)", doc: "当前时间" },
    { label: "clock", kind: k.Function, insertText: "clock()", detail: "clock_t clock()", doc: "程序运行时间" },
    { label: "realloc", kind: k.Function, insertText: "realloc(${1:ptr}, ${2:size})", detail: "void* realloc(void* ptr, size_t size)", doc: "重新分配内存" },
    { label: "calloc", kind: k.Function, insertText: "calloc(${1:n}, sizeof(${2:int}))", detail: "void* calloc(size_t n, size_t size)", doc: "分配并清零内存" },
    { label: "llabs", kind: k.Function, insertText: "llabs(${1:x})", detail: "long long llabs(long long x)", doc: "long long绝对值" },
    { label: "fopen", kind: k.Function, insertText: "fopen(\"${1:file.txt}\", \"${2:r}\")", detail: "FILE* fopen(const char* filename, const char* mode)", doc: "打开文件" },
    { label: "fclose", kind: k.Function, insertText: "fclose(${1:fp})", detail: "int fclose(FILE* fp)", doc: "关闭文件" },
  ];
}

// ─── C++ IO ───
function cppIO(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "cin", kind: k.Variable, insertText: "cin", detail: "std::istream cin", doc: "标准输入流" },
    { label: "cout", kind: k.Variable, insertText: "cout", detail: "std::ostream cout", doc: "标准输出流" },
    { label: "cerr", kind: k.Variable, insertText: "cerr", detail: "std::ostream cerr", doc: "标准错误流" },
    { label: "endl", kind: k.Variable, insertText: "endl", detail: "ostream& endl(ostream&)", doc: "换行并刷新" },
    { label: "tie", kind: k.Method, insertText: "cin.tie(nullptr)", detail: "ostream* tie(ostream* tiestr)", doc: "解绑cin/cout加速" },
    { label: "fixed", kind: k.Variable, insertText: "fixed", detail: "ios_base& fixed(ios_base&)", doc: "定点输出" },
    { label: "setprecision", kind: k.Function, insertText: "setprecision(${1:n})", detail: "setprecision(int n)", doc: "设置精度" },
    { label: "setw", kind: k.Function, insertText: "setw(${1:n})", detail: "setw(int n)", doc: "设置宽度" },
    { label: "setfill", kind: k.Function, insertText: "setfill('${1:0}')", detail: "setfill(char c)", doc: "设置填充字符" },
    { label: "ios_base::sync_with_stdio", kind: k.Function, insertText: "ios_base::sync_with_stdio(false)", detail: "void sync_with_stdio(bool sync = true)", doc: "取消C/C++ IO同步（加速）" },
  ];
}

// ─── C++ 代码片段 ───
function cppSnippets(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "main", kind: k.Snippet, insertText: "int main() {\n\t$0\n\treturn 0;\n}", detail: "int main()", doc: "主函数", sortText: "0" },
    { label: "fori", kind: k.Snippet, insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}", detail: "for (int i = 0; i < n; i++)", doc: "for循环" },
    { label: "forr", kind: k.Snippet, insertText: "for (int ${1:i} = ${2:n} - 1; ${1:i} >= 0; ${1:i}--) {\n\t$0\n}", detail: "for (int i = n-1; i >= 0; i--)", doc: "反向for循环" },
    { label: "foreach", kind: k.Snippet, insertText: "for (auto& ${1:x} : ${2:v}) {\n\t$0\n}", detail: "for (auto& x : v)", doc: "范围for循环" },
    { label: "if", kind: k.Snippet, insertText: "if (${1:condition}) {\n\t$0\n}", detail: "if", doc: "if语句" },
    { label: "ife", kind: k.Snippet, insertText: "if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}", detail: "if-else", doc: "if-else语句" },
    { label: "while", kind: k.Snippet, insertText: "while (${1:condition}) {\n\t$0\n}", detail: "while", doc: "while循环" },
    { label: "struct", kind: k.Snippet, insertText: "struct ${1:Name} {\n\t$0\n};", detail: "struct Name { ... }", doc: "结构体" },
    { label: "class", kind: k.Snippet, insertText: "class ${1:Name} {\npublic:\n\t$0\n};", detail: "class Name { ... }", doc: "类" },
    { label: "typedef", kind: k.Snippet, insertText: "typedef ${1:long long} ${2:ll};", detail: "typedef long long ll", doc: "类型别名" },
    { label: "include", kind: k.Snippet, insertText: "#include <${1:iostream}>", detail: "#include <...>", doc: "头文件" },
    { label: "define", kind: k.Snippet, insertText: "#define ${1:NAME} ${2:value}", detail: "#define NAME value", doc: "宏定义" },
    { label: "template_fn", kind: k.Snippet, insertText: "template<typename ${1:T}>\n${2:void} ${3:func}(${1:T} ${4:arg}) {\n\t$0\n}", detail: "template<typename T> ...", doc: "函数模板" },
    { label: "lambda", kind: k.Snippet, insertText: "auto ${1:f} = [${2:&}](${3:auto} ${4:x}) {\n\t$0\n};", detail: "auto f = [&](auto x) { ... }", doc: "Lambda表达式" },
    { label: "readloop", kind: k.Snippet, insertText: "int ${1:n};\ncin >> ${1:n};\nfor (int ${2:i} = 0; ${2:i} < ${1:n}; ${2:i}++) {\n\t$0\n}", detail: "读入n并循环", doc: "OJ常用模式" },
    { label: "fastio", kind: k.Snippet, insertText: "ios_base::sync_with_stdio(false);\ncin.tie(nullptr);", detail: "fast IO", doc: "快速IO" },
    { label: "using namespace std", kind: k.Snippet, insertText: "using namespace std;", detail: "using namespace std;", doc: "使用标准命名空间" },
    { label: "typedef ll", kind: k.Snippet, insertText: "typedef long long ll;", detail: "typedef long long ll", doc: "long long别名" },
    { label: "typedef pii", kind: k.Snippet, insertText: "typedef pair<int,int> pii;", detail: "typedef pair<int,int> pii", doc: "pair<int,int>别名" },
    { label: "typedef vi", kind: k.Snippet, insertText: "typedef vector<int> vi;", detail: "typedef vector<int> vi", doc: "vector<int>别名" },
    { label: "typedef vvi", kind: k.Snippet, insertText: "typedef vector<vector<int>> vvi;", detail: "typedef vector<vector<int>> vvi", doc: "二维vector别名" },
    { label: "oj_template", kind: k.Snippet, insertText: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\tios_base::sync_with_stdio(false);\n\tcin.tie(nullptr);\n\t$0\n\treturn 0;\n}", detail: "OJ常用模板", doc: "OJ完整代码模板" },
    { label: "binary_search_fn", kind: k.Snippet, insertText: "int lo = ${1:0}, hi = ${2:n - 1}, ans = ${3:-1};\nwhile (lo <= hi) {\n\tint mid = (lo + hi) / 2;\n\tif (${4:check(mid)}) {\n\t\tans = mid;\n\t\t${5:lo = mid + 1;}\n\t} else {\n\t\t${6:hi = mid - 1;}\n\t}\n}", detail: "二分查找模板", doc: "整数二分" },
    { label: "dfs", kind: k.Snippet, insertText: "void dfs(${1:int u}) {\n\tvis[${1:u}] = true;\n\tfor (int v : adj[${1:u}]) {\n\t\tif (!vis[v]) {\n\t\t\tdfs(v);\n\t\t}\n\t}\n}", detail: "DFS模板", doc: "深度优先搜索" },
    { label: "bfs", kind: k.Snippet, insertText: "queue<int> q;\nq.push(${1:s});\nvis[${1:s}] = true;\nwhile (!q.empty()) {\n\tint u = q.front(); q.pop();\n\tfor (int v : adj[u]) {\n\t\tif (!vis[v]) {\n\t\t\tvis[v] = true;\n\t\t\tq.push(v);\n\t\t}\n\t}\n}", detail: "BFS模板", doc: "广度优先搜索" },
    { label: "dsu", kind: k.Snippet, insertText: "vector<int> fa(${1:n});\niota(fa.begin(), fa.end(), 0);\nfunction<int(int)> find = [&](int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); };\nauto unite = [&](int x, int y) { fa[find(x)] = find(y); };", detail: "并查集模板", doc: "DSU/Union-Find" },
    { label: "do-while", kind: k.Snippet, insertText: "do {\n\t$0\n} while (${1:condition});", detail: "do-while", doc: "do-while循环" },
    { label: "switch", kind: k.Snippet, insertText: "switch (${1:expr}) {\n\tcase ${2:0}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}", detail: "switch", doc: "switch语句" },
  ];
}

// ─── C 标准头文件 ───
function cIncludes(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "stdio.h", kind: k.Module, insertText: "stdio.h", detail: "标准输入输出" },
    { label: "stdlib.h", kind: k.Module, insertText: "stdlib.h", detail: "标准库函数" },
    { label: "string.h", kind: k.Module, insertText: "string.h", detail: "字符串操作" },
    { label: "math.h", kind: k.Module, insertText: "math.h", detail: "数学函数" },
    { label: "ctype.h", kind: k.Module, insertText: "ctype.h", detail: "字符分类" },
    { label: "stdbool.h", kind: k.Module, insertText: "stdbool.h", detail: "布尔类型" },
    { label: "limits.h", kind: k.Module, insertText: "limits.h", detail: "整型限制" },
    { label: "float.h", kind: k.Module, insertText: "float.h", detail: "浮点限制" },
  ];
}

// ─── C++ 头文件 ───
function cppIncludes(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "iostream", kind: k.Module, insertText: "iostream", detail: "输入输出流" },
    { label: "vector", kind: k.Module, insertText: "vector", detail: "动态数组" },
    { label: "map", kind: k.Module, insertText: "map", detail: "有序映射" },
    { label: "set", kind: k.Module, insertText: "set", detail: "有序集合" },
    { label: "unordered_map", kind: k.Module, insertText: "unordered_map", detail: "哈希映射" },
    { label: "unordered_set", kind: k.Module, insertText: "unordered_set", detail: "哈希集合" },
    { label: "algorithm", kind: k.Module, insertText: "algorithm", detail: "算法库" },
    { label: "string", kind: k.Module, insertText: "string", detail: "字符串" },
    { label: "stack", kind: k.Module, insertText: "stack", detail: "栈" },
    { label: "queue", kind: k.Module, insertText: "queue", detail: "队列/优先队列" },
    { label: "deque", kind: k.Module, insertText: "deque", detail: "双端队列" },
    { label: "bitset", kind: k.Module, insertText: "bitset", detail: "位集" },
    { label: "array", kind: k.Module, insertText: "array", detail: "固定大小数组" },
    { label: "tuple", kind: k.Module, insertText: "tuple", detail: "多元组" },
    { label: "utility", kind: k.Module, insertText: "utility", detail: "pair/move/swap" },
    { label: "functional", kind: k.Module, insertText: "functional", detail: "函数对象/greater" },
    { label: "numeric", kind: k.Module, insertText: "numeric", detail: "accumulate/iota" },
    { label: "cmath", kind: k.Module, insertText: "cmath", detail: "数学函数(C++)" },
    { label: "cstring", kind: k.Module, insertText: "cstring", detail: "C字符串(C++)" },
    { label: "climits", kind: k.Module, insertText: "climits", detail: "整型限制(C++)" },
    { label: "cstdio", kind: k.Module, insertText: "cstdio", detail: "C输入输出(C++)" },
    { label: "sstream", kind: k.Module, insertText: "sstream", detail: "字符串流" },
    { label: "iomanip", kind: k.Module, insertText: "iomanip", detail: "IO格式控制" },
    { label: "cassert", kind: k.Module, insertText: "cassert", detail: "断言" },
    { label: "cctype", kind: k.Module, insertText: "cctype", detail: "字符分类(C++)" },
    { label: "cstdint", kind: k.Module, insertText: "cstdint", detail: "int64_t等固定宽度整型(C++)" },
    { label: "random", kind: k.Module, insertText: "random", detail: "随机数(C++11)" },
    { label: "chrono", kind: k.Module, insertText: "chrono", detail: "时间库(C++11)" },
    { label: "iterator", kind: k.Module, insertText: "iterator", detail: "迭代器工具" },
    { label: "memory", kind: k.Module, insertText: "memory", detail: "智能指针" },
    { label: "type_traits", kind: k.Module, insertText: "type_traits", detail: "类型特征(C++11)" },
    { label: "regex", kind: k.Module, insertText: "regex", detail: "正则表达式(C++11)" },
    { label: "mutex", kind: k.Module, insertText: "mutex", detail: "互斥量(C++11)" },
    { label: "thread", kind: k.Module, insertText: "thread", detail: "线程(C++11)" },
    { label: "bits/stdc++.h", kind: k.Module, insertText: "bits/stdc++.h", detail: "万能头文件（包含所有标准库）" },
  ];
}

// ─── 常用类型和宏 ───
function cppTypes(m: Monaco): Item[] {
  const k = K(m);
  return [
    { label: "long long", kind: k.Keyword, insertText: "long long", detail: "64位整数" },
    { label: "unsigned", kind: k.Keyword, insertText: "unsigned", detail: "无符号修饰" },
    { label: "auto", kind: k.Keyword, insertText: "auto", detail: "自动类型推导" },
    { label: "const", kind: k.Keyword, insertText: "const", detail: "常量修饰" },
    { label: "constexpr", kind: k.Keyword, insertText: "constexpr", detail: "编译期常量(C++11)" },
    { label: "decltype", kind: k.Keyword, insertText: "decltype(${1:expr})", detail: "decltype(C++11)", doc: "获取表达式类型" },
    { label: "sizeof", kind: k.Keyword, insertText: "sizeof(${1:type})", detail: "size_t sizeof(type)", doc: "获取类型大小" },
    { label: "static", kind: k.Keyword, insertText: "static", detail: "静态修饰" },
    { label: "inline", kind: k.Keyword, insertText: "inline", detail: "内联修饰" },
    { label: "extern", kind: k.Keyword, insertText: "extern", detail: "外部链接修饰" },
    { label: "virtual", kind: k.Keyword, insertText: "virtual", detail: "虚函数修饰" },
    { label: "override", kind: k.Keyword, insertText: "override", detail: "重写修饰(C++11)" },
    { label: "typename", kind: k.Keyword, insertText: "typename", detail: "类型名" },
    { label: "explicit", kind: k.Keyword, insertText: "explicit", detail: "禁止隐式转换" },
    { label: "noexcept", kind: k.Keyword, insertText: "noexcept", detail: "不抛异常(C++11)" },
    { label: "nullptr", kind: k.Keyword, insertText: "nullptr", detail: "空指针(C++11)" },
    { label: "static_cast", kind: k.Keyword, insertText: "static_cast<${1:type}>(${2:expr})", detail: "static_cast<type>(expr)", doc: "静态类型转换" },
    { label: "dynamic_cast", kind: k.Keyword, insertText: "dynamic_cast<${1:type}>(${2:expr})", detail: "dynamic_cast<type>(expr)", doc: "动态类型转换" },
    { label: "reinterpret_cast", kind: k.Keyword, insertText: "reinterpret_cast<${1:type}>(${2:expr})", detail: "reinterpret_cast<type>(expr)", doc: "重解释类型转换" },
    { label: "const_cast", kind: k.Keyword, insertText: "const_cast<${1:type}>(${2:expr})", detail: "const_cast<type>(expr)", doc: "去除const修饰" },
    { label: "INT_MAX", kind: k.Variable, insertText: "INT_MAX", detail: "2147483647", doc: "int最大值" },
    { label: "INT_MIN", kind: k.Variable, insertText: "INT_MIN", detail: "-2147483648", doc: "int最小值" },
    { label: "LLONG_MAX", kind: k.Variable, insertText: "LLONG_MAX", detail: "9223372036854775807", doc: "long long最大值" },
    { label: "LLONG_MIN", kind: k.Variable, insertText: "LLONG_MIN", detail: "-9223372036854775808", doc: "long long最小值" },
    { label: "INF", kind: k.Variable, insertText: "0x3f3f3f3f", detail: "1061109567", doc: "常用无穷大" },
    { label: "PI", kind: k.Variable, insertText: "acos(-1.0)", detail: "3.14159265358979...", doc: "π" },
    { label: "size_t", kind: k.Class, insertText: "size_t", detail: "unsigned size type", doc: "无符号大小类型" },
    { label: "int64_t", kind: k.Class, insertText: "int64_t", detail: "<cstdint> 64位有符号整数", doc: "64位整数(C++11)" },
    { label: "uint64_t", kind: k.Class, insertText: "uint64_t", detail: "<cstdint> 64位无符号整数", doc: "64位无符号整数(C++11)" },
    { label: "int32_t", kind: k.Class, insertText: "int32_t", detail: "<cstdint> 32位有符号整数", doc: "32位整数(C++11)" },
    { label: "greater", kind: k.Class, insertText: "greater<${1:int}>()", detail: "greater<T>()", doc: "大于比较器（用于降序排序/小根堆）" },
    { label: "less", kind: k.Class, insertText: "less<${1:int}>()", detail: "less<T>()", doc: "小于比较器（默认）" },
    { label: "make_pair", kind: k.Function, insertText: "make_pair(${1:a}, ${2:b})", detail: "pair<A,B> make_pair(A a, B b)", doc: "构造pair" },
  ];
}

// ─── 从代码中提取上下文（变量名、函数名等） ───
export function extractCppContext(code: string, monaco: Monaco): Item[] {
  const k = K(monaco);
  const items: Item[] = [];
  const seen = new Set<string>();

  // 提取 #include
  const includeRe = /#include\s*<(\w+)>/g;
  let m: RegExpExecArray | null;
  while ((m = includeRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Module, insertText: name, detail: `<${name}>`, sortText: "9" });
    }
  }

  // 提取变量声明: type name (= value)?
  const varRe = /\b(?:int|long|long\s+long|double|float|char|bool|string|auto|unsigned\s+int|unsigned\s+long\s+long|vector<[^>]*>|map<[^>]*>|set<[^>]*>|pair<[^>]*>|queue<[^>]*>|stack<[^>]*>|deque<[^>]*>|priority_queue<[^>]*>|array<[^>]*>|bitset<[^>]*>)\s+(\w+)/g;
  while ((m = varRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name) && name !== "main" && name.length > 1) {
      seen.add(name);
      items.push({ label: name, kind: k.Variable, insertText: name, detail: m[0].trim(), sortText: "8" });
    }
  }

  // 提取函数定义
  const fnRe = /\b(?:void|int|long|long\s+long|double|float|char|bool|string|auto|bool)\s+(\w+)\s*\(/g;
  while ((m = fnRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name) && name !== "main" && name !== "if" && name !== "while" && name !== "for" && name !== "switch" && name !== "return") {
      seen.add(name);
      items.push({ label: name, kind: k.Function, insertText: `${name}($0)`, detail: `function ${name}`, sortText: "7" });
    }
  }

  // 提取 struct/class 名
  const structRe = /\b(?:struct|class)\s+(\w+)/g;
  while ((m = structRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Class, insertText: name, detail: `struct/class ${name}`, sortText: "6" });
    }
  }

  // 提取 typedef / using 别名
  const typedefRe = /\b(?:typedef|using)\s+\w+\s+(\w+)/g;
  while ((m = typedefRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Class, insertText: name, detail: `typedef ${name}`, sortText: "6" });
    }
  }

  // 提取 #define 宏
  const defineRe = /#define\s+(\w+)/g;
  while ((m = defineRe.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ label: name, kind: k.Constant, insertText: name, detail: `#define ${name}`, sortText: "6" });
    }
  }

  return items;
}

// ─── 汇总所有 C++ 补全项 ───
// 默认上下文（非 #include、非点号）：不含头文件名和方法，避免与容器/算法重复
export function getCppCompletions(m: Monaco): Item[] {
  return [
    ...stlContainers(m),
    ...stlAlgorithms(m),
    ...cFunctions(m),
    ...cppIO(m),
    ...cppSnippets(m),
    ...cppTypes(m),
  ];
}

/** #include < 上下文：只返回头文件名 */
export function getCppIncludeCompletions(m: Monaco): Item[] {
  return [...cIncludes(m), ...cppIncludes(m)];
}

/** 点号上下文：只返回方法/属性 */
export function getCppMethodCompletions(m: Monaco): Item[] {
  return stlMethods(m);
}

// ─── C 语言补全（C++ 的子集 + C 特有） ───
export function getCCompletions(m: Monaco): Item[] {
  return [
    ...cFunctions(m),
    ...cppSnippets(m).filter(
      (s) => !["foreach", "lambda", "template_fn", "fastio", "typedef ll", "typedef pii", "typedef vi", "typedef vvi", "oj_template", "dsu", "dfs", "bfs"].includes(s.label)
    ),
    ...cppTypes(m).filter((t) => !["auto", "nullptr", "make_pair", "constexpr", "decltype", "virtual", "override", "typename", "explicit", "noexcept", "static_cast", "dynamic_cast", "reinterpret_cast", "const_cast", "int64_t", "uint64_t", "int32_t", "greater", "less"].includes(t.label)),
  ];
}

/** C 语言 #include < 上下文 */
export function getCIncludeCompletions(m: Monaco): Item[] {
  return cIncludes(m);
}
