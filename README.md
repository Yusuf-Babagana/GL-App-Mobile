# GL-App Mobile

A comprehensive mobile application built with **Expo** and **React Native**, designed to provide a seamless user experience for both buyers and sellers.

## 🚀 Technologies & Tools

- **Core**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [NativeWind (Tailwind CSS)](https://www.nativewind.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Form Management**: React Hook Form (implied pattern)
- **Utilities**: Axios, Expo Image, Expo Secure Store

## 📂 Project Structure

```text
mobile/
├── app/                  # Application Routes (Expo Router)
│   ├── (auth)/           # Authentication screens (Login, Signup)
│   ├── (profile)/        # User profile related screens
│   ├── (tabs)/           # Main bottom tab navigator (Home, Search, Cart, etc.)
│   ├── product/          # Product details screens
│   ├── seller/           # Seller specific screens (Dashboard, Add Product)
│   └── _layout.tsx       # Root layout configuration
├── components/           # Reusable UI components
│   ├── ui/               # Generic UI elements (if any)
│   ├── AddressCard.tsx
│   ├── AddressFormModal.tsx
│   ├── ProductsGrid.tsx
│   └── ...
├── context/              # React Contexts
│   └── AuthContext.tsx   # Authentication state management
├── hooks/                # Custom React Hooks
│   └── useDebounce.ts    # Example hook
├── lib/                  # Library configurations and helpers
│   └── axios.ts          # Axios instance setup
├── services/             # API services
│   └── auth.ts           # Auth service functions
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types (User, Product, etc.)
├── assets/               # Static assets (images, fonts)
└── ...config files       # (app.json, tailwind.config.js, tsconfig.json)
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd GL-App/mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup**:
    - Create a `.env` file in the root directory if required (refer to `.env.example` if available).
    - Configure API keys for Clerk, Stripe, etc.

### Running the App

Start the development server:

```bash
npx expo start
```

- **Run on Android**: Press `a` in the terminal (requires Android Studio/Emulator).
- **Run on iOS**: Press `i` in the terminal (requires Xcode/Simulator - macOS only).
- **Run on real device**: Scan the QR code with the **Expo Go** app.

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `npm start` | Starts the Expo development server |
| `npm run android` | Runs the app on Android emulator/device |
| `npm run ios` | Runs the app on iOS simulator/device |
| `npm run web` | Runs the app in the web browser |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run reset-project` | Resets the project to a blank state (Use with caution!) |

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
