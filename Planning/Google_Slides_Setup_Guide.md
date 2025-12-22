# Google Slides API 啟用指南

## 📋 目的
啟用 Google Slides API，讓系統能自動生成和更新簡報。

---

## 🔧 啟用步驟

### 1. 前往 Google Cloud Console
打開以下連結（會自動導向正確的專案）：
```
https://console.developers.google.com/apis/api/slides.googleapis.com/overview?project=752472688435
```

### 2. 啟用 API
1. 點擊頁面上的 **「啟用」（Enable）** 按鈕
2. 等待幾秒鐘，直到顯示「API 已啟用」

### 3. 驗證啟用狀態
執行測試腳本：
```bash
cd /Users/murs/Documents/mursfoto-api-gateway-main
node Scripts/sync-slides.js
```

如果看到以下訊息，表示成功：
```
✅ 簡報已更新！
🔗 查看連結: https://docs.google.com/presentation/d/...
```

---

## 📊 啟用後的功能

### 自動同步簡報
系統將能夠：
- ✅ 讀取現有簡報結構
- ✅ 更新簡報標題
- ✅ 新增/修改投影片內容
- ✅ 插入品牌視覺圖片
- ✅ 根據策略文件自動生成投影片

### 使用方式
```bash
# 同步簡報
node scripts/sync-slides.js

# 未來：生成新月份簡報
node scripts/generate-presentation.js --month 2026-01
```

---

## 🎯 簡報自動化規劃

### 投影片結構
1. **封面** - 自動填入月份與日期
2. **專案概覽** - 從 `Project_Requirements_Strategy.md` 讀取
3. **品牌策略** - 三個品牌的核心訊息
4. **內容規劃** - 從 `2025_12_Content_Calendar.xlsx` 讀取
5. **視覺參考** - 插入 `Tone_and_Manner_Visuals.md` 的圖片
6. **執行時程** - 從進度追蹤表生成

---

## ⚠️ 注意事項

- 啟用 API 後，可能需要等待 1-2 分鐘才能生效
- 確保 Service Account 有簡報的編輯權限
- 簡報 ID: `13sQCCsWMCvYFd9ymU0V5raRY0swLERybFz2ic6CTvcA`

---

## 🔗 相關連結

- [Google Slides API 文件](https://developers.google.com/slides/api/guides/concepts)
- [您的簡報](https://docs.google.com/presentation/d/13sQCCsWMCvYFd9ymU0V5raRY0swLERybFz2ic6CTvcA/edit)
