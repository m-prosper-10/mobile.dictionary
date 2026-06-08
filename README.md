# Dictionary App

A minimal dictionary app built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/). The codebase is focused on Android and web, with a shared `src/app/` route tree, a native drawer on Android, and a sidebar shell on web.

## Features

- **Search + history flow** — search English words, view meanings and examples, and revisit successful searches from the drawer/sidebar
- **Audio pronunciation** — normalized pronunciation URLs, multiple variants, and play/pause/stop controls via `expo-av`
- **Platform-adaptive navigation** — gesture-driven drawer on Android, collapsible sidebar on web
- **Shared route tree** — dictionary search on `/` with a minimal shared shell in `src/app/`
- **Minimal UI** — flat surfaces, simple borders, readable spacing, and no overdesigned effects

## Tech Stack

| Layer      | Technology                                                                       |
| ---------- | -------------------------------------------------------------------------------- |
| Framework  | Expo SDK 56, React Native 0.85, React 19                                          |
| Navigation | Expo Router (file-based) with typed routes                                        |
| Styling    | Tailwind CSS v4 via [Uniwind](https://uniwind.dev/) + `tailwind-merge`            |
| Native UI  | `expo-av`, `expo-haptics`, `expo-glass-effect`, `@expo/ui` (iOS-only files)      |
| Web UI     | Radix UI (context menu, dropdown menu, tooltips), Lucide icons                     |
| Animations | `react-native-reanimated`, `react-native-gesture-handler`                          |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm start

# Run on a specific platform
npm run android
npm run web
```

> Requires [Node.js](https://nodejs.org/) and the [Expo CLI](https://docs.expo.dev/get-started/installation/). Start with Expo Go on Android when possible; use a dev build only if a native module is missing from Expo Go. Add native dependencies with `npx expo install`.

### Environment Variables

Copy `.env.example` to `.env` and add your own values. Anything exposed to the client must be prefixed with `EXPO_PUBLIC_`.

```bash
cp .env.example .env
```

## Project Structure

```
src/
  app/                  # Expo Router screens (file-based routes)
    _layout.tsx         # Native root layout: drawer + stack
    _layout.web.tsx     # Web root layout: sidebar + content
    index.tsx           # Dictionary screen
  components/           # Reusable UI (drawer, sidebar, header, audio, search)
  screens/              # Screen composition
  api/                  # Dictionary API client
  utils/                # Helpers + response parsing
  global.css            # Design tokens (OKLCH) + Tailwind theme mapping
```

## Customization

### Rename the app

Update `name`, `slug`, and `scheme` in `app.json`, and `name` in `package.json`. The visible app title appears in the drawer/sidebar header and the main dictionary screen title.

### Theme

Edit `src/global.css` to change the design tokens. Colors use OKLCH for perceptual uniformity across light and dark modes. The `@theme` block maps CSS variables to Tailwind classes:

```css
--app-background  ->  bg-background
--app-foreground  ->  text-foreground
--app-muted       ->  bg-muted
--app-border      ->  border-border
/* etc. */
```

### Data

Dictionary data is fetched from the Free Dictionary API via `src/api/dictionaryApi.ts`. Audio pronunciation URLs are normalized and deduplicated before rendering.

## License

MIT.
