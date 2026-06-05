# Globalink Mobile App

A modern, "Premium Fintech" styled mobile e-commerce and logistics application built with **Expo** and **React Native**. The app connects buyers and sellers with a seamless experience, featuring live backend integration, secure payments, and digital services like data/airtime purchase.

## 🚀 Key Features

### 🛒 E-Commerce & Marketplace
-   **Live Backend**: Connected to `glappbackend.pythonanywhere.com`.
-   **Premium UI**: Glassmorphic design, skeleton loaders, and haptic feedback.
-   **Store Management**:
    -   Sellers can create and manage their own stores.
    -   "Add Product" flow with Cloudinary (Image/Video) integration.
    -   **Smart Validation**: Prompts users to create a store before adding products.
-   **Product Discovery**: Optimized home screen with verified market listings.

### 💳 Finance & Wallet
-   **Digital Wallet**: Users can deposit and withdraw funds.
-   **Data/Airtime**: Purchase data plans directly from the app.
-   **Wallet Safety**: Checks balance before purchases; prompts top-up if insufficient.
-   **Transaction History**: Detailed receipts and transaction logs.

### 💬 Social & Communication
-   **Real-time Chat**: Connects buyers and sellers.
-   **Polling Optimization**: Efficient message synchronization.
-   **WhatsApp-style UI**: Familiar, user-friendly chat interface.

---

## 🛠️ Technology Stack

-   **Frontend**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [NativeWind (Tailwind CSS)](https://www.nativewind.dev/)
-   **Networking**: Axios (with JWT Interceptors)
-   **Storage**: `expo-secure-store` (for Tokens), `expo-file-system`
-   **Design**: `lucide-react-native`, `expo-linear-gradient`, `expo-haptics`

---

## 📂 Project Structure

```text
mobile/
├── app/
│   ├── (auth)/             # Authentication Flows
│   │   ├── _layout.tsx     # Provides navigation structure for auth screens
│   │   ├── index.tsx       # Landing/Onboarding screen for new users
│   │   ├── login.tsx       # User login interface 
│   │   └── register.tsx    # New user registration form
│   ├── (tabs)/             # Main Tab Bar Navigation
│   │   ├── _layout.tsx     # Bottom tab bar configuration
│   │   ├── index.tsx       # Home Screen Dashboard
│   │   ├── markets.tsx     # Market Directory & Searching
│   │   ├── live.tsx        # Live Video/Shopping Feed
│   │   ├── cart.tsx        # User Shopping Cart
│   │   └── profile.tsx     # User Menu and Settings
│   ├── chat/               # Real-time Messaging
│   │   ├── [userId].tsx    # Direct Messaging interface between two users
│   │   └── index.tsx       # Inbox showing all chat conversations
│   ├── finance/            # Advanced Digital Financial Services
│   │   └── buy-data.tsx    # UI for purchasing telecom data and airtime
│   ├── orders/             # Order Management
│   │   ├── [id].tsx        # Detailed view of a specific order
│   │   └── index.tsx       # History of all past & current user orders
│   ├── seller/             # Seller & Store Management Features
│   │   ├── add-product.tsx # Form for sellers to upload new products
│   │   ├── create-store.tsx# Onboarding screen for converting to a Seller account
│   │   ├── dashboard.tsx   # Analytics & Tools for store owners
│   │   └── edit-product/   # Managing and modifying existing products
│   └── wallet/             # Core Financial Capabilities
│       └── index.tsx       # Main wallet dashboard, balances, and withdrawals
├── components/             # Reusable UI Elements
│   ├── data/               # Utility components for data purchases
│   │   ├── DataPlanList.tsx
│   │   └── NetworkSelector.tsx
│   ├── SafeScreen.tsx      # Cross-platform SafeAreaView wrapper
│   └── WalletOnboarding.tsx# Multi-step KYC flow (BVN & PIN setup) before wallet access
├── context/                # React Context Providers
│   ├── AuthContext.tsx     # Manages user authentication state globally
│   └── WalletContext.tsx   # Stores and updates the user's live balance
├── lib/                    # Core Utilities and Helpers
│   ├── api.ts              # Axios instance configured with JWT interceptors
│   ├── cloudinary.ts       # Service methods for image/video cloud uploads
│   └── marketApi.ts        # Fully encapsulated client for interacting with the Django backend
└── assets/                 # Static images, fonts, and icons used by the app
```

---

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (LTS)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd GL-App/mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the App**:
    ```bash
    npx expo start
    ```
    -   Press `a` for Android (Emulator/Device).
    -   Press `i` for iOS (Simulator).

---

## 🔧 Configuration

### API Configuration
The app is pre-configured to use the live backend:
-   **URL**: `https://glappbackend.pythonanywhere.com/api`
-   **Media**: `https://glappbackend.pythonanywhere.com/media`

### Authentication
-   Standard JWT Authentication (Access/Refresh Tokens).
-   Tokens are securely stored in `Expo SecureStore`.

---

## 📱 Roles & Permissions

-   **User**: Can browse, buy, and chat.
-   **Seller**: Must "Create Store" (`app/seller/create-store.tsx`) before adding products.
-   **Rider**: (In Development) Delivery dashboard access.

---

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
