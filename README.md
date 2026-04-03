# SticksGame — Frontend

Interfaz web del juego multijugador **SticksGame** (variante del juego Nim). Construida con **React 19 + TypeScript + Vite** y desplegada en **Firebase Hosting**.

---

## Descripción

SticksGame es un juego de dos jugadores en el que por turnos se tachan palitos de una pirámide. El jugador que se vea obligado a tachar el último palito **pierde**. El frontend gestiona la autenticación, la creación e ingreso a partidas, la interacción con la pirámide de palitos, y recibe actualizaciones en tiempo real mediante **Server-Sent Events (SSE)**.

---

## Reglas del juego

- La pirámide tiene **16 palitos** en 4 filas: 1 – 3 – 5 – 7.
- En cada turno, el jugador activo puede tachar **1 o más palitos**, siempre que:
  - Estén en la **misma fila**
  - Sean **consecutivos** (adyacentes)
  - No estén ya tachados
- El jugador que se ve obligado a tachar el **último palito restante pierde**.
- El juego comienza con el turno del **guest** (el jugador que acepta la invitación).

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 19 | UI |
| TypeScript | Tipado estático |
| Vite | Build tool y dev server |
| React Router 7 | Navegación |
| Firebase SDK | Autenticación con Google |
| Firebase Hosting | Deploy de producción |
| Server-Sent Events | Actualizaciones en tiempo real |

---

## Estructura del proyecto

```
src/
├── main.tsx                      # Entrada: React Router + AuthProvider
├── App.tsx                       # Pantalla principal: botón "New Game"
├── App.css                       # Estilos de la pantalla principal
├── index.css                     # Estilos globales
│
├── config/
│   └── firebase.ts               # Inicialización de Firebase con variables de entorno
│
├── context/
│   └── AuthContext.tsx           # Context de autenticación; expone useAuth()
│
├── hooks/
│   └── useGameEvents.ts          # Hook SSE: recibe estado del juego en tiempo real
│
├── pages/
│   ├── GamePage.tsx              # Página del juego: lógica central, turno, modales
│   └── GamePage.css              # Estilos de la página del juego
│
└── components/
    ├── auth/
    │   └── LoginButton.tsx       # Botón "Sign in with Google" / "Sign out"
    └── game/
        ├── SticksPyramid.tsx     # Pirámide interactiva con selección por arrastre
        ├── SticksPyramid.css     # Estilos de la pirámide y palitos
        ├── InviteModal.tsx       # Modal con link de invitación (para el owner)
        ├── InviteModal.css
        ├── GameOverModal.tsx     # Modal de fin de juego con ganador/perdedor
        └── GameOverModal.css
```

---

## Flujo de la aplicación

### Crear una partida
1. El usuario entra a la pantalla principal (`/`)
2. Hace clic en **New Game** → se autentica con Google si no lo hizo
3. El frontend llama a `POST /games` → obtiene `gameId` y `playerId`
4. Navega a `/game/:gameId` con el `playerId` en el estado de navegación
5. Se muestra el modal de invitación con el link para compartir

### Unirse a una partida
1. El invitado abre el link `/game/:gameId` en su navegador
2. Si no está autenticado, se le muestra el botón de login con Google
3. Una vez autenticado, el frontend llama automáticamente a `POST /games/:gameId/join`
4. El guest obtiene su `playerId` y el juego comienza
5. El owner recibe una notificación vía SSE: *"Nombre ha aceptado la invitación"*

### Jugar
1. El jugador con el turno activo ve la pirámide habilitada
2. Arrastra el cursor sobre los palitos que quiere tachar (misma fila, consecutivos)
3. Una línea SVG se dibuja en tiempo real sobre los palitos seleccionados
4. Al soltar, aparecen botones **Confirmar** / **Cancelar**
5. Al confirmar, se llama a `PATCH /games/:gameId/sticks`
6. El SSE actualiza la pantalla de ambos jugadores con el nuevo estado

### Fin del juego
- Cuando quedan ≤1 palitos sin tachar, el backend marca la partida como `finished`
- Se muestra `GameOverModal` indicando quién ganó con emoji 🎉 / 😔
- Un botón lleva al jugador de vuelta a la pantalla principal

---

## Componentes principales

### `SticksPyramid`

Renderiza la pirámide interactiva. La selección de palitos funciona mediante:
- **`onPointerDown`**: inicia el arrastre y libera el pointer capture para permitir eventos en otros elementos
- **`onPointerMove`** en el contenedor + **`document.elementsFromPoint`**: detecta qué palitos están bajo el cursor usando atributos `data-stick-row` y `data-stick-index`
- **SVG overlay**: línea que se dibuja en tiempo real siguiendo el arrastre
- **`onPointerUp`**: finaliza la selección y muestra los botones de confirmar/cancelar

Props:
```ts
interface SticksPyramidProps {
  sticks: Stick[]
  disabled: boolean
  onMove: (selected: { row: number; index: number }[]) => void
}
```

### `useGameEvents`

Hook que abre una conexión SSE con el backend y expone el estado del juego:

```ts
interface GameEvent {
  state: string
  currentPlayerId: string | null
  winnerId: string | null
  players: GamePlayer[]
  sticks: Stick[]
}
```

El token de Firebase se pasa como `?token=` en la URL del SSE ya que `EventSource` no soporta headers custom.

### `GamePage`

Coordina todo el flujo del juego:
- Lee `myPlayerId` del estado de navegación (en creación) o de la respuesta del backend (en recarga)
- Determina si es el turno del jugador: `isMyTurn = gameEvent.currentPlayerId === myPlayerId`
- Detecta el fin de la partida: `gameEvent.state === 'finished'`
- Muestra notificaciones cuando el guest se une (recibidas por SSE)

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Desarrollo local

```bash
npm install
npm run dev       # Dev server en http://localhost:5173
```

## Build y deploy

```bash
npm run build     # Compila TypeScript + Vite → dist/
npm run deploy    # Build + firebase deploy --only hosting
```

**URL de producción:** configurada en Firebase Hosting del proyecto `sticksgame-prod`
