# Spenza Product Playbook

---

# 1. Product Direction

Spenza is a chat-first financial tracking app with:

* Passive tracking through SMS and notifications
* Smart deduplication
* Financial safety engine

Primary UX goal:

> Understand your money instantly, with minimal effort.

---

# 2. Design System

The active mobile client is the Expo React Native app in `frontend/`. Use these tokens when translating Figma screens into code. Light mode tokens will be added separately.

## 2.1 Dark Theme Tokens

### Background

* `background.primary`: `#0D0D14`
* `background.secondary`: `#121212`
* `background.pure`: `#000000`

### Surface

* `surface.card`: `#1C1C2A`
* `surface.elevated`: `#262638`
* `surface.muted`: `#333333`
* `surface.overlay`: `#1A1A1A`

### Brand

* `brand.primary`: `#FF5533`

### Text

* `text.primary`: `#FFFFFF`
* `text.secondary`: `#71717A`
* `text.tertiary`: `#A1A1AA`

### Semantic

* `semantic.success`: `#10B981`
* `semantic.error`: `#EF4444`
* `semantic.warning`: `#F59E0B`

### Border

* `border.default`: `#3F3F46`

### Category Colors

* `category.food`: `#FF5F40`
* `category.transport`: `#FFA533`
* `category.entertainment`: `#FFD733`
* `category.health`: `#47B5FF`
* `category.shopping`: `#FFB344`
* `category.utilities`: `#A78BFA`
* `category.health-alt`: `#3B82F6`
* `category.utilities-alt`: `#8B5CF6`
* `category.travel`: `#06B6D4`

### Accent Tints

* `accent.blue-tint`: `#E8F1FF`
* `accent.cyan-tint`: `#E8F8FF`

## 2.2 Dark Theme Usage

* Use `background.primary` for the main app background.
* Use `surface.card` for default cards, sheets, list rows, and grouped panels.
* Use `surface.elevated` for active controls, highlighted panels, modals, and raised navigation surfaces.
* Use `surface.overlay` for scrims, overlays, and transient surfaces.
* Use `brand.primary` for primary actions, selected nav states, brand marks, and high-emphasis interactive elements.
* Use `text.primary` for headings and primary values, `text.tertiary` for readable supporting text, and `text.secondary` for captions, metadata, and disabled-looking labels.
* Use `border.default` for subtle separation on cards, inputs, bottom nav, and dividers.
* Category colors should drive charts, category chips, icon backgrounds, and spending breakdowns.
* Reserve semantic colors for status messaging: success, warning, and error states.

## 2.3 Typography

Headings:

* Strong, clean sans-serif hierarchy
* Large only on true hero or launch moments

Body:

* Sans-serif system font stack through React Native
* Prioritize readability and compact financial scanning

## 2.4 Components

### Cards

* Rounded: 16-24px
* Use dark surfaces with subtle borders
* Avoid heavy shadows on dark backgrounds; prefer elevation through surface contrast

### Buttons

* Primary: filled with `brand.primary`
* Secondary: dark surface with `border.default`
* Disabled: reduce opacity and keep labels legible

### Navigation

* Bottom nav with icons and labels
* Selected state uses `brand.primary`
* Inactive state uses `text.secondary` or `text.tertiary`

---

# 3. Screen Architecture

## 3.1 Splash Screen

* Logo centered
* Minimal animation
* Use the current theme background and brand token

## 3.2 Onboarding

* Carousel intro
* CTA: Sign In / Sign Up

## 3.3 Authentication

* Google / Apple / Email
* Minimal friction

## 3.4 Home Dashboard

Sections:

1. Financial Health Card
2. Monthly Spend
3. Insight Card
4. Recent Transactions

## 3.5 Spending Screen

* Budget progress
* Category breakdown
* Recurring payments

## 3.6 Insights Screen

* Monthly comparison
* Graphs
* Alerts

## 3.7 Chat Input

Core input:

> Spent 200 food

Flow:

Input -> Parse -> Confirm -> Save

---

# 4. System Flows

## 4.1 Chat Parsing Flow

Input -> NLP parser -> Extract:

* Amount
* Category
* Type

Then show confirmation UI.

## 4.2 Notification Flow

SMS -> Extract -> Dedup -> Store

## 4.3 Deduplication Logic

Match:

* Amount
* Time window (+/- 5 min)
* Vendor similarity

---

# 5. Financial Safety Engine

Rules:

* More than 90% income used -> Warning
* More than 100% income used -> Critical
* No savings -> Suggestion

---

# 6. Frontend to Backend Mapping

| Feature       | API                |
| ------------- | ------------------ |
| Add Expense   | POST /transactions |
| Get Dashboard | GET /dashboard     |
| Insights      | GET /insights      |
| Auth          | POST /auth         |

---

# 7. Frontend Stack

Active frontend:

* Expo React Native
* TypeScript
* React Context for current app state
* Screens live in `frontend/src/screens/`
* Shared UI lives in `frontend/src/components/`
* Theme values live in `frontend/src/constants/theme.ts`

Archived frontend:

* The former Flutter implementation lives in `frontend_flutter_legacy/`

---

# 8. UX Principles

* Zero friction entry
* Clean hierarchy
* Actionable insights
* Minimal cognitive load
* Compact, scan-friendly financial information

---

# 9. MVP Priority

1. Chat entry
2. Dashboard
3. Transactions
4. Insights
5. Deduplication
