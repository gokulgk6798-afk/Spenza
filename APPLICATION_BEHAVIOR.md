# Spenza Application Behavior

This document is the living reference for how the Spenza app works at the screen, flow, and condition level. When a screen design, workflow, validation rule, API contract, or condition changes, update this file in the same change so product behavior stays aligned with the implementation.

## Implementation Checklist

- [x] Analytics screen shows top financial insights and required visualizations.
- [x] Chat transaction edit opens a detailed popup modal and updates pending transaction data.
- [x] Profile menu opens from Home avatar and bottom navigation.
- [x] Profile Edit screen is implemented and connected to `PATCH /profile`.
- [x] Linked Accounts screen is implemented and connected to linked-account/payment-method APIs.
- [x] Currency picker is implemented and connected to `PATCH /profile/preferences`.
- [x] Theme/appearance screen is implemented and connected to `PATCH /profile/preferences`.
- [x] Help & Support screen is implemented.
- [x] Privacy Policy screen is implemented and reachable from Help & Support.
- [x] Terms of Service screen is implemented and reachable from Help & Support.
- [x] Budget screen is connected to backend budget persistence.
- [x] Backend routes, controllers, services, and models exist for profile, preferences, linked accounts, payment methods, and budgets.
- [x] Frontend API client and app context expose typed actions for profile, preferences, linked accounts, payment methods, and budgets.
- [x] Mock user mode has local fallbacks for the same flows so the app can be used without a backend session.
- [x] Verification passed with backend tests and frontend typecheck.

## Application Shell

The Expo app is wrapped in `AppProvider` and `SafeAreaProvider`.

Startup flow:

1. Show `SplashScreen` for 1.4 seconds.
2. If there is no authenticated user and the onboarding carousel has not been dismissed, show `GetStartedScreen`.
3. If there is no authenticated user after onboarding, show `AuthScreen`.
4. If a user exists in app context, show `HomeShell`.

`HomeShell` owns the main tab navigation:

- `Home` opens `DashboardScreen`.
- `Analytics` opens `InsightsScreen`.
- `Budget` opens `BudgetScreen`.
- `Profile` opens `ProfileScreen`.
- The chat entry flow is opened from the Home floating action button and renders `ChatScreen`.

On shell mount, the app loads dashboard, transactions, and insights in parallel. If the logged-in token is the mock token, mock data is used locally. Otherwise, data is fetched from the backend.

## Authentication And Onboarding

`GetStartedScreen` is a two-slide introduction. The first slide can advance with `Next` or skip directly to authentication. The second slide uses `Get Started` to continue.

`AuthScreen` uses a mock mobile onboarding flow:

- Mobile number step requires exactly 10 digits.
- OTP step requires 6 digits and accepts mock OTP `123456`.
- Name step requires at least 2 trimmed characters.
- Income step requires a numeric monthly income.
- Category step requires at least one selected spending category.
- Allocation step rejects total category allocation above 100%.
- Savings step requires a numeric monthly savings goal.
- Completion logs in with `mock@spenza.local` and `Mock@1234`.

The onboarding setup collects name, monthly income, income source, spending categories, category allocation percentages, savings goal, and optional investment preferences. These values are currently local to the onboarding UI; the mock login seeds the app with mock dashboard, transaction, and insight data.

## Dashboard Screen

`DashboardScreen` is the Home tab. It shows:

- Greeting/header actions.
- Balance card with income, spent, and balance.
- Spending progress/caption.
- Insight banner.
- Budget health rows.
- Today summary pills and quick merchant chips.
- Monthly savings card.
- Recent transaction list.

Header behavior:

- Tapping the profile avatar in the Home header opens the Profile menu.
- The notification icon is currently visual only.

Loading behavior:

- If dashboard data is loading and no dashboard data exists yet, the screen shows `Loading dashboard...`.
- Mock users receive predefined dashboard data from `AppContext`.

The dashboard currently uses mostly static presentation data plus values from context where available.

## Chat Expense And Income Flow

`ChatScreen` is used to add income and expenses through conversation.

Message flow:

1. The user types a transaction-like message and sends it.
2. `sendMessage` appends the user message to chat history.
3. The app parses the message with the backend, or with `parseMockTransaction` for the mock user.
4. On parse success, `pendingParse` is set and an assistant confirmation message is added.
5. On parse failure, `pendingParse` is cleared and an assistant error message suggests a clearer input.

Pending confirmation behavior:

- When `pendingParse` exists, the screen shows a confirmation card.
- `Yes, save it` calls `confirmPending`.
- `Edit` opens the edit transaction popup modal.

Save behavior:

- For mock users, `confirmPending` creates a local transaction and prepends it to the transaction list.
- For real users, `confirmPending` calls `POST /transactions`.
- After saving, `pendingParse` is cleared, a saved assistant message is appended, and dashboard/insights are reloaded.

### Edit Transaction Popup

The edit popup is a Figma-style bottom sheet over the chat screen. It appears when the user taps `Edit` on a pending transaction.

Editable fields:

- Transaction type: `Expense` or `Income`.
- Amount.
- Category.
- Merchant / Note.
- Date: `Today`, `Yesterday`, or `Custom`.
- Payment Method: `Cash`, `UPI`, or `Card`.

Save conditions and behavior:

- `Save Changes` requires a valid positive numeric amount.
- Saving updates the existing `pendingParse` object in app context.
- The edited amount, type, category, vendor/note, and timestamp are used when the user later taps `Yes, save it`.
- Payment method is currently UI state only. The frontend stores it on `pendingParse`, but the backend transaction schema does not persist payment method yet.
- `Cancel`, close icon, or tapping the overlay closes the modal without updating the pending transaction.

Date behavior:

- `Today` uses the current date.
- `Yesterday` uses current date minus one day.
- `Custom` displays the pending timestamp if present, otherwise the current date. A full date picker is not implemented yet.

## Analytics Screen

`InsightsScreen` is the Analytics tab. It follows the Figma analytics layout and shows a top stats strip plus stacked analytics cards.

Top stats:

- `Spent` comes from `dashboard.totalExpense`; if missing, it falls back to category totals or design sample data.
- `Saved` comes from `dashboard.balance` or `dashboard.safety.savings`; if missing, it falls back to income minus spent.
- `Invested` is derived from transactions whose category contains investment-related words. If none exist, it falls back to a conservative percentage of saved money, capped by design sample data.

Analytics sections:

- `Income vs Expense`: compares total income and total expense with horizontal bars and shows monthly surplus.
- `Spending Breakdown`: lists category-wise spending with progress bars and percentages.
- `This Week`: shows week-wise spending bars derived from transaction timestamps. If no transaction detail is available, it uses weekly insight totals or design fallback data.
- `6 Month Trend`: shows income and expense bars for the last six months. If transaction history is insufficient, it uses design fallback data.
- `Top Merchants`: groups expense transactions by vendor and shows the top three. If no merchant data exists, it uses design fallback merchants.
- `Monthly Savings Goal`: compares saved amount to a derived savings goal.

Loading behavior:

- If insights are loading and no insight data exists yet, the screen shows `Loading insights...`.

## Profile Screen

`ProfileScreen` is opened from the bottom navigation `Profile` tab or by tapping the profile avatar on the Home screen.

The Profile menu shows:

- User avatar initials.
- User display name and email from app context, with design fallback values when context is missing.
- Summary stats for total saved, expenses, and budgets.
- Grouped option rows under `Account`, `Preferences`, and `Support`.

Profile options:

- Account: `Edit Profile`, `Linked Accounts`.
- Preferences: `Notifications`, `Currency`, `Theme`.
- Support: `Help`, `Rate App`, `Logout`.

Current behavior:

- `Edit Profile` opens the dedicated Profile Edit screen.
- `Linked Accounts` opens the dedicated Linked Accounts screen.
- `Currency` opens the dedicated Currency picker screen.
- `Theme` opens the dedicated Appearance screen.
- `Help` opens the dedicated Help & Support screen.
- `Logout` calls the app context logout flow and returns the user to unauthenticated flow.
- Other option rows are menu entries only until their dedicated Figma screens are provided and implemented.

### Profile Edit Screen

`ProfileEditScreen` is opened from the Profile menu through `Account > Edit Profile`.

The screen shows:

- Back header with `Edit Profile` title.
- Editable avatar area with initials and camera badge.
- Form fields for full name, phone, email, date of birth, and gender.
- Fixed footer action for `Save Changes`.

Current behavior:

- The back button returns to the Profile menu.
- `Save Changes` requires full name and email values.
- For real authenticated users, `Save Changes` calls `PATCH /profile` and updates app context with the returned profile.
- For mock users, `Save Changes` updates mock profile/user context locally.
- The bottom navigation is hidden while this dedicated profile sub-screen is open.

### Linked Accounts Screen

`LinkedAccountsScreen` is opened from the Profile menu through `Account > Linked Accounts`.

The screen shows:

- Back header with `Linked Accounts` title.
- Connected account section with linked bank/UPI rows.
- ACTIVE status badges and Remove actions for connected rows.
- `+ Add New Account` CTA.
- Payment Methods section with a Visa card row and `Add Card` row.

Current behavior:

- The back button returns to the Profile menu.
- For real authenticated users, connected accounts and payment methods load from `GET /profile/linked-accounts`.
- `+ Add New Account` creates a placeholder bank account through `POST /profile/linked-accounts`.
- `Remove` deletes the selected linked account through `DELETE /profile/linked-accounts/:id`.
- `Add Card` creates a placeholder card through `POST /profile/payment-methods`.
- For mock users, the same actions update local mock state.
- The bottom navigation is hidden while this dedicated profile sub-screen is open.

### Currency Screen

`CurrencyScreen` is opened from the Profile menu through `Preferences > Currency`.

The screen shows:

- Back header with `Currency` title.
- Helper text for selecting the default display currency.
- Search field for filtering currency code or name.
- Popular section with INR selected by default.
- Other Currencies section with USD, GBP, EUR, SGD, AED, and JPY.

Current behavior:

- Tapping a currency updates the selected row/checkmark and saves the preference through `PATCH /profile/preferences`.
- Search filters both popular and other currency sections by code or currency name.
- Empty search results show `No currencies found`.
- The back button returns to the Profile menu.
- For mock users, currency preference updates local mock state.
- The bottom navigation is hidden while this dedicated profile sub-screen is open.

### Appearance Screen

`ThemeScreen` is opened from the Profile menu through `Preferences > Theme`.

The screen shows:

- Back header with `Appearance` title.
- Theme choices for Dark Mode, Light Mode, and Follow System.
- Accent color swatches.
- Font size choices for Small, Medium, and Large.

Current behavior:

- Dark Mode is selected by default.
- Tapping a theme option updates the active row/checkmark and saves the preference through `PATCH /profile/preferences`.
- Tapping an accent color updates the selected swatch and saves the preference through `PATCH /profile/preferences`.
- Tapping a font size chip updates the selected chip and saves the preference through `PATCH /profile/preferences`.
- The back button returns to the Profile menu.
- For mock users, theme, accent color, and font-size preferences update local mock state.
- Saved appearance preferences are stored but app-wide visual theme application is not implemented yet.
- The bottom navigation is hidden while this dedicated profile sub-screen is open.

### Help & Support Screen

`HelpSupportScreen` is opened from the Profile menu through `Support > Help`.

The screen shows:

- Back header with `Help & Support` title.
- Search field for help topics.
- Frequently asked questions with expandable answers.
- Contact Us section with `Chat with Support` and `Email Us` rows.
- Resources section with `Privacy Policy` and `Terms of Service` rows.

Current behavior:

- The first FAQ is expanded by default.
- Tapping an FAQ expands it; tapping the expanded FAQ collapses it.
- Search filters FAQ questions and answers, contact rows, and resource rows.
- Empty search results show `No help topics found`.
- `Privacy Policy` opens the dedicated Privacy Policy screen.
- `Terms of Service` opens the dedicated Terms of Service screen.
- Contact rows are local UI only because support routing and email handoff are not implemented yet.
- The back button returns to the Profile menu.
- The bottom navigation is hidden while this dedicated profile sub-screen is open.

### Privacy Policy Screen

`PrivacyPolicyScreen` is opened from the Help & Support screen through `Resources > Privacy Policy`.

The screen shows:

- Back header with `Privacy Policy` title.
- Policy overview card with the last updated date and privacy summary.
- Detailed Sections accordion list for `Data Collection`, `How We Use Your Data`, `Data Sharing`, `Cookies & Tracking`, `Your Rights`, and `Contact Us`.

Current behavior:

- `Data Collection` is expanded by default.
- Tapping a detailed section expands it; tapping the expanded section collapses it.
- The policy content is static local copy from the Figma design and implementation.
- The back button returns to Help & Support.
- The bottom navigation is hidden while this dedicated support sub-screen is open.

### Terms of Service Screen

`TermsOfServiceScreen` is opened from the Help & Support screen through `Resources > Terms of Service`.

The screen shows:

- Back header with `Terms of Service` title.
- Introduction card explaining that the terms govern access to Spenzaa financial tools and services.
- Agreement Details accordion list for `Acceptance of Terms`, `Use of the Service`, `Account Responsibilities`, `Prohibited Activities`, `Intellectual Property`, `Limitation of Liability`, `Changes to Terms`, and `Contact Us`.

Current behavior:

- `Acceptance of Terms` is expanded by default.
- Tapping an agreement section expands it; tapping the expanded section collapses it.
- The terms content is static local copy from the Figma design and implementation.
- The back button returns to Help & Support.
- The bottom navigation is hidden while this dedicated support sub-screen is open.

## Budget Screen

`BudgetScreen` manages category budget limits through app context and backend persistence.

Screen behavior:

- Shows total usage from the sum of all budget rows.
- Shows category rows with spent amount, limit, and progress bar.
- Tapping a category row opens an inline limit editor for that row.
- Saving a row requires a valid positive numeric limit and calls `PATCH /budgets/:id`.
- `Add Budget` creates a `New Budget` row with a default limit of 1000 through `POST /budgets`.

Current persistence:

- For real authenticated users, `GET /budgets` loads persisted budget rows. Default rows are seeded on first access.
- Monthly spent values are calculated from the user's current-month expense transactions by category.
- For mock users, budget changes update local mock state.

## Transactions Screen

`TransactionsScreen` lists transactions and category filters.

Filter behavior:

- Available filters are `all`, `food`, `transport`, `bills`, and `shopping`.
- Selecting a filter updates local selected state and calls `loadTransactions(category)`.
- The backend receives category filters through `GET /transactions?category=<category>`.

State behavior:

- Loading with no data shows `Loading transactions...`.
- Request errors show `Unable to load transactions`.
- Empty results show `No transactions found`.
- Rows display vendor/category, category/date metadata, and amount.

Note: this screen is present in the codebase but is not currently exposed as a main `HomeShell` tab.

## Backend-Connected Data Flows

Authentication:

- `POST /auth/login` returns user and token.

Profile and preferences:

- `GET /profile` returns public profile fields, preferences, linked accounts, and payment methods.
- `PATCH /profile` updates display name, email, phone, date of birth, and gender.
- `PATCH /profile/preferences` updates currency, theme, accent color, and font size.
- Profile update requires a full name of at least 2 characters and a valid email.
- Currency preferences must be a 3-letter code.

Linked accounts and payment methods:

- `GET /profile/linked-accounts` returns linked account and payment method rows.
- `POST /profile/linked-accounts` creates a bank or UPI account row.
- `DELETE /profile/linked-accounts/:id` removes a linked account row.
- `POST /profile/payment-methods` creates a card payment method row.

Budgets:

- `GET /budgets` returns budget rows for the user and seeds default rows on first access.
- `POST /budgets` creates a new budget row.
- `PATCH /budgets/:id` updates budget details or limit.
- Budget limits must be positive numbers.
- Budget spent values are derived from expense transactions in the current month.

Transactions:

- `POST /transactions/parse` parses free text into amount, type, category, vendor, confidence, and original text.
- `POST /transactions` creates a transaction from parsed or edited details.
- `GET /transactions` returns transactions, optionally filtered by category, type, from, and to.

Dashboard:

- `GET /dashboard` returns monthly income, expense, balance, financial safety summary, insights, and recent transactions.

Insights:

- `GET /insights` returns category breakdown, weekly comparison, and alerts.

Backend transaction persistence currently supports:

- amount
- type
- category
- vendor
- timestamp
- source
- sources
- rawText
- mergeCount

Duplicate handling:

- New transactions are checked against existing transactions with the same amount in a five-minute window around the normalized timestamp.
- If a duplicate is found, vendor/category/raw text may be filled in, sources are merged, and `mergeCount` increments instead of creating a separate record.

## Maintenance Rules

Update this document whenever any of the following changes:

- A screen is added, removed, renamed, or moved in navigation.
- A visible state, empty state, loading state, error state, modal, or CTA changes.
- Validation rules or required fields change.
- A Figma-driven screen implementation changes behavior.
- Frontend fallback logic changes.
- Backend request/response shape changes.
- Persistence behavior changes, especially for fields that are currently UI-only.

When updating implementation, prefer linking the code change and documentation change in the same pull request.
