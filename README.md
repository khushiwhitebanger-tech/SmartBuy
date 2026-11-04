# SMART BUY — Full-Stack Fashion E-Commerce Platform

> "Your Style. Your Choice. Smart Buy."

SMART BUY is a production-ready, full-stack clothing and lifestyle e-commerce application built for the Indian market with a premium minimalist aesthetic inspired by international luxury design systems.

---

## 1. Design System & Brand Palette

- **Warm Cream (`#F7F3EE`)**: Primary page canvas background
- **Soft Beige (`#D8C7B5`)**: Secondary surfaces and structural borders
- **Sand (`#B8A18A`)**: Subtle accents
- **Jet Black (`#171715`)**: Primary text, buttons, and footer
- **Olive Green (`#30372B`)**: Collection banners and highlights
- **Pure White (`#FFFFFF`)**: Product cards and elevated modules
- **Muted Grey (`#77736D`)**: Metadata, subheadings, and secondary details

---

## 2. Key Architecture & Features

### Frontend (React 19 + TypeScript + Tailwind CSS v4)
- **Top Navigation Bar Contract**: One-line brand logo, clean text navigation links with expandable mega menus for Men, Women, and Kids, responsive mobile drawer, search trigger, customer account, wishlist counter, and shopping bag counter.
- **Hero Campaign Banner**: 16:9 editorial imagery with dual CTAs ("Shop Men" and "Shop Women").
- **Featured Categories**: 4 visual cards (Everyday Essentials, Performance Wear, Lifestyle Collection, Accessories & Footwear).
- **Shop Best Sellers**: 8-card responsive product grid with quick add, wishlist toggle, size selector, and rating.
- **Shop by Collection**: High-contrast moodboards for Minimal Essentials, Urban Streetwear, Casual Comfort, and Active Lifestyle.
- **Complete the Look**: Coordinated outfit bundle builder (T-Shirt, Chino Trousers, Leather Sneakers, and Twill Cap) with one-click "Add Complete Look" offering 23% bundle savings.
- **Brand Story & Why Choose Us**: 4 verified benefit blocks highlighting organic fabrics, transparent pricing, Razorpay encryption, and 19,000+ PIN code delivery.
- **Shop Catalogue**: Multi-filter sidebar (Category, Department, Price range slider, Size, Color swatches, Rating, In-Stock), sorting (Popularity, Price Low to High, Price High to Low, Rating, Newest), and Grid/List view toggle.
- **Dedicated Product Detail Page**: High-resolution image zoom, color & size variant selectors with live stock indicators, interactive Indian PIN code delivery checker (with city/state detection & estimated delivery dates), size guide modal with inches/cm conversion, material care accordion, and customer reviews with submission form.
- **Shopping Cart Drawer & Multi-Step Checkout**: Free-shipping progress bar (threshold ₹999), instant promo codes (`SMART10`, `WELCOME20`, `FIRSTBUY`), Indian address autofill, priority delivery toggle, and realistic Razorpay payment gateway simulation (UPI, Cards, NetBanking, COD).
- **Order Confirmation & Live Timeline Tracking**: Detailed receipt with generated Order IDs (`SB-2026-XXXX`), courier AWB tracking, itemized taxes, and printable invoice.
- **Customer Account Portal**: Live order history with status tracking, 14-day return/exchange scheduler, order cancellation workflow, and saved addresses.
- **Admin Management Console**: Key metrics (Total Sales, Orders, AOV, Low Stock Alerts), Product CRUD with real-time updates, Order fulfillment status updater (Shipped, AWB tracking assignment, Delivered), and Coupon manager.

### Backend (Node.js Express + REST API)
- Mounted with Vite middlewares in development (`server.ts` running on port 3000).
- REST API routes:
  - `GET /api/products`: Full catalog with search, filter, and sort queries
  - `POST /api/products`: Admin create product
  - `PUT /api/products/:id`: Admin update product
  - `DELETE /api/products/:id`: Admin remove product
  - `POST /api/orders`: Server-side inventory verification, coupon discount calculation, and transactional order creation
  - `PUT /api/orders/:id/status`: Admin order status update & tracking assignment
  - `POST /api/coupons/validate`: Coupon validation against order minimums
  - `POST /api/newsletter`: Newsletter club subscription
  - `GET /api/admin/stats`: KPI metrics and inventory watchlists

---

## 3. Demo Accounts & Credentials

For fast review and testing:
- **Demo Customer**:
  - Name: Rahul Sharma
  - Email: `rahul.sharma@example.com`
  - Address: Flat 402, Sunshine Heights, Bandra West, Mumbai 400050
- **Store Administrator**:
  - Email: `admin@smartbuy.in`
  - Password: `admin123`
  - Or click the **"Test Admin"** badge in the header navigation for instant 1-click role switching.

### Active Test Coupons:
- `SMART10`: 10% off on all orders above ₹999
- `WELCOME20`: 20% off on orders above ₹1,999
- `FIRSTBUY`: Flat ₹300 off on first purchase above ₹1,499
- `SMARTLOOK`: 15% off on orders above ₹2,499

---

## 4. Setup and Development Instructions

### Installation
```bash
npm install
```

### Run Full-Stack Development Server
```bash
npm run dev
```
Runs Express server on `http://localhost:3000` with hot API routing and Vite client middlewares.

### Build for Production
```bash
npm run build
```

### Type Checking & Linting
```bash
npm run lint
```
