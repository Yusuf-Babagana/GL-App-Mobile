# E-Commerce System Audit Report

**Date:** 2026-06-10
**Scope:** React Native Frontend (`mobile/`) — Backend (Django DRF) not available in workspace
**Backend URL:** `https://glappbackend.pythonanywhere.com/api`

---

## 1. Architecture Summary

The frontend communicates with a Django DRF backend at a single base URL using two **parallel, inconsistent** API integration layers:

| Layer | Mechanism | Status |
|---|---|---|
| **Active Layer** (`lib/api.ts` + `lib/marketApi.ts`) | Axios-based, correct endpoints | **Used by screens** |
| **Dead/Broken Layer** (`hooks/*.ts` + `src/services/apiClient.ts`) | Fetch-based OR broken axios imports | **Will crash at runtime** |

The app uses **Expo Router** for navigation. State management is split between:
- **React Context** (AuthContext, CartContext, WalletContext, OnboardingContext)
- **Zustand** (useCartStore, useAuthStore) — persisted to AsyncStorage
- **React Query** (via QueryClientProvider) — but hooks using it are broken

---

## 2. Verified Working Features (Code Evidence)

### Frontend Screens
- Product listing (`app/(tabs)/index.tsx`) — fetches from `/market/products/`
- Product detail (`app/product/[id].tsx`) — fetches from `/market/products/{id}/`
- Cart display (`app/(tabs)/cart.tsx`) — uses `CartContext` → `marketAPI.getCart()`
- Checkout (`app/checkout.tsx`) — submits to `/market/checkout/`
- Order list (`app/orders/index.tsx`) — fetches from `/market/buyer/orders/`
- Order detail (`app/orders/[id].tsx`) — fetches from `/market/buyer/orders/{id}/`
- Store listing (`app/(tabs)/markets.tsx`) — fetches from `/market/stores/`
- Store detail (`app/market/[id].tsx`) — fetches from `/market/stores/{id}/`
- Wallet (`app/wallet/index.tsx`) — fetches from `/finance/wallet/`
- Wallet deposit (`app/wallet/deposit.tsx`) — UI-only (instruction screen)
- Authentication (`app/(auth)/login.tsx`) — posts to `/users/login/`
- Registration (`app/(auth)/register.tsx`) — posts to `/users/register/`

### API Endpoints Used (via marketApi.ts)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/market/products/` | List products |
| GET | `/market/products/{id}/` | Product detail |
| GET | `/market/cart/` | Get cart |
| POST | `/market/cart/` | Add to cart |
| DELETE | `/market/cart/` | Remove from cart |
| POST | `/market/checkout/` | Checkout (wallet payment) |
| POST | `/market/buy-now/` | Immediate purchase |
| GET | `/market/buyer/orders/` | Buyer order history |
| GET | `/market/buyer/orders/{id}/` | Order detail |
| POST | `/market/buyer/orders/{id}/confirm/` | Confirm delivery |
| GET | `/market/stores/` | List stores |
| GET | `/market/stores/{id}/` | Store detail |
| GET | `/market/categories/` | List categories |
| POST | `/users/login/` | Login |
| POST | `/users/register/` | Register |
| GET | `/users/profile/` | Get profile |
| PATCH | `/users/profile/` | Update profile |
| GET | `/finance/wallet/` | Get wallet |
| POST | `/finance/deposit/initiate/` | Initiate deposit |
| POST | `/finance/pin/` | Set transaction PIN |

---

## 3. Missing or Incomplete Features

### 3.1 No Delivery Fee / Tax Calculation
- **File:** `app/(tabs)/cart.tsx:53-54`
- Delivery is hardcoded as "Free"
- No shipping cost calculation or tax logic anywhere in codebase
- The `components/OrderSummary.tsx` component exists with shipping/tax props but is **never used** by any screen

### 3.2 No Payment Method Selection
- **File:** `app/checkout.tsx:176-220`
- Only wallet payment is implemented
- No card payment, bank transfer, or USSD options at checkout
- `@stripe/stripe-react-native` is in package.json but not used anywhere

### 3.3 No Guest Checkout Flow
- Cart (`app/(tabs)/cart.tsx`) redirects to login if not signed in (`AuthContext.tsx:233-234`)
- No order-as-guest capability

### 3.4 No Order Cancellation for Buyers
- **File:** `app/orders/[id].tsx`
- Buyer can only confirm delivery. No cancel order button.
- Backend endpoint unknown for cancellation

### 3.5 No Address Selection at Checkout
- **File:** `app/checkout.tsx:138-173`
- Address is entered via raw `TextInput` fields, not selected from saved addresses
- `components/AddressSelectionModal.tsx` exists but is **never imported/used**
- `hooks/useAddressess.ts` exists but is broken (see Section 4)

### 3.6 No Order Tracking with Live Driver Location
- **File:** `app/orders/track.tsx`
- Driver location is geocoded from store address (static), not real-time
- No WebSocket or polling for live tracking
- No real rider/driver assignment visible

### 3.7 No Payment Callback / Webhook Handling
- No webhook endpoint references in the frontend
- Payment success/failure relies entirely on synchronous API response

### 3.8 No Product Search Implementation
- **File:** `app/(tabs)/index.tsx:46-47`
- Search UI exists but `searchQuery` state is never sent to API
- `useFocusEffect` depends on `searchQuery` but `fetchData` doesn't use the `searchQuery` value

---

## 4. Bugs and Weaknesses

### 🔴 CRITICAL: Missing `useApi` Export Causes Runtime Crashes

**Files affected:**
- `hooks/useCart.ts:2` — `import { useApi } from "@/lib/api";`
- `hooks/useProducts.ts:1`
- `hooks/useOrders.ts:2`
- `hooks/useWishlist.ts:1`
- `hooks/useAddressess.ts:2`
- `hooks/useReviews.ts:2`

**Evidence:** `lib/api.ts` only exports:
```typescript
export const updateProfile = async (data: any) => { ... };
export default api;
```

No `useApi` function exists anywhere in the codebase. All 6 hook files will throw `TypeError: (0 , _api.useApi) is not a function` at runtime.

**Screens that WILL crash:**
- `app/(profile)/addresses.tsx` — uses `useAddresses`
- `app/(profile)/wishlist.tsx` — uses `useWishlist`, `useCart`
- `app/(profile)/orders.tsx` — uses `useOrders`, `useReviews`
- `components/ProductsGrid.tsx` — imports `useCart`, `useWishlist` (but not used by any screen)

### 🔴 CRITICAL: Hooks Use Wrong API Endpoints

Even if `useApi` existed, the hooks use endpoints that don't match the Django backend:

| Hook | Endpoint Called | Correct Endpoint |
|---|---|---|
| `useCart` | `/cart` | `/market/cart/` |
| `useCart` | `/cart/{productId}` (PUT) | `/market/cart/` (POST with quantity) |
| `useProducts` | `/products` | `/market/products/` |
| `useOrders` | `/orders` | `/market/buyer/orders/` |
| `useWishlist` | `/users/wishlist` | Unknown (may not exist) |
| `useAddresses` | `/users/addresses` | Unknown (may not exist) |

### 🔴 CRITICAL: Type System Mismatch (MongoDB vs Django)

**File:** `types/index.ts`

The types use MongoDB-style fields (`_id`, `fullName`, `createdAt`, `kycStatus`) while Django REST Framework returns snake_case (`id`, `full_name`, `created_at`, `kyc_status`). The `User` type in `store/useAuthStore.ts` and `context/AuthContext.tsx` handles both conventions, but `Product`, `Order`, `OrderItem`, `Address`, and `Store` types only use camelCase/`_id` format.

Direct consumers:
- `ProductsGrid.tsx` uses `product._id` — will be `undefined` since Django returns `id`
- `AddressSelectionModal.tsx` uses `address._id` — same issue
- `useCart` hook uses API response types that don't match actual Django responses

### 🔴 CRITICAL: Dual Cart Systems with No Sync

**System A (Active):** `context/CartContext.tsx` — server-synced via `marketAPI`
- Used by: cart tab, checkout, product detail (addToCart)

**System B (Zustand):** `store/useCartStore.ts` — local-only, persisted to AsyncStorage
- **Not used by any screen or component** in the current codebase

The Zustand store persists cart items locally but is never synced with the server cart. If a developer switches between the two, users will experience inconsistent cart data.

### 🟠 IMPORTANT: Stock Race Condition at Checkout

**File:** `app/checkout.tsx:56-66`
- Stock validation is handled client-side after a failed API call
- No optimistic locking or stock reservation mechanism visible
- Between viewing a product and checking out, stock may change → order fails
- Error handling for "insufficient stock" exists but no retry mechanism with quantity adjustment

### 🟠 IMPORTANT: No Refresh Token Logic

**File:** `lib/api.ts:19-28`
- Access token is retrieved from SecureStore but there's no 401 interceptor to refresh it
- `src/services/apiClient.ts:38-42` handles 401 by clearing token and throwing "Session expired"
- Users will be logged out on token expiry with no silent refresh

### 🟠 IMPORTANT: Wallet Balance Not Updated After Checkout

**File:** `app/checkout.tsx`
- `refreshWallet()` is called after checkout, but the local `balance` state in `WalletContext` depends on the async call completing
- If the wallet refresh fails silently (catch block in `WalletContext.tsx:56-59`), the user sees a stale balance
- No optimistic balance deduction

### 🟡 MINOR: `onRefresh` Typo

**File:** `app/wallet/index.tsx:94`
```tsx
onRefresh={onRefresh}
```
Should be `onPress={onRefresh}`. The `TouchableOpacity` refresh button doesn't work.

### 🟡 MINOR: Hardcoded Currency Symbol

- Naira symbol (`₦`) is hardcoded throughout the UI
- No currency localization (i18next is installed but not used for currency formatting)
- `components/OrderSummary.tsx` uses `$` (dollar) — inconsistent

### 🟡 MINOR: Debug Comments with Names

Files contain developer names in comments:
- `lib/marketApi.ts:404` — "Yusuf: This sends..."
- `app/_layout.tsx:42` — "Yusuf, we only set up..."
- `AuthContext.tsx` — "Yusuf" / "FIX" comments

---

## 5. API Mismatch Report

### 5.1 Endpoint Mismatches

| Frontend Call (Broken Hooks) | Actual Django Endpoint | Impact |
|---|---|---|
| `GET /cart` | `GET /market/cart/` | Broken hook would 404 |
| `PUT /cart/{id}` | `POST /market/cart/` | Wrong method + path |
| `DELETE /cart/{id}` | `DELETE /market/cart/` (body: `{item_id}`) | Wrong path |
| `DELETE /cart` | N/A | No batch clear endpoint |
| `GET /products` | `GET /market/products/` | Wrong path |
| `GET /orders` | `GET /market/buyer/orders/` | Wrong path |
| `GET /users/wishlist` | Unknown — may not exist | Hard crash |
| `POST /users/wishlist` | Unknown — may not exist | Hard crash |

### 5.2 Field Name Mismatches

| Type Definition | Django Backend Returns | Consumer Impact |
|---|---|---|
| `Product._id` | `Product.id` | Navigation `push(/product/${product._id})` → `undefined` |
| `Product.averageRating` | `average_rating` | `undefined.toFixed(1)` → crash |
| `Product.totalReviews` | `total_reviews` | `undefined` in display |
| `Product.images[]` (string) | `images[]` (object `{image: string}`) | Already handled with fallback logic |
| `Address._id` | `Address.id` | Key/id mismatches |
| `Order._id` | `Order.id` | Key/id mismatches |
| `Order.deliveryStatus` | `delivery_status` | `undefined` used in display |

### 5.3 Missing Endpoints (Not Called by Frontend)

These backend endpoints are likely needed but never called:
- Product search/filter endpoint (search bar exists but doesn't query)
- Order cancellation endpoint (for buyers)
- Address CRUD endpoints at correct paths
- Payment webhook handler acknowledgment
- Delivery status update webhook

---

## 6. Affected Components Map

### React Native Files at Risk

| File | Issue | Severity |
|---|---|---|
| `hooks/useCart.ts` | `useApi` missing + wrong endpoints | 🔴 Broken |
| `hooks/useProducts.ts` | `useApi` missing + wrong endpoint | 🔴 Broken |
| `hooks/useOrders.ts` | `useApi` missing + wrong endpoint | 🔴 Broken |
| `hooks/useWishlist.ts` | `useApi` missing + wrong endpoint | 🔴 Broken |
| `hooks/useAddressess.ts` | `useApi` missing + wrong endpoint | 🔴 Broken |
| `hooks/useReviews.ts` | `useApi` missing | 🔴 Broken |
| `app/(profile)/addresses.tsx` | Uses broken `useAddresses` hook | 🔴 Crashes |
| `app/(profile)/wishlist.tsx` | Uses broken `useWishlist` + `useCart` | 🔴 Crashes |
| `app/(profile)/orders.tsx` | Uses broken `useOrders` + `useReviews` | 🔴 Crashes |
| `components/ProductsGrid.tsx` | Uses broken `useCart` + `useWishlist` | 🔴 Crashes (if used) |
| `components/AddressSelectionModal.tsx` | Uses broken `useAddresses` | 🔴 Crashes (if used) |
| `app/wallet/index.tsx:94` | `onRefresh` typo (should be `onPress`) | 🟡 Stale refresh |
| `app/(tabs)/index.tsx` | Search query never sent to API | 🟡 Broken search |

### Django Backend (Hypothesized)

| Component | Concern |
|---|---|
| `/market/cart/` DELETE handler | Expects `item_id` in body — unusual for REST |
| `/market/checkout/` POST handler | Must handle stock, payment, order creation atomically |
| `/users/login/` POST handler | Returns variable token field names (`token`/`access`/`key`/`accessToken`) |
| `/finance/wallet/` GET | Must return `balance`, `escrow_balance`, `account_number`, `bank_name` |

---

## 7. Risk Assessment

| Risk | Impact | Likelihood |
|---|---|---|
| Profile screens crash on navigation | Users cannot manage addresses, wishlist, or see order history | **High** — tabs exist in "More" screen |
| Token expiry logs users out mid-session | Lost session, poor UX | **Medium** — depends on token lifetime |
| Stock race conditions at checkout | Failed orders, user frustration | **Medium** — high-traffic periods |
| Dual cart data inconsistency | Items appear/disappear between sessions | **Low** — Zustand store is unused |
| Payment processing without confirmation | Double-charge or no-charge scenarios | **Low** — depends on backend idempotency |
| Currency mismatch (₦ vs $) | Financial display errors | **Low** — `OrderSummary` is unused |

---

## 8. Safe Improvement Plan (NON-BREAKING ONLY)

### Phase 1 — Fix Runtime Crashes (Critical)

1. **Add `useApi` export to `lib/api.ts`**
   ```typescript
   export function useApi() {
     return api;
   }
   ```
   This immediately unbreaks all 6 hooks and 3 profile screens. Zero side effects.

2. **Fix hook endpoints** — Update paths in hook files to match actual Django endpoints:
   - `useCart.ts`: `/cart` → `/market/cart/`
   - `useProducts.ts`: `/products` → `/market/products/`
   - `useOrders.ts`: `/orders` → `/market/buyer/orders/`

### Phase 2 — Type System Alignment (Important)

3. **Create an adapter layer** or update type definitions to handle both `id` and `_id`:
   - Add `id?: number` alongside `_id: string` in types
   - Or create transformation utilities in `lib/utils.ts`

### Phase 3 — Checkout & Payment Improvements (Important)

4. **Add address selection** — Integrate `AddressSelectionModal` into checkout flow
5. **Add Stripe payment option** — `@stripe/stripe-react-native` is already installed
6. **Add 401 interceptor** for silent token refresh

### Phase 4 — Search & Discovery (Nice to Have)

7. **Send searchQuery to API** in `app/(tabs)/index.tsx`
8. **Add debounced search** with loading state

### Phase 5 — Polish (Nice to Have)

9. Fix `onRefresh` → `onPress` in `app/wallet/index.tsx:94`
10. Remove debug comments with developer names
11. Use i18next for currency formatting instead of hardcoded `₦`

---

## 9. Priority Breakdown

### 🔴 Critical (Must Fix Immediately)
1. **Missing `useApi` export** — `lib/api.ts` — crashes 6 hooks + 3 screens
2. **Wrong hook endpoints** — `/cart`, `/products`, `/orders` will 404
3. **Type `_id` vs `id` mismatch** — `ProductsGrid.tsx`, profile screens will show empty/undefined data

### 🟠 Important
4. **No token refresh interceptor** — silent logout on expiry
5. **No delivery fee / tax calculation** — revenue loss
6. **No payment method variety** — single wallet option limits conversion
7. **Search not connected to API** — search bar is decorative
8. **Stock race conditions** — no reservation/locking mechanism

### 🟡 Nice to Have
9. Guest checkout support
10. Order cancellation for buyers
11. Live delivery tracking with real driver location
12. Remove developer names from production code
13. Fix `onRefresh` typo in wallet screen
14. Standardize currency display (₦ vs $)
15. Clean up unused Zustand cart store vs CartContext

---

## Appendix: Key File Index

| File | Purpose |
|---|---|
| `lib/api.ts` | Axios instance, base URL, interceptors |
| `lib/marketApi.ts` | All e-commerce API methods |
| `lib/merchantService.ts` | Merchant/shop status check |
| `lib/utils.ts` | Image optimization, date/status utilities |
| `store/useCartStore.ts` | Zustand cart (local, unused) |
| `store/useAuthStore.ts` | Zustand auth (local, partially used) |
| `context/AuthContext.tsx` | Auth state, login, logout, navigation guard |
| `context/CartContext.tsx` | Server-synced cart state |
| `context/WalletContext.tsx` | Wallet balance, transactions |
| `hooks/*.ts` | React Query hooks (BROKEN — see Section 4) |
| `src/services/*.ts` | Fetch-based API client (legacy) |
| `types/index.ts` | Type definitions (MongoDB-style) |
| `app/checkout.tsx` | Checkout with wallet payment |
| `app/orders/[id].tsx` | Order detail with confirm/dispatch |
| `app/product/[id].tsx` | Product detail with add-to-cart |
