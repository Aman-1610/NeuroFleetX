# NeuroFleetX Frontend Implementation Plan

Based on the provided guide (images), here is the plan to build the frontend.

## Tech Stack
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Premium Design)
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Modules
1.  **Authentication & Role Management**
    -   [ ] Login Page with Role Selection (Admin, Fleet Manager, Driver, Customer)
    -   [ ] Registration Page
    -   [ ] Role-based Redirects

2.  **Dashboard**
    -   [ ] Main Dashboard Layout
    -   [ ] Tiles for:
        -   Fleet Inventory & Vehicle Telemetry
        -   AI Route & Load Optimization
        -   Predictive Maintenance & Health Analytics

3.  **Profile**
    -   [ ] User Profile Page (Name, Email, Preferences, Saved Locations)

4.  **Fleet Inventory (Module 2)**
    -   [ ] Vehicle List/Cards (Available, In Use, Service, Needs Service)

5.  **Predictive Maintenance (Module 4)**
    -   [ ] Analytics Charts (Placeholder/Recharts)
    -   [ ] Alerts Section

6.  **AI Route & Load Optimization (Module 3)**
    -   [ ] Route Optimization Dashboard
    -   [ ] Route Input / Trip Planning Page
    -   [ ] Route Visualization (Map View)
    -   [ ] ETA & Alternate Route Comparison
    -   [ ] Load Optimization / Request Assignment Page

## Design System
-   **Theme**: Dark/Light mode support (defaulting to a premium dark/glassmorphism look).
-   **Colors**: Vibrant accents (Blue/Purple/Teal) on dark backgrounds.
-   **Typography**: Inter or system fonts with clean hierarchy.

## Current Status
-   Basic Vite app exists.
-   Installing dependencies (`react-router-dom`, `lucide-react`).
-   Refactoring `App.jsx` for routing.
