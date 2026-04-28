# BESS Grid Manager — Frontend

A mobile-first React interface for monitoring and interacting with a grid-scale battery energy storage fleet. Built as the frontend counterpart to the **BESS Grid Manager backend** developed by [Christian Baker](https://github.com/roadtowiganpier).

---

## Overview

This application provides:

- **Fleet dashboard** — visual overview of all 31 batteries with real-time state-of-charge, telemetry, and dispatch status
- **Battery detail view** — per-asset data including voltage, current, temperature, and command history
- **Grid signal panel** — live French grid data sourced from the RTE API (generation mix, imbalance, FCR activation)
- **Natural language interface** — ask questions about the fleet in plain text, powered by Mistral via the backend streaming endpoint
- **Touch-optimised navigation** — designed for mobile devices, fully operable without a keyboard

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (React) |
| Language | JavaScript |
| Routing | React Router |
| HTTP | Fetch API |
| Styling | TBD |

---

## Prerequisites

The backend must be running locally before starting the frontend. By default, the API is expected at:

```
http://127.0.0.1:8000
```

---

## Getting Started

```bash
# Clone the repository
git clone git@github.com:Candyfair/bess-frontend.git
cd bess-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## Environment Variables

Create a `.env` file at the project root:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## Backend API Reference

The frontend consumes the following endpoints:

| Method | Endpoint | Usage |
|---|---|---|
| `GET` | `/health` | API status check on app load |
| `GET` | `/batteries` | Full battery fleet list |
| `POST` | `/llm/ask` | Streamed natural language query |

---

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-level views
├── services/         # API call functions
└── main.jsx          # App entry point
```

---

*BESS Grid Manager Frontend · Next.js · React · JavaScript · Mobile-first*