# React Native Project Analysis: "Recurrly"

This document outlines the architecture, libraries, frameworks, and methodologies to use

## . Core Frameworks & Routing
- **React Native**: The core library for building native mobile apps using React.
- **Expo (v54)**: A framework and platform for universal React applications. It provides a managed workflow, making it easier to build, deploy, and iterate without touching native iOS/Android code directly.
- **Expo Router**: A file-based routing framework for React Native. Instead of manually configuring navigators (like with raw React Navigation), you create files in the `app/` directory (e.g., `app/(tabs)`, `app/(auth)`), and the routing is handled automatically.

## . Styling & UI
- **NativeWind (v5)**: A library that brings **Tailwind CSS** to React Native. It allows you to style your components using Tailwind utility classes directly in the `className` prop, which is a highly modern and popular approach.
- **clsx**: A tiny utility for conditionally constructing `className` strings. It's often used alongside Tailwind to toggle classes based on component state or props.
- **Expo Fonts**: Used to load custom fonts (`PlusJakartaSans`) globally, ensuring consistent typography across the app.

## . State Management
- **Zustand**: A small, fast, and scalable bearbones state management solution. 
  - **Methodology**: Instead of Redux (which can be boilerplate-heavy), the project uses Zustand in `lib/subscriptionStore.ts`. It creates a simple hook (`useSubscriptionStore`) to manage the global state of subscriptions, allowing any component to read or update the list easily.

## . Authentication
- **Clerk (`@clerk/expo`)**: A complete suite of embeddable UIs, flexible APIs, and admin dashboards to authenticate and manage your users.
  - **Methodology**: It's wrapped around the root component in `app/_layout.tsx` (`<ClerkProvider>`). It handles session management securely and provides hooks like `useAuth()` to check if a user is logged in.

## . Animations & Gestures
- **React Native Reanimated**: Provides a comprehensive, low-level abstraction for the Animated API API to be built on top of. It runs animations on the UI thread for 60fps performance.
- **React Native Gesture Handler**: Declarative API exposing platform native touch and gesture system to React Native.

## . Data Handling & Utilities
- **Day.js**: A minimalist JavaScript library that parses, validates, manipulates, and displays dates and times. Used in `lib/utils.ts` for clean date formatting.
- **Intl.NumberFormat**: A native JavaScript API used (in `lib/utils.ts`) for robust currency formatting without needing extra heavy libraries.

## Project Structure Methodology
The project follows a clean, feature-driven architecture:
- `app/`: Contains the Expo Router file-based navigation logic.
  - `(auth)`: Grouped routes requiring authentication.
  - `(tabs)`: Grouped routes for the bottom tab bar.
- `components/`: Highly reusable UI components (e.g., `SubscriptionCard`, `CreateSubscriptionModal`).
- `lib/`: Contains business logic, global state (`subscriptionStore.ts`), and helper functions (`utils.ts`). Keeping logic separate from UI components is a great practice.
- `constants/`: Stores static data (like mock lists or theme colors).
- `src/config/`: Configuration setups (like initializing PostHog).
- `assets/`: Local static files like images and fonts.
