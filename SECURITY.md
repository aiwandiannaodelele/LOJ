# Security Policy

## Reporting a Vulnerability

请通过以下方式私下报告安全漏洞：

- 邮箱：aiwandiannaodelele@outlook.com
- 或 GitHub 私密讨论

**请勿在公开 Issue 中报告安全漏洞。**

我们会在 48 小时内确认并回复。

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Security Features

LOJ 内置多项安全措施：

- 密码 bcrypt 哈希
- 提交冷却限制
- 登录暴力破解防护（IP + 邮箱双维度）
- SSRF 防护
- 输入校验与 XSS 防护
- 管理员权限校验

如发现漏洞，请按上述方式联系我们。
