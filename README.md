# SticksGame — Frontend

Web interface for the **SticksGame** multiplayer game (a variant of the Nim game). Built with **React 19 + TypeScript + Vite** and deployed to **Firebase Hosting**.

---

## Overview

SticksGame is a two-player game where players take turns crossing out sticks from a pyramid. The player forced to cross the last remaining stick **loses**. The frontend handles authentication, game creation and joining, stick pyramid interaction, and receives real-time updates via **Server-Sent Events (SSE)**.

---

## Game Rules

- The pyramid has **16 sticks** across 4 rows: 1 – 3 – 5 – 7.
- On each turn, the active player can cross out **one or more sticks**, as long as they are:
  - In the **same row**
  - **Consecutive** (adjacent indices)
  - Not already crossed
- The player forced to cross the **last remaining stick loses**.
- The game starts with the **guest's** turn (the player who accepted the invitation).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI |
| TypeScript | Static typing |
| Vite | Build tool and dev server |
| React Router 7 | Navigation |
| Firebase SDK | Google authentication |
| Firebase Hosting | Production deployment |
| Server-Sent Events | Real-time updates |

---

## Project Structure

```
src/
├── main.tsx                      # Entry point: React Router + AuthProvider
├── App.tsx                       # Home screen: "New Game" button
├── App.css                       # Home screen styles
├── index.css                     # Global styles
│
├── config/
│   └── firebase.ts               # Firebase initialization from environment variables
│
├── context/
│   └── AuthContext.tsx           # Auth context; exposes useAuth() hook
│
├── hooks/
│   └── useGameEvents.ts          # SSE hook: receives real-time game state
│
├── pages/
│   ├── GamePage.tsx              # Game page: core logic, turns, modals
│   └── GamePage.css              # Game page styles
│
└── components/
    ├── auth/
    │   └── LoginButton.tsx       # "Sign in with Google" / "Sign out" button
    └── game/
        ├── SticksPyramid.tsx     # Interactive pyramid with drag-to-select
        ├── SticksPyramid.css     # Pyramid and stick styles
        ├── InviteModal.tsx       # Invite link modal (shown to owner)
        ├── InviteModal.css
        ├── GameOverModal.tsx     # End-of-game modal with winner/loser
        └── GameOverModal.css
```

---

## Application Flow

### Creating a game
1. User opens the home screen (`/`)
2. Clicks **New Game** → authenticates with Google if not already signed in
3. Frontend calls `POST /games` → receives `gameId` and `playerId`
4. Navigates to `/game/:gameId` with `playerId` in navigation state
5. Invite modal is shown with a shareable link

### Joining a game
1. The guest opens the invite link `/game/:gameId`
2. If not authenticated, a Google login button is shown
3. Once signed in, the frontend automatically calls `POST /games/:gameId/join`
4. Guest receives their `playerId` and the game begins
5. The owner receives an SSE notification: *"Name has accepted the invitation"*

### Playing
1. The player whose turn it is sees the pyramid enabled
2. They drag across the sticks they want to cross (same row, consecutive)
3. A live SVG line is drawn over the selected sticks in real time
4. On pointer release, **Confirm** / **Cancel** buttons appear
5. On confirm, `PATCH /games/:gameId/sticks` is called
6. SSE updates both players' screens with the new game state

### End of game
- When ≤1 sticks remain, the backend marks the game as `finished`
- `GameOverModal` is shown with 🎉 for the winner and 😔 for the loser
- A button takes the player back to the home screen

---

## Key Components

### `SticksPyramid`

Renders the interactive pyramid. Stick selection works via:
- **`onPointerDown`**: starts the drag and releases pointer capture to allow events on other elements
- **`onPointerMove`** on the container + **`document.elementsFromPoint`**: detects which sticks are under the pointer using `data-stick-row` and `data-stick-index` attributes
- **SVG overlay**: a line drawn in real time following the drag
- **`onPointerUp`**: finalizes the selection and shows confirm/cancel buttons

Props:
```ts
interface SticksPyramidProps {
  sticks: Stick[]
  disabled: boolean
  onMove: (selected: { row: number; index: number }[]) => void
}
```

### `useGameEvents`

Hook that opens an SSE connection to the backend and exposes the game state:

```ts
interface GameEvent {
  state: string
  currentPlayerId: string | null
  winnerId: string | null
  players: GamePlayer[]
  sticks: Stick[]
}
```

The Firebase token is passed as `?token=` in the SSE URL since `EventSource` does not support custom headers.

### `GamePage`

Coordinates the entire game flow:
- Reads `myPlayerId` from navigation state (on game creation) or from the backend response (on page refresh)
- Determines whose turn it is: `isMyTurn = gameEvent.currentPlayerId === myPlayerId`
- Detects end of game: `gameEvent.state === 'finished'`
- Shows notifications when the guest joins (received via SSE)

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Local Development

```bash
npm install
npm run dev       # Dev server at http://localhost:5173
```

## Build & Deploy

```bash
npm run build     # TypeScript + Vite build → dist/
npm run deploy    # Build + firebase deploy --only hosting
```

**Production URL:** configured in Firebase Hosting under project `sticksgame-prod`
