# URL 识别测试用例

## ✅ 支持的输入格式

### 1. 标准域名（英文标点）
- `github.com` → `https://github.com`
- `google.com` → `https://google.com`
- `baidu.com` → `https://baidu.com`

### 2. 中文句号替代点
- `github。com` → `https://github.com`
- `baidu。com` → `https://baidu.com`
- `stackoverflow。com` → `https://stackoverflow.com`

### 3. 中文逗号误用
- `github，com` → `https://github.com`
- `google，com` → `https://google.com`

### 4. 完整协议（英文）
- `http://example.com` → `http://example.com`
- `https://github.com` → `https://github.com`

### 5. 中文冒号协议
- `http：//github.com` → `http://github.com`
- `https：//google.com` → `https://google.com`

### 6. 中文斜杠
- `http://github。com／test` → `http://github.com/test`
- `https：／／baidu。com` → `https://baidu.com`

### 7. 混合中英文标点
- `https：／／github。com` → `https://github.com`
- `http：／／stackoverflow，com` → `http://stackoverflow.com`

### 8. 本地开发（中英文冒号）
- `localhost:3000` → `https://localhost:3000`
- `localhost：8080` → `https://localhost:8080`

### 9. 子域名
- `www.github.com` → `https://www.github.com`
- `docs.python.org` → `https://docs.python.org`

### 10. 多级域名后缀
- `example.co.uk` → `https://example.co.uk`
- `site.com.cn` → `https://site.com.cn`

## ❌ 会被当作搜索的输入

- `hello world` → 搜索 "hello world"
- `vue.js` → 搜索 "vue.js"（不是有效域名）
- `python教程` → 搜索 "python教程"
- `how to code` → 搜索 "how to code"

## 智能纠错规则

1. **中文标点自动转英文**
   - `：` → `:`
   - `／` → `/`
   - `。` → `.`
   - `，` → `.`

2. **协议自动补全**
   - 无协议的域名自动加 `https://`
   - 修正错误的协议格式

3. **域名识别条件**
   - 包含完整的协议前缀（http/https）
   - 包含点+至少2位字母后缀（如 .com, .cn, .org）
   - localhost + 端口号格式
