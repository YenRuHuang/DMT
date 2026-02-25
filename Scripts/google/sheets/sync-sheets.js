const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 使用共享設定模組
const config = require('../../config');
const { CREDENTIALS_PATH, SPREADSHEET_ID, MARKDOWN_FILE_PATH, SHEET_NAME } = config;

async function syncSheets() {
  try {
    console.log('🚀 開始同步...');

    // 1. 讀取 Markdown 檔案
    console.log(`📖 讀取檔案: ${MARKDOWN_FILE_PATH}`);
    const content = fs.readFileSync(MARKDOWN_FILE_PATH, 'utf8');

    // 2. 解析 Markdown 表格 - 特別查找「內容排程表」
    console.log('🔍 解析表格資料...');
    // 尋找包含「週次 | 日期 | 品牌」的排程表，而非其他表格
    const tableRegex = /\|\s*週次\s*\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/;
    const match = content.match(tableRegex);

    if (!match) {
      throw new Error('找不到內容排程表！請確認 Markdown 中包含「週次 | 日期 | 品牌」表頭。');
    }

    const headerLine = '週次 |' + match[1];
    const bodyLines = match[2].trim().split('\n');

    // 處理標頭
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);

    // 處理內容
    const rows = bodyLines.map(line => {
      return line.split('|')
        .map((cell, colIndex) => {
          let text = cell.trim();
          // 移除 Markdown 粗體符號 **
          text = text.replace(/\*\*/g, '');
          // 移除前後的單引號或雙引號
          text = text.replace(/^['"](.*)['"]$/, '$1');

          // --- 資料正規化 (Data Normalization) 以符合下拉選單 ---

          // 欄位 3: 類型 (Type) - Index 3 (因為 split '|' 後第一個是空字串，所以 Index 3 對應第 4 欄)
          // 修正：split 後的陣列包含前後空值，所以 Col 1 (Week) is index 1.
          // Table: | W1 | Date | Brand | Type | Format | ...
          // Split: ["", "W1", "Date", "Brand", "Type", "Format", ...]
          // Index:  0    1      2       3       4        5

          if (colIndex === 4) { // Type
            const typeMap = {
              '生活': '生活類',
              '知識': '知識性',
              '互動': '互動型',
              '氛圍': '氛圍感',
              '炫技': 'AI/動畫',
              '技術': 'AI/動畫',
              '情境': '氛圍感',
              '形象': '行銷類'
            };
            if (typeMap[text]) {
              text = typeMap[text];
            }
          }

          // 欄位 4: 格式 (Format) - Index 5
          if (colIndex === 5) { // Format
            // 移除括號與數字，例如 "貼文(1)" -> "貼文"
            text = text.replace(/\(\d+\)/g, '').trim();
          }

          return text;
        })
        .filter((cell, index, arr) => index > 0 && index < arr.length - 1); // 移除前後空的分割
    });

    const data = [headers, ...rows];
    console.log(`📊 解析完成，共 ${rows.length} 筆資料`);

    // 2.5 準備 Sheet 名稱 (每月一個分頁)
    const TARGET_SHEET_TITLE = SHEET_NAME;

    // 3. 連接 Google Sheets API
    console.log('☁️ 連接 Google Sheets...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 3.5 檢查分頁是否存在，若不存在則建立
    console.log(`🔍 檢查分頁: ${TARGET_SHEET_TITLE}`);
    const docInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetExists = docInfo.data.sheets.some(s => s.properties.title === TARGET_SHEET_TITLE);

    if (!sheetExists) {
      console.log(`Running addSheet for ${TARGET_SHEET_TITLE}...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: { title: TARGET_SHEET_TITLE }
            }
          }]
        }
      });
      console.log(`✅ 已建立新分頁: ${TARGET_SHEET_TITLE}`);
    }

    // 4. 清空並寫入資料 (針對該月份分頁)
    console.log(`✍️ 寫入 Google Sheets (${TARGET_SHEET_TITLE})...`);

    // 先清空該分頁舊資料
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: TARGET_SHEET_TITLE,
    });

    // 寫入新資料
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TARGET_SHEET_TITLE}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values: data,
      },
    });

    console.log(`✅ 同步成功！已更新 ${response.data.updatedCells} 個儲存格。`);

    // 5. 執行自動排版美化 (Auto-Formatting)
    console.log(`✨ 正在美化表格 (${TARGET_SHEET_TITLE})...`);

    // 5.1 獲取新分頁的 sheetId
    const updatedDocInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets(properties,conditionalFormats)'
    });
    const targetSheet = updatedDocInfo.data.sheets.find(s => s.properties.title === TARGET_SHEET_TITLE);

    if (targetSheet) {
      const sheetId = targetSheet.properties.sheetId;

      // 🧹 清除舊的斑馬紋 (Banding)
      let existingBandings = [];
      if (targetSheet.bandedRanges) {
        existingBandings = targetSheet.bandedRanges.map(b => ({
          deleteBanding: { bandedRangeId: b.bandedRangeId }
        }));
      }

      const formatRequests = [
        ...existingBandings, // 先刪除舊的
        // (1) 凍結第一列
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              gridProperties: { frozenRowCount: 1 }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        },
        // (2) 設定標題列樣式 (深灰底白字、置中、粗體)
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
          }
        },
        // (3) 設定內容列樣式 (自動換行、垂直置中)
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                wrapStrategy: 'WRAP',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)'
          }
        },
        // (4) 設定舒適行高 (Fixed Row Height: 32px) - User request: slightly smaller
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'ROWS', startIndex: 1 }, // 所有內容列
            properties: { pixelSize: 32 },
            fields: 'pixelSize'
          }
        },
        // (5) 設定特定欄寬 (Column Widths)
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, // 週次
            properties: { pixelSize: 50 },
            fields: 'pixelSize'
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, // 日期
            properties: { pixelSize: 100 },
            fields: 'pixelSize'
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, // 主題 (Topic) - 加寬
            properties: { pixelSize: 500 }, // Increased from 350
            fields: 'pixelSize'
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, // 機制/切角
            properties: { pixelSize: 400 },
            fields: 'pixelSize'
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 10 }, // Status Columns (Content, Client, Upload)
            properties: { pixelSize: 120 }, // Dropdowns need space
            fields: 'pixelSize'
          }
        },
        // (6) Add Filters (Basic Filter)
        {
          setBasicFilter: {
            filter: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                startColumnIndex: 0,
                endColumnIndex: 12
              }
            }
          }
        },
        // (7) Add Dropdowns (Data Validation)
        // Brand (Col C / Index 2)
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 2, endColumnIndex: 3 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'Neuramis' }, { userEnteredValue: 'Cooltech' }, { userEnteredValue: 'LPG' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // Type (Col D / Index 3)
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '生活類' }, { userEnteredValue: '知識性' }, { userEnteredValue: '行銷類' }, { userEnteredValue: '互動型' }, { userEnteredValue: '氛圍感' }, { userEnteredValue: 'AI/動畫' }, { userEnteredValue: '賦能' }, { userEnteredValue: '硬核' }, { userEnteredValue: '比對' }, { userEnteredValue: '炫技' }, { userEnteredValue: '權威' }, { userEnteredValue: '時機' }, { userEnteredValue: '心理' }, { userEnteredValue: '價值' }, { userEnteredValue: '話題' }, { userEnteredValue: '痛點' }, { userEnteredValue: '效果' }, { userEnteredValue: '視覺' }, { userEnteredValue: '趨勢' }, { userEnteredValue: '再製' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // Format (Col E / Index 4)
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '貼文' }, { userEnteredValue: '限動' }, { userEnteredValue: '短影音' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // Content Status (Col H / Index 7) - 內容狀態
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 7, endColumnIndex: 8 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '待製作' }, { userEnteredValue: '製作中' }, { userEnteredValue: '內容完成' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // Client Status (Col I / Index 8) - 客戶審核
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 8, endColumnIndex: 9 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '待審核' }, { userEnteredValue: '修改中' }, { userEnteredValue: '客戶確認完成' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // Upload Status (Col J / Index 9) - 上架狀態
        {
          setDataValidation: {
            range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 },
            rule: {
              condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '未上架' }, { userEnteredValue: '已排程' }, { userEnteredValue: '已上架' }] },
              showCustomUi: true,
              strict: false
            }
          }
        },
        // (8) Conditional Formatting (Colors by Type/Format)
        // Note: Rules are applied in order. First match wins? actually last added is top? 
        // In API, index 0 is top priority. We use 'index: 0' for the most important rule.
        // We will add them in reverse importance order if we don't specify index, or just specify index 0 for all and Add them in reverse Importance?
        // Let's rely on append order: Last added is at bottom? No, 'index' determines it.
        // We'll standard add them.

        // Clear existing conditional formats first? The 'clear' sheet command might wipe them, 
        // but typically 'updateCells' doesn't clear rules, 'clear' range/values does not clear rules.
        // We should clear rules.


        // Strategy: Use addConditionalFormatRule.
        // Priority: Resize (High) > Format (Low). 
        // So we add Format rules first (at bottom), then Resize (at top, or after).

        // 1. 短影音 (Reel) - Pink
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="短影音"' }] },
                format: { backgroundColor: { red: 1, green: 0.9, blue: 0.9 } } // Pink
              }
            },
            index: 0
          }
        },
        // 2. 限動 (Story) - Yellow
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="限動"' }] },
                format: { backgroundColor: { red: 1, green: 0.98, blue: 0.9 } } // Pale Yellow
              }
            },
            index: 0 // Insert at Top (pushes previous down)
          }
        },
        // 3. 貼文 (Post) - Blue
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="貼文"' }] },
                format: { backgroundColor: { red: 0.9, green: 0.95, blue: 1 } } // Pale Blue
              }
            },
            index: 0
          }
        },
        // 4. 再製 (Resize) - Purple (Overall Override)
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$D2="再製"' }] }, // Col D is Type
                format: {
                  backgroundColor: { red: 0.9, green: 0.85, blue: 0.95 },
                  textFormat: { bold: true, foregroundColor: { red: 0.2, green: 0, blue: 0.4 } }
                }
              }
            },
            index: 0 // This will be #1 Priority
          }
        }
      ];

      // Clean up previous conditional formats to avoid duplication
      // We must delete from Index 0 repeatedly, or delete from End to Start.
      // To ensure safety, we'll create a separate cleanup array and check the order.
      const cleanupRequests = [];
      if (targetSheet.conditionalFormats) {
        // Strategy: Delete 'index: 0' N times. 
        // Since batch requests execute sequentially, deleting index 0 N times will clear top N rules.
        targetSheet.conditionalFormats.forEach(() => {
          cleanupRequests.push({
            deleteConditionalFormatRule: { sheetId: sheetId, index: 0 }
          });
        });
      }

      // Combine: Cleanup First, Then Add New Rules
      const finalRequests = [...cleanupRequests, ...formatRequests];

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: { requests: finalRequests }
      });
      console.log(`✨ 表格美化完成！(行高、對齊、欄寬、斑馬紋、特殊標記已設定)`);
    }

    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

syncSheets().catch(err => {
  console.error('❌ 未預期錯誤:', err.message);
  process.exit(1);
});
