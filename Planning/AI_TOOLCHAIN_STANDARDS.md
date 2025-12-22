# AI 工具鏈標準規範 (AI Toolchain Standards)

> **最後更新**：2025-12-22  
> **版本**：1.0 (AI Pro 統一版)

本文件定義了「曜亞 x 默默」專案所有 AI 工具的**版本標準**，確保全專案使用最新、最強的 AI 模型。

---

## 🤖 核心 AI 模型

| 用途 | 工具 | **指定版本** | 執行方式 |
|:---|:---|:---|:---|
| **文案生成** | Gemini | **Gemini 3 Pro** | Workspace Studio Agent |
| **程式碼生成/重構** | Jules | **Gemini 3 Pro** | GitHub 整合 |
| **即時開發/規劃** | Antigravity | **最新版本** | VS Code Extension |

---

## 🎨 視覺生成 AI

| 用途 | 工具 | **指定版本** | 備註 |
|:---|:---|:---|:---|
| **靜態圖片** | Nano Banana | **最新版本** | AI Pro 訂閱包含 |
| **短影音/動態** | Google Veo | **Veo 3** | AI Pro 訂閱包含 |
| **圖片編輯** | Imagen | **Imagen 3** | AI Pro 訂閱包含 |

---

## 🔍 研究與情報 AI

| 用途 | 工具 | **指定版本** | 備註 |
|:---|:---|:---|:---|
| **市場趨勢搜尋** | Perplexity | **Perplexity Pro** | 獨立訂閱 |
| **深度調研** | Deep Research | **AI Pro 內建** | Gemini 3 Deep Research |

---

## ⛔ 禁止使用的舊版本

以下版本已被淘汰，**不得**在專案中使用：

- ❌ Gemini 1.5 Pro
- ❌ Gemini 2.0 Pro / Flash
- ❌ Gemini 2.5 Pro
- ❌ 任何需要 API Key 的本地腳本生成
- ❌ OpenAI API (GPT 系列)

---

## ✅ 合規檢查清單

使用此清單確保所有文件都符合標準：

- [ ] 所有文案由 Workspace Studio Agent (Gemini 3 Pro) 生成
- [ ] 所有圖片提示詞標註使用 Nano Banana (最新版)
- [ ] 所有影片提示詞標註使用 Google Veo 3
- [ ] 所有趨勢研究使用 Perplexity Pro
- [ ] 程式碼重構任務指派給 Jules (Gemini 3 Pro)
- [ ] 不存在任何 API Key 呼叫的本地腳本
