# Institutional Dark Design System — TradeSphere AI
## High-Density Financial Interface Specification

**Document Version:** 1.0.0  
**Date:** October 31, 2026  
**Author:** Professional Trading Platform Product Designer & Frontend Architect  
**Status:** Approved Design Specification

---

## 1. Design Philosophy: Institutional Precision

TradeSphere AI's visual design is inspired by high-frequency desktop trading platforms and institutional research terminals (e.g. Bloomberg Terminal, Zerodha Kite, FactSet, Refinitiv Eikon).

### Core Principles:
1. **Zero Cognitive Fatigue:** Deep, soft-black content surfaces (`#090D12`) prevent eye strain during 8+ hour market sessions.
2. **Restrained Semantic Palette:** Color is strictly reserved for actionable signals and price direction (`#35C69A` for positive/bullish, `#EF6468` for negative/bearish, `#D8AB5E` for warnings). No decorative rainbow gradients or neon glows.
3. **Compact Information Density:** 1px hairline borders (`#25313D`), tight 4px/8px padding grids, and monospace financial numerals allow maximum market data visibility without horizontal scrolling.
4. **Prohibited Aesthetics:**
   - ❌ No purple/blue marketing gradients.
   - ❌ No glassmorphism (`backdrop-blur` with translucent whites).
   - ❌ No neon or drop-shadow glows.
   - ❌ No oversized, round consumer cards (e.g. `rounded-3xl`).
   - ❌ No decorative animations or spinning 3D elements.

---

## 2. Color System & Semantic Tokens

```
+------------------------------------------------------------------------+
| Surface Hierarchy                                                      |
|                                                                        |
|  #090D12  App Canvas / Viewport Background                             |
|  +------------------------------------------------------------------+  |
|  |  #0D131A  Navigation Sidebar & Fixed Toolbars                    |  |
|  |  +------------------------------------------------------------+  |  |
|  |  |  #111922  Primary Module Panels & Chart Containers         |  |  |
|  |  |  +------------------------------------------------------+  |  |  |
|  |  |  |  #151F29  Elevated Surfaces, Modals & Dropdowns      |  |  |  |
|  |  |  |  Border: #25313D (1px solid hairline)                |  |  |  |
|  |  |  +------------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### 2.1 Complete Token Palette

| Token Name | Hex Code | Tailwind / CSS Variable | Purpose & Semantic Application |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#090D12` | `bg-background` / `--bg-canvas` | Global application root background. |
| **Sidebar Background**| `#0D131A` | `bg-sidebar` / `--bg-sidebar` | Left navigation bar, persistent side trays. |
| **Panel Surface** | `#111922` | `bg-panel` / `--bg-panel` | Chart card surfaces, data tables, blotters, forms. |
| **Elevated Surface** | `#151F29` | `bg-elevated` / `--bg-elevated`| Dropdown menus, modal dialogs, active tab pills. |
| **Hairline Border** | `#25313D` | `border-border` / `--border-hairline` | 1px clean separators between cells, headers, panels. |
| **Primary Text** | `#E7EDF3` | `text-primary` / `--text-primary` | High-contrast body copy, titles, ticker symbols. |
| **Secondary Text** | `#8B99A8` | `text-secondary` / `--text-secondary` | Labels, timestamps, subtle headers, units (`INR`). |
| **Positive / Bullish** | `#35C69A` | `text-bullish` / `--bullish` | Upticks, positive PnL, Buy orders, green candles. |
| **Negative / Bearish** | `#EF6468` | `text-bearish` / `--bearish` | Downticks, negative PnL, Sell orders, red candles. |
| **Warning / Alert** | `#D8AB5E` | `text-warning` / `--warning` | Risk cap breach notices, tilt warnings, disclaimer badges. |
| **Action Primary** | `#2979FF` | `bg-accent` / `--accent-blue` | Primary buttons ("Submit Order", "Run Backtest"). |

---

## 3. Typography & Numerical Formatting

### 3.1 Font Families
- **Interface / Body Text:** `Inter`, `Geist Sans`, or `system-ui` (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Financial Numbers / Quantities / Ticks:** `IBM Plex Mono`, `Geist Mono`, or `ui-monospace` (`SFMono-Regular, Menlo, Monaco, Consolas, monospace`).

### 3.2 Type Scale

| Size Token | Font Size / Line Height | Tailwind Class | Application |
| :--- | :--- | :--- | :--- |
| **2xs** | `10px / 13px` | `text-[10px] leading-tight` | Micro badges, chart axis labels, DOM ladder sizes. |
| **xs** | `11px / 15px` | `text-[11px] leading-normal` | Table headers, secondary metadata, order state tags. |
| **sm** | `12px / 16px` | `text-xs leading-4` | Standard table cell data, ticket input labels, ticker symbols. |
| **base** | `13px / 18px` | `text-[13px] leading-snug` | Standard body copy, module descriptions, buttons. |
| **md** | `14px / 20px` | `text-sm leading-5` | Panel section titles, tab headers. |
| **lg** | `16px / 22px` | `text-base leading-6` | Major metric headers, equity headline balance. |
| **xl** | `20px / 26px` | `text-xl leading-7` | Main account Net Liquidation Value display. |

---

## 4. Component Design Patterns

### 4.1 Data Tables & Blotters
- **Header:** Background `#0D131A`, height 28px, uppercase 10px typography (`text-[10px] text-[#8B99A8] tracking-wider font-semibold`), 1px bottom border `#25313D`.
- **Row:** Height 32px, hover background `#151F29`, 1px bottom border `#25313D` (last row border-none).
- **Cells:** Padding `px-2 py-1.5`, aligned right for numbers, aligned left for names/tickers.
- **Financial Numerals:** Always use tabular mono font (`font-mono tracking-tight`).

### 4.2 Chart Panels (TradingView Lightweight Charts)
- **Chart Background:** `#090D12` (transparent to canvas panel).
- **Grid Lines:** Vertical & Horizontal lines `#151F29` (subtle, 1px dashed).
- **Crosshair:** `#8B99A8` (1px dotted).
- **Bullish Candle:** Body `#35C69A`, Border `#35C69A`, Wick `#35C69A`.
- **Bearish Candle:** Body `#EF6468`, Border `#EF6468`, Wick `#EF6468`.

### 4.3 Order Ticket & Action Buttons
- **Buy Action Button:** Background `#35C69A`, Text `#090D12`, Font weight 600, Hover `#2eb38a`, Active `#279d79`.
- **Sell Action Button:** Background `#EF6468`, Text `#FFFFFF`, Font weight 600, Hover `#e54f53`, Active `#d43f43`.
- **Input Fields:** Background `#0D131A`, Border 1px `#25313D`, Focus Border `#2979FF`, Text `#E7EDF3`, Font `font-mono text-xs`.
- **1% Auto-Sizer Pill:** Background `#151F29`, Border 1px `#25313D`, Text `#8B99A8`, Hover Border `#35C69A`, Hover Text `#35C69A`.

### 4.4 Status Badges & Disclaimers
- **Simulated Badge:** `bg-[#151F29] border border-[#D8AB5E]/40 text-[#D8AB5E] text-[10px] px-1.5 py-0.5 rounded font-mono font-medium`.
- **Connected / Online Indicator:** `w-1.5 h-1.5 rounded-full bg-[#35C69A] animate-pulse`.
- **Offline / Stale Indicator:** `w-1.5 h-1.5 rounded-full bg-[#EF6468]`.

---

## 5. CSS Utility Variables (`globals.css`)

```css
:root {
  --bg-canvas: #090D12;
  --bg-sidebar: #0D131A;
  --bg-panel: #111922;
  --bg-elevated: #151F29;
  --border-hairline: #25313D;
  --text-primary: #E7EDF3;
  --text-secondary: #8B99A8;
  --bullish: #35C69A;
  --bearish: #EF6468;
  --warning: #D8AB5E;
  --accent-blue: #2979FF;
}
```
