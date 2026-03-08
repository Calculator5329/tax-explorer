# Total US Tax Burden Visualizer - MVP Design

## Overview

A single-page React + D3 app showing every major US tax type as a stacked bar chart by income percentile bucket. Dark theme, data-dense, chart-forward. No backend.

## Data Layer

Single `taxData.ts` file exporting a typed object.

### Income Buckets (10)

Bottom 20%, 20-40%, 40-60%, 60-80%, 80-90%, 90-95%, 95-99%, 99-99.9%, 99.9-99.99%, Top 0.01%

### Tax Layers (6 per bucket)

1. Federal income tax
2. Payroll tax (employee + employer shares)
3. State income tax
4. Property tax
5. Sales & excise tax
6. Other excise taxes (gas, alcohol, tobacco)

Each entry stores: average income for the bucket, and 6 tax rates as % of pre-tax income.

### Scope

Per-state data + national average. Initial data hardcoded from ITEP "Who Pays?" 7th edition and CBO distributional tables.

## Chart

- **Type**: D3 stacked bar chart, one bar per income bucket, equal width
- **Y-axis**: Cumulative effective tax rate (%)
- **X-axis**: Income bucket labels with average income below
- **Colors**: 6 vibrant colors on dark background (blues/teals for progressive taxes, oranges/reds for regressive)
- **Tooltip**: On hover, shows all 6 layers with rates + dollar amounts, plus total effective rate

## Controls

- **State dropdown**: Defaults to "National Average". Selecting a state swaps data with animated transition.
- **Title/subtitle**: "Total US Tax Burden by Income" with one-line explainer

## Layout

```
+------------------------------------------+
|  Title                    [State v]      |
+------------------------------------------+
|                                          |
|           Stacked Bar Chart              |
|           (full width, ~80vh)            |
|                                          |
+------------------------------------------+
|  Legend (horizontal, below chart)        |
|  Source attribution                      |
+------------------------------------------+
```

## Tech Stack

- React 19 + TypeScript (Vite)
- D3.js for chart rendering
- Custom CSS (no UI library)

## Out of Scope (MVP)

- Scenario modeling (flat tax, cap removal, wealth tax)
- State comparison / side-by-side
- Clickable US map
- Scrollytelling
- Real-time data fetching
