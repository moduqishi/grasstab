# 配置文件测试用例

## 测试 1: 最小化配置

```yaml
version: "1.0"
createdAt: "2025-12-08T00:00:00.000Z"
settings:
  showDock: true
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
wallpaper: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
dock: []
shortcuts: []
```

**预期**: ✅ 成功导入，使用默认值

---

## 测试 2: 完整配置

参考 `config-example.yaml`

**预期**: ✅ 成功导入所有数据

---

## 测试 3: 向后兼容（旧格式）

```yaml
version: "1.0"
settings:
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
wallpaper: "https://example.com/bg.jpg"
dockItems:  # 旧字段名
  - id: 1
    title: "Test"
    url: "https://test.com"
    type: "auto"
shortcuts: []
```

**预期**: ✅ 自动转换 `dockItems` 为 `dock`

---

## 测试 4: 缺少必需字段

```yaml
version: "1.0"
settings:
  language: "zh"
wallpaper: "https://example.com/bg.jpg"
```

**预期**: ⚠️ 警告缺少字段，使用默认值补全

---

## 测试 5: 无效数据类型

```yaml
version: "1.0"
settings:
  showDock: "yes"  # 应该是布尔值
  language: 123    # 应该是字符串
wallpaper: 12345   # 应该是字符串
dock: "not an array"
shortcuts: {}
```

**预期**: ❌ 导入失败，显示类型错误

---

## 测试 6: 大尺寸小组件

```yaml
version: "1.0"
createdAt: "2025-12-08T00:00:00.000Z"
settings:
  showDock: true
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
wallpaper: "https://example.com/bg.jpg"
dock: []
shortcuts:
  - id: 1
    title: "大组件"
    url: ""
    type: "widget"
    size:
      w: 4
      h: 3
    widget:
      type: "custom"
      content: "<h1>测试</h1>"
```

**预期**: ✅ 成功导入大尺寸小组件

---

## 测试 7: Base64 图标

```yaml
version: "1.0"
createdAt: "2025-12-08T00:00:00.000Z"
settings:
  showDock: true
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
wallpaper: "https://example.com/bg.jpg"
dock:
  - id: 1
    title: "Test"
    url: "https://test.com"
    type: "auto"
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
shortcuts: []
```

**预期**: ✅ 成功导入 base64 图标

---

## 测试 8: 空文件

```yaml
```

**预期**: ❌ 导入失败，提示文件为空

---

## 测试 9: YAML 语法错误

```yaml
version: "1.0"
settings:
  showDock: true
  language: zh
    indentation error
```

**预期**: ❌ 导入失败，提示 YAML 解析错误

---

## 测试 10: 重复 ID

```yaml
version: "1.0"
createdAt: "2025-12-08T00:00:00.000Z"
settings:
  showDock: true
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
wallpaper: "https://example.com/bg.jpg"
dock: []
shortcuts:
  - id: 1
    title: "App 1"
    url: "https://test1.com"
    type: "auto"
  - id: 1  # 重复 ID
    title: "App 2"
    url: "https://test2.com"
    type: "auto"
```

**预期**: ⚠️ 两个应用都会导入（ID 不唯一时可能覆盖）

---

## 手动测试步骤

### 1. 导出测试
1. 添加多个应用和小组件
2. 修改系统设置
3. 更换壁纸
4. 导出配置
5. 检查导出的 YAML 文件格式是否正确

### 2. 导入测试
1. 备份当前配置
2. 导入测试配置文件
3. 验证所有设置是否正确应用
4. 检查应用和小组件是否正确显示
5. 恢复原始配置

### 3. 往返测试
1. 导出配置 A
2. 修改一些设置
3. 导出配置 B
4. 导入配置 A
5. 验证回到配置 A 的状态
6. 导入配置 B
7. 验证回到配置 B 的状态

### 4. 压力测试
1. 创建 100+ 应用的配置
2. 测试导出性能
3. 测试导入性能
4. 检查是否有性能问题

### 5. 兼容性测试
1. 在不同浏览器测试（Chrome, Edge, Firefox）
2. 测试移动端兼容性
3. 测试不同操作系统

## 预期结果总结

| 测试 | 预期结果 | 优先级 |
|-----|---------|--------|
| 1 - 最小化配置 | ✅ 通过 | 高 |
| 2 - 完整配置 | ✅ 通过 | 高 |
| 3 - 向后兼容 | ✅ 通过 | 高 |
| 4 - 缺少字段 | ⚠️ 警告 | 中 |
| 5 - 无效类型 | ❌ 失败 | 高 |
| 6 - 大组件 | ✅ 通过 | 中 |
| 7 - Base64 | ✅ 通过 | 中 |
| 8 - 空文件 | ❌ 失败 | 高 |
| 9 - 语法错误 | ❌ 失败 | 高 |
| 10 - 重复 ID | ⚠️ 警告 | 低 |

## 已知限制

1. 最大文件大小: 10MB
2. 支持的格式: YAML (.yaml, .yml), JSON (.json)
3. ID 唯一性不强制检查
4. 不验证 URL 有效性
5. 不验证图标 URL 可访问性

## 改进建议

- [ ] 添加 ID 唯一性检查
- [ ] 添加 URL 格式验证
- [ ] 添加图标加载预检查
- [ ] 支持批量导入多个配置
- [ ] 添加配置合并功能
- [ ] 支持导出为 JSON 格式
- [ ] 添加配置版本管理
- [ ] 支持增量更新配置
