# 🫧 AeroFit - 懷舊美學健身助理 (PWA Workout Tracker)

**AeroFit** 是一款結合了 **Windows 7 / Frutiger Aero** 視覺美學與現代全棧技術的健身計時應用程式。不僅提供直觀的重量訓練紀錄與數據分析，更針對行動裝置優化，解決了瀏覽器後台計時中斷的技術難題。

---

## ✨ 核心特色

### ⏳ 專業運動倒數系統 (MediaSession Persistence)
* **背景持續執行**：結合 **Media Session API** 與靜音音軌技術，即便切換 App 或關閉螢幕，倒數資訊仍會在手機通知列顯示，讓用戶在鎖定畫面即可掌握進度。
* **智慧警告音**：倒數最後 5 秒自動發出提示音，無縫切換運動與休息階段。
* **高度自定義**：支援設定「準備/運動/休息」時間、重量與組數，並可設定是否「跳過最後一組休息」。

### 📅 智慧訓練紀錄頁面 (Analytics & Management)
* **日曆視覺化**：透過日曆標註 💪 圖示，快速回顧訓練天數。
* **動態數據編輯**：支援對單組 (Set) 進行新增、修改、刪除，系統會自動代入下一組的組數邏輯。
* **肌肉部位分析**：內建圓餅圖分析當日訓練佔比（如：胸 20%、腿 80%），視覺化你的訓練偏好。

### 🎨 Frutiger Aero 懷舊設計
* 重現 Windows 7 經典的 **Aero Glass** 質感、磨砂玻璃效果與飽和的果凍感按鈕，打造獨一無二的 UI 體驗。

---

## 🛠️ 技術棧 (Tech Stack)

| 類別 | 使用技術 |
| :--- | :--- |
| **前端** | React 18, CSS (Frutiger Aero Styles), JavaScript (Media Session API) |
| **後端** | Python (FastAPI), JWT Authentication |
| **資料庫** | Supabase (PostgreSQL) |
| **部署環境** | Vercel (Frontend), Render (Backend), Supabase (Cloud DB) |
| **應用技術** | PWA (Progressive Web App), Audio Web API |

---

## 📂 系統流程

### 1. User Dashboard
登入後進入個人儀表板，具備兩大核心入口：
* **開始運動**：選擇部位 (1-7: 胸、腿、背、肩、二頭、三頭、核心) -> 選擇動作 -> 設定參數 -> 進入計時。
* **運動紀錄**：日曆概覽 -> 點擊日期 -> 展開動作細節 -> 編輯或新增組數。

### 2. 運動部位與動作資料集
系統預載 20 種專業訓練動作，例如：
* **胸 (ID: 1)**：槓鈴臥推、上斜啞鈴推舉、蝴蝶機夾胸。
* **腿 (ID: 2)**：深蹲、腿推、腿屈伸、硬舉。
* **背 (ID: 3)**：杠鈴划船、滑輪下拉、引體向上。
* (其餘包含肩、二三頭與核心動作...)

---

## 🚀 開發與部署

### 本地開發
1. **Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```
2. **Backend**:
   ```bash
   cd backend && pip install -r requirements.txt && fastapi dev main.py
   ```

### 部署說明 (Free Tier Stack)
* **前端**：託管於 Vercel，確保專案目錄與 `package.json` 配置正確。
* **後端**：託管於 Render，設定 Environment Variables 以連結 Supabase。
* **資料庫**：使用 Supabase 提供穩定的 PostgreSQL 服務。

---

## ⚙️ 個人化設定
在 DashboardHeader 的 User 選項中，可開啟「跳過最後一組休息」功能，滿足高強度或快速結束訓練的需求。

---

## 📜 授權
此專案僅供個人作品集參考與學習使用。
