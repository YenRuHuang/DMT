# 團隊標準作業程序 (Team SOP Guide)

本文件定義了「曜亞 x 默默」社群經營系統的核心運作制度與安全規範。

---

## 1. 職責與協作制度 (Roles & Collaboration)

本專案採用的「AI 菁英團隊」與人類（您）的協作模型遵循 **"Human-in-the-Loop" (人機協作)** 原則：

*   **Antigravity (本地代理)**：負責系統維護、架構規劃、即時腳本執行。
*   **Jules (雲端代理)**：負責異步的代碼重構、大規模文件生成、GitHub 專案維護。**使用 Gemini 3 Pro 模型**。
*   **Workspace Studio Agent (大腦)**：負責內容生成與 Google Doc 指揮中心管理。
*   **人類主理人 ( 您 )**：唯一的「決策者」。所有 AI 生成的代碼、文案、系統變動，皆必須經由您的審核（如 GitHub Merge）後方可生效。

---

## 2. 安全與隱私規範 (Security & Privacy)

### 2.1 密鑰管理 (Secret Management)
*   **絕對禁止**：嚴禁將任何 `.json` 金鑰檔案、API Keys 或密碼上傳至 GitHub。
*   **本地保護**：`.gitignore` 必須包含 `*.json` 與 `.env`。
*   **洩漏處置**：若發現金鑰上傳，須立即到 Google Cloud Console 停用該金鑰並生成新金鑰。

### 2.2 醫療合規性 (Compliance)
*   所有產出文案必須通過「合規檢查」，嚴禁使用「醫療行為」、「療效保證」等法律禁語。

---

## 3. 異常處理 SOP (Incident Response)

當系統出現問題時，請依序執行以下步驟：

### 🚨 情境 A：Google 同步失敗 (Sync Errors)
1.  **檢查權限**：確認 Google Doc/Sheet 是否仍對 Service Account (glass-tide-...) 開放編輯權限。
2.  **檢查終端機**：在本地執行 `node Scripts/sync-sheets.js`，查看噴出的具體錯誤代碼。
3.  **重設對齊**：若 Sheet 格式大亂，執行 `node Scripts/recreate-clean-sheet.js` 強制重建。

### 🚨 情境 B：AI Agent 滿載 (At Capacity)
1.  **暫時切換**：更換為 `Agent_System_Instructions_Lite.md`（輕量版指令）。
2.  **分批執行**：不要一次生成整個月，改為「生成本週貼文」。

---

## 4. GitHub 協作流 SOP (Jules Workflow)

為了確保 Jules 的工作不會弄亂專案，請遵循以下流程：
1.  **Assign Task**：在 Jules 介面分配任務。
2.  **Review PR**：到 GitHub 檢查 Jules 開發的分支與改動的行數。
3.  **Manual Test**：若改動涉及腳本，先在本地執行 `git pull` 並測試腳本是否正常。
4.  **Confirm Merge**：確認無誤後再 Merge 到 `main` 分支。

---

## 5. 定期維護清單 (Routine Maintenance)

*   **每週一**：執行 GitHub 同備 (`git push`)，備份本地最新進度。
*   **每月 25 日**：更新 `Master_Command_Center.md` 的月度主題。
*   **每季**：重新審視 AI 角色 Prompt 的成效，進行對話優化。

---

## 6. 內容產出標準 (Content Standards)

**⚠️ 這是每月的絕對產出量，不可減少：**

*   **總量控制**：
    *   🏷️ **貼文 (Posts)**：**18 篇 / 月** (確保三大品牌各 6 篇)
    *   📱 **限動 (Stories)**：**30 則 / 月** (維持每日活躍度，各品牌輪替)
    *   🎥 **短影音 (Reels)**：**6 支 / 月** (各品牌至少 2 支)
*   **品牌平衡**：嚴格遵守 Neuramis : Cooltech : LPG = 1 : 1 : 1 的曝光比例。

---

## 7. Google Sheets 同步規範 (Sync Protocols)

**所有排程同步必須遵守以下「潔癖級」標準：**

1.  **資料淨化**：
    *   ❌ 禁止 Markdown 語法 (如 `**BOLD**`) 出現在試算表中。
    *   ❌ 禁止多餘的引號 (`""` 或 `''`)。
    *   ✅ 下拉選單值必須正規化 (如 `貼文(1)` → `貼文`)，杜絕紅色警告。
2.  **排版美學**：
    *   ✅ **Row Height**：固定 32px (更緊湊，方便閱讀)。
    *   ✅ **Text Wrapping**：自動換行 + 垂直置中。
    *   ✅ **Spacer Rows**：週次分隔線必須上淺灰色背景 (#E6E6E6)。
3.  **版本控制**：
    *   每月建立新 Tab (格式：`YYYY_MM_排程`)，禁止覆蓋舊資料。
