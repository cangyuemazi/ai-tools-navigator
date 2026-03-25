# 智能零零AI工具 — 使用说明

本文档面向非技术人员，说明如何维护和更新网站内容。

---

## 一、网站结构概述

网站数据存放在两个 JSON 文件中：

| 文件 | 路径 | 用途 |
|------|------|------|
| 分类数据 | `client/src/data/categories.json` | 定义左侧菜单的分类结构 |
| 工具数据 | `client/src/data/tools.json` | 定义右侧展示的所有AI工具 |

修改这两个文件即可更新网站内容，无需编写任何代码。

---

## 二、如何添加新工具

1. 打开 `client/src/data/tools.json` 文件。
2. 在数组末尾（最后一个 `}` 后面）添加一个新条目，格式如下：

```json
{
  "id": "my-new-tool",
  "name": "工具名称",
  "description": "工具简介，不超过100字",
  "url": "https://工具官网地址",
  "logo": "https://工具Logo图片地址",
  "categoryId": "所属父分类ID",
  "subCategoryId": "所属子分类ID（可留空字符串）",
  "tags": ["免费", "热门"],
  "views": 10000
}
```

**注意事项：**
- `id` 必须唯一，建议使用英文小写加短横线。
- `categoryId` 必须与 `categories.json` 中的某个分类 `id` 对应。
- `subCategoryId` 如果工具属于子分类，填写子分类的 `id`；否则填空字符串 `""`。
- `tags` 常用标签：`"热门"`、`"免费"`、`"付费"`、`"开源"`、`"中文"`、`"英文"`。
- `views` 为浏览量数字，可手动设置初始值。
- `logo` 可以是完整的网络图片URL。
- 每个条目之间用英文逗号 `,` 分隔。

---

## 三、如何修改现有工具

1. 打开 `client/src/data/tools.json`。
2. 找到要修改的工具（可按 `name` 搜索）。
3. 直接修改对应字段的值，保存文件即可。

---

## 四、如何删除工具

1. 打开 `client/src/data/tools.json`。
2. 找到要删除的工具条目。
3. 删除整个 `{...}` 块及其前后的逗号（注意保持 JSON 格式正确）。

---

## 五、如何管理分类

### 添加新的父分类

在 `client/src/data/categories.json` 数组中添加：

```json
{
  "id": "new-category",
  "name": "新分类名称",
  "icon": "Flame",
  "children": []
}
```

可用的图标名称（`icon` 字段）：
`Flame`、`PenTool`、`Presentation`、`Image`、`Video`、`Briefcase`、`Code`、`Palette`、`Music`、`Sparkles`、`UserCheck`、`Languages`、`GraduationCap`、`Scale`、`ShoppingCart`、`TrendingUp`、`Megaphone`、`Brain`

### 添加子分类

在父分类的 `children` 数组中添加：

```json
{
  "id": "new-sub-category",
  "name": "子分类名称",
  "parentId": "父分类的id"
}
```

### 删除分类

删除对应的分类条目。**注意：** 删除分类后，属于该分类的工具将不会在该分类下显示（但仍会在"全部工具"中显示）。

---

## 六、数据校验

网站内置了数据校验页面（`/validator`），可以帮助您检查 JSON 文件格式是否正确：

1. 访问网站的"数据校验"页面。
2. 选择校验类型（工具数据或分类数据）。
3. 上传 JSON 文件或粘贴 JSON 内容。
4. 点击"开始校验"，查看是否有格式错误。

建议每次修改数据后都进行校验，避免格式错误导致网站异常。

---

## 七、批量导入工具

如果需要批量添加工具，可以：

1. 准备一个包含多个工具的 JSON 数组。
2. 将新工具数据合并到 `tools.json` 的数组中。
3. 使用数据校验页面验证格式。

---

## 八、常见问题

**Q: 修改后网站没有更新？**
A: 如果是本地运行，保存文件后页面会自动刷新。如果部署在服务器上，需要重新部署。

**Q: 网站显示空白或报错？**
A: 很可能是 JSON 格式错误。请使用数据校验页面检查，常见问题包括：缺少逗号、多余逗号、引号不匹配等。

**Q: Logo 图片不显示？**
A: 检查 `logo` 字段的 URL 是否可以正常访问。如果图片无法加载，网站会自动显示工具名称的首字母作为替代。
