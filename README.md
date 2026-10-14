# VyaparKhata — Digital Business Management & Bahi-Khata PWA

VyaparKhata is a production-grade Progressive Web App (PWA) for Indian merchants and small businesses (MSMEs). It delivers digital customer & supplier ledger bookkeeping (Udhar / Jama), GST compliant tax invoicing, product inventory tracking, business expenses, automated WhatsApp payment reminders, and financial reports.

---

## 🚀 Presentation Quick Guide (For Tomorrow's Demo)

To give an immediate, impressive presentation with realistic data:
1. Open the app in your browser or install it to your home screen.
2. In the welcome onboarding screen or inside the Business dropdown at the top bar, click:
   **"Launch Presentation Demo Store (1-Click)"**
3. It will instantly seed **Sharma Kirana & General Store** into real Cloud Firestore with:
   - **4 Customers** (Ramesh Patel, Priya Sharma / Verma Sweets, Amit Kumar Tailors, Sunita Devi) with running Udhar dues & advance credits.
   - **2 Wholesale Suppliers** (Hindustan Unilever Distributor, Rajdhani Flour & Grain Mills).
   - **Real Ledger Transactions** (You Gave ₹ / You Got ₹) with live balance recalculations.
   - **GST Tax Invoice** (`INV-2026-001`) with itemized taxes, CGST/SGST breakdown, and print/PDF view.
   - **Product Inventory** with real-time stock levels, low-stock warnings, and quick (+1 / -1 / +10) stock adjustments.
   - **Operating Expenses** (Electricity Bill, Shop Boy Wages, Tea & Refreshments).
   - **1-Click WhatsApp Payment Reminder** buttons with custom templates pre-filling customer name, due balance, and merchant UPI ID.
   - **Business Visiting Card** with payment QR code.

---

## 🛠️ Technology Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with mobile-first responsive design, dark mode, and `@media print` styling for A4 invoices
- **Database & Persistence**: Real Cloud Firestore database (`ai-studio-df66e573-250a-400c-9552-e5e863ee9a33` on GCP `video-505511`)
- **Authentication**: Firebase Authentication with Google Sign-In and local presentation demo session
- **Security**: Hardened Firestore security rules with Attribute-Based Access Control (ABAC), tenant isolation, and strict document validations
- **PWA Capabilities**: `vite-plugin-pwa` with Workbox caching, Web App Manifest (`display: standalone`), original 192px/512px icons, offline detection fallback, and in-app install prompt

---

## 📱 Installation Instructions

### Android & Desktop (Chrome / Edge / Brave):
- Click the green **"Install App"** button in the top navigation bar, or select **Install VyaparKhata** from browser menu.
- The app installs to your home screen or desktop application drawer and runs full-screen without address bar.

### iPhone & iPad (iOS Safari):
- Open the app in Safari.
- Click **"Add to iPhone"** in the top navigation or tap the **Share** button (box with upward arrow) in Safari.
- Scroll down and tap **"Add to Home Screen"**.
- Tap **Add** in the top-right corner.

---

## 💼 Core Features

1. **Digital Customer Ledger (Udhar / Jama)**:
   - You Gave (Debit / Credit sale) and You Got (Payment received) entries.
   - Exact running balance recalculation after each entry.
   - 1-Click WhatsApp reminder links (`https://wa.me/...`) with customizable payment templates.
   - Detailed customer statements with CSV download.

2. **Supplier Accounts & Payables**:
   - Track money owed to distributors and wholesalers.
   - Record purchases and outgoing supplier payments.

3. **GST Tax Invoices & Billing**:
   - Create multi-item invoices with custom HSN/SAC, rates, discounts, and GST rates (0%, 5%, 12%, 18%, 28%).
   - Auto-calculate CGST, SGST, IGST, subtotal, and net balance due.
   - Built-in print preview optimized for A4 paper and PDF export.

4. **Product Inventory & Stock Management**:
   - Track items, selling prices, cost prices, and current stock.
   - Instant Stock In (+1 / +10) and Stock Out (-1) buttons.
   - Automated low-stock alerts.

5. **Expenses & Shop Cash Flow**:
   - Categorized expenditure tracking (Rent, Wages, Tea, Electricity, Logistics).
   - Real-time monthly and daily expense totals.

6. **Financial Reports & Daybook**:
   - Customer Outstanding aging report.
   - Supplier Payables statement.
   - Estimated Profit & Loss (Revenue - COGS - Expenses).
   - Daybook cash inflow vs outflow.
   - 1-Click CSV export for accounting.

7. **Multi-Business Support**:
   - Switch between multiple stores/businesses seamlessly.
   - Digital merchant visiting card with UPI QR code.

8. **SaaS Platform Admin Console**:
   - Live database latency and connection test.
   - Real-time tenant and collection counts.
