# Code Change Assistant

一个用于批量修改C++源代码的VSCode插件。该插件允许用户定义代码替换规则，并自动应用这些规则来修改指定范围内的代码。

## 功能特点

- 支持自定义代码替换规则
- 支持选择性应用规则到指定代码范围或整个文件
- 特别优化了常见C++函数替换场景（如 sprintf 到 snprintf 的转换）
- 提供友好的用户界面进行规则配置和应用

## 使用方法

1. 配置替换规则
   - 通过命令面板（Ctrl+Shift+P）运行 "Configure Code Change Rules"
   - 在设置中添加新的替换规则，包括：
     - 规则名称
     - 源函数名
     - 目标函数名

配置规则实际是在setting.json中添加，格式如下：

```json
"code-chg.rules": [
    {
    "name": "sprintf转snprintf",
    "sourceFunction": "sprintf",
    "targetFunction": "snprintf"
    }
]
```

2. 应用规则
   - 选择要修改的代码范围（可选）
   - 通过命令面板运行 "Apply Code Change Rule"
   - 从列表中选择要应用的规则

## 注意事项

- 在应用规则前请确保已保存所有更改
- 建议在应用规则前先进行代码备份
- 某些复杂的代码结构可能需要手动调整

## 许可证

MIT