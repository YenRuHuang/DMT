# Google Service Account 設定教學

這份教學將引導您完成 Google Service Account 的設定，讓 `mursfoto-api-gateway` 能夠自動同步資料到 Google Sheets。

---

## 步驟 1：前往 Google Cloud Console

1.  打開瀏覽器，前往 [Google Cloud Console](https://console.cloud.google.com/)
2.  使用您的 Google 帳號登入

---

## 步驟 2：建立新專案（或選擇現有專案）

1.  點擊頂部導覽列的 **專案選擇器**（Project Selector）
2.  點擊 **「新增專案」（New Project）**
3.  輸入專案名稱，例如：`Mursfoto Social Media Sync`
4.  點擊 **「建立」（Create）**

---

## 步驟 3：啟用 Google Sheets API

1.  在左側選單中，點擊 **「API 和服務」 > 「資料庫」（Library）**
2.  搜尋 `Google Sheets API`
3.  點擊進入後，按下 **「啟用」（Enable）**

---

## 步驟 4：建立 Service Account

1.  在左側選單中，點擊 **「API 和服務」 > 「憑證」（Credentials）**
2.  點擊頂部的 **「+ 建立憑證」（Create Credentials）**
3.  選擇 **「服務帳戶」（Service Account）**
4.  填寫資訊：
    *   **服務帳戶名稱**：`mursfoto-sheets-sync`
    *   **服務帳戶 ID**：會自動生成，例如 `mursfoto-sheets-sync@your-project.iam.gserviceaccount.com`
    *   **描述**：`用於同步社群經營進度表到 Google Sheets`
5.  點擊 **「建立並繼續」（Create and Continue）**
6.  **角色選擇**：選擇 **「編輯者」（Editor）** 或 **「擁有者」（Owner）**
7.  點擊 **「繼續」** 然後 **「完成」**

---

## 步驟 5：下載金鑰檔案

1.  在 **「憑證」** 頁面，找到您剛剛建立的服務帳戶
2.  點擊服務帳戶的 Email（例如 `mursfoto-sheets-sync@...`）
3.  切換到 **「金鑰」（Keys）** 分頁
4.  點擊 **「新增金鑰」（Add Key）** > **「建立新金鑰」（Create New Key）**
5.  選擇 **JSON** 格式
6.  點擊 **「建立」（Create）**
7.  金鑰檔案會自動下載到您的電腦，檔名類似 `your-project-xxxxx.json`

> **重要**：這個 JSON 檔案包含敏感資訊，請妥善保管，不要上傳到公開的 Git Repository！

---

## 步驟 6：共用 Google Sheet 給 Service Account

1.  打開您想要同步的 Google Sheet（或建立一個新的）
2.  點擊右上角的 **「共用」（Share）** 按鈕
3.  在 **「新增使用者和群組」** 欄位中，貼上您的服務帳戶 Email：
    ```
    mursfoto-sheets-sync@your-project.iam.gserviceaccount.com
    ```
4.  權限設定為 **「編輯者」（Editor）**
5.  **取消勾選** 「通知使用者」（因為這是機器人帳號）
6.  點擊 **「共用」**

---

## 步驟 7：將金鑰檔案提供給我

請將下載的 JSON 金鑰檔案放到以下位置：

```
/Users/murs/Documents/曜亞X默默的社群經營/google-credentials.json
```

或者，您可以直接告訴我檔案的路徑，我會幫您設定。

---

## 步驟 8：提供 Google Sheet ID

請提供您想要同步的 Google Sheet 的 **Sheet ID**。

**如何取得 Sheet ID？**
從 Google Sheet 的網址中複製：
```
https://docs.google.com/spreadsheets/d/【這一段就是 Sheet ID】/edit
```

例如：
```
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit
```
Sheet ID 就是：`1A2B3C4D5E6F7G8H9I0J`

---

## 完成後告訴我

當您完成以上步驟後，請告訴我：
1.  金鑰檔案的路徑（例如：`/Users/murs/Documents/曜亞X默默的社群經營/google-credentials.json`）
2.  Google Sheet 的 ID

我就能開始幫您改裝 `mursfoto-api-gateway`，實現自動同步功能！
