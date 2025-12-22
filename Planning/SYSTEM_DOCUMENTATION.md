# 曜亞 x 默默的社群經營 - 系統文件

> **最後更新**：2025-12-02  
> **版本**：2.0 (B2B 轉型版)

---

## 📋 目錄

1. [專案概覽](#專案概覽)
2. [檔案結構](#檔案結構)
3. [核心文件說明](#核心文件說明)
4. [自動化腳本](#自動化腳本)
5. [品牌資訊](#品牌資訊)
6. [快速操作指令](#快速操作指令)
7. [新增品牌流程](#新增品牌流程)

---

## 專案概覽

### 目標受眾
**To B（診所/醫師/諮詢師）** - 原廠專業形象導向

### 管理品牌
1. **P電漿** - 科技藍、實驗室白、顯微鏡視角
2. **AestheFill® 艾麗斯（精靈聚雙璇）** - 柔和粉紫、泡泡微球體、夢幻感
3. **Hera 赫拉波** - 粉紫金、透明感、少女質感

### 內容策略
- ❌ 不做促銷/優惠/價格內容
- ✅ 知識型：臨床數據、原廠認證、技術原理
- ✅ 形象類：品牌質感、專業賦能、高級體驗

---

## 檔案結構

```
曜亞X默默的社群經營/
├── Planning/
│   ├── Master_Command_Center.md          # 🎯 中央指揮中心（主要操作介面）
│   ├── Project_Requirements_Strategy.md  # 📋 專案策略文件
│   ├── AI_Team_Workflow.md              # 🤖 AI 團隊工作流程
│   ├── Tone_and_Manner_Visuals.md       # 🎨 品牌視覺調性
│   ├── 2025_12_Content_Calendar.xlsx    # 📅 內容行事曆
│   ├── Post_Progress_Tracker.xlsx       # 📊 進度追蹤表
│   ├── Google_Sheets_Setup_Guide.md     # 🔧 Google API 設定教學
│   ├── AI_TOOLCHAIN_STANDARDS.md        # 🤖 AI 工具鏈版本規範 (Gemini 3 Pro)
│   └── SYSTEM_DOCUMENTATION.md          # 📖 本文件
│
└── mursfoto-api-gateway-main/scripts/
    ├── sync-sheets.js                    # 🔄 同步到 Google Sheets
    ├── format-sheets.js                  # 🎨 格式化工作表
    ├── add-status-dropdowns.js          # 📝 新增狀態下拉選單
    └── google-credentials.json          # 🔑 Google API 金鑰
```

---

## 核心文件說明

### 1. Master_Command_Center.md
**用途**：日常操作的主要介面  
**內容**：
- 快速連結到所有文件
- 本月核心戰略
- 執行動作指南（含 AI Prompt）
- 貼文進度追蹤表（Markdown 格式）
- 品牌視覺檢核

**更新頻率**：每次修改內容後自動同步到 Google Sheets

### 2. AI_Team_Workflow.md
**用途**：AI 團隊角色與工作流程  
**內容**：
- 5 大 AI 角色定義
- 各角色使用的工具（Perplexity Pro, Google Veo 3, Nano Banana）
- 月度/週度工作流程
- 執行指令範例（B2B 導向）

### 3. Project_Requirements_Strategy.md
**用途**：專案策略與需求文件  
**內容**：
- 目標受眾定義（To B）
- 核心策略（原廠高度、知識賦能、形象質感）
- 視覺風格規範
- 短影音風格定義

### 4. Tone_and_Manner_Visuals.md
**用途**：品牌視覺參考  
**內容**：
- 三個品牌的 Mood Board 圖片
- 關鍵字與視覺描述

---

### 4. 自動化腳本 (Scripts)
位置：`/Users/murs/Documents/曜亞X默默的社群經營/Scripts/`

*   `sync-sheets.js`: **同步腳本**。讀取 Markdown 表格並更新到 Google Sheets。
*   `sync-slides.js`: **簡報同步腳本**。更新 Google Slides 標題與內容。
*   `health-check.js`: **健康檢查腳本**。驗證系統連線與設定狀態。
*   `config.js`: **共享設定模組**。集中管理所有路徑與 ID。
*   `format-sheets.js`: **格式化腳本**。設定 Google Sheets 的欄寬、凍結窗格等。
*   `add-status-dropdowns.js`: **下拉選單腳本**。為狀態欄位加入下拉選單。

> **⚠️ 文案生成**：請使用 **Google Workspace Studio Agent (AI Pro)** 進行文案生成，以使用最新的 Gemini 3 Pro 模型。

---

## 自動化腳本

### 📍 位置
`/Users/murs/Documents/曜亞X默默的社群經營/Scripts/`

### 🔄 sync-sheets.js
**功能**：將 `Master_Command_Center.md` 的表格同步到 Google Sheets  
**使用時機**：每次更新本地內容後  
**執行指令**：
```bash
cd /Users/murs/Documents/曜亞X默默的社群經營
node Scripts/sync-sheets.js
```

### 🎨 format-sheets.js
**功能**：美化 Google Sheets（欄寬、顏色、標題列）  
**使用時機**：建立新工作表或重新格式化時  

### 📝 add-status-dropdowns.js
**功能**：為「狀態」和「上架狀態」欄位新增下拉選單  
**使用時機**：建立新工作表後

---

## 品牌資訊

### P電漿
- **色彩**：科技藍 (#0066CC)、實驗室白 (#FFFFFF)
- **關鍵字**：Microscopic, Clean, Scientific
- **視覺元素**：電漿光弧、細菌、顯微鏡視角
- **主打**：殺菌修復、臨床安全性

### AestheFill® 艾麗斯
- **色彩**：柔和粉紫 (#E6D5F0)、泡泡透明感
- **關鍵字**：Dreamy, Bubbles, PDLLA
- **視覺元素**：多孔性微球體、膠原蛋白增生
- **主打**：自然變美、膠原蛋白增生原理

### Hera 赫拉波
- **色彩**：粉紫金 (#D8BFD8 + #FFD700)、透明感
- **關鍵字**：Pink-Purple-Gold, Transparency, Girly Premium
- **視覺元素**：透光玻璃、流動光影、細緻金色線條
- **主打**：品牌質感、高級體驗、深層共振技術

---

## 快速操作指令

### 📝 更新內容並同步
```bash
# 1. 編輯 Master_Command_Center.md
# 2. 執行同步
cd /Users/murs/Documents/mursfoto-api-gateway-main
node Scripts/sync-sheets.js
```

### 🆕 建立新月份內容
1. 複製 `2025_12_Content_Calendar.xlsx` 並改名
2. 更新 `Master_Command_Center.md` 的月度戰略
3. 執行同步腳本

### 🔍 查看 Google Sheets
[點此開啟](https://docs.google.com/spreadsheets/d/1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8)

---

## 新增品牌流程

### 步驟 1：定義品牌資訊
在 `Project_Requirements_Strategy.md` 新增：
- 品牌名稱
- 目標受眾
- 視覺風格（色彩、關鍵字）
- 主打特色

### 步驟 2：生成 Mood Board
使用 AI 生成品牌視覺圖：
```
請為新品牌生成 Mood Board，色彩：[顏色]，關鍵字：[關鍵字]
```

### 步驟 3：更新 AI Workflow
在 `AI_Team_Workflow.md` 新增品牌相關的 Prompt 範例

### 步驟 4：更新 Master Command Center
在 `Master_Command_Center.md` 新增：
- 品牌戰略
- 視覺檢核項目
- 執行指令範例

### 步驟 5：更新 Google Sheets
執行 `sync-sheets.js` 同步所有更新

---

## 技術設定

### Google Sheets API
- **金鑰位置**：`/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json`
- **Spreadsheet ID**：`1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8`
- **工作表名稱**：`進度追蹤_乾淨版`

### 自動同步觸發條件
當您執行以下操作時，系統應自動同步：
1. 更新 `Master_Command_Center.md` 的表格內容
2. 修改貼文狀態
3. 新增或刪除貼文

---

## 維護建議

### 每週
- ✅ 更新貼文狀態
- ✅ 檢查 Google Sheets 同步狀態

### 每月
- ✅ 更新月度戰略
- ✅ 產生新的內容行事曆
- ✅ 備份所有文件

### 每季
- ✅ 檢視品牌視覺是否需要調整
- ✅ 更新 AI Workflow 的 Prompt
- ✅ 優化自動化腳本

---

**📞 需要協助？**  
直接告訴 AI：「幫我更新 [品牌] 的 [內容]」或「同步到 Google Sheets」
