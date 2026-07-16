# ♾️ Infinite Tic Tac Toe

Welcome to **Infinite Tic Tac Toe**, a modern twist on the classic game where the board never gets stale — only your last 3 moves remain active at any time.

👉 **[Play the Live Game Here!](https://eduardofreitasf.github.io/infinite_tic_tac_toe/)**

---

## 🎮 The Game & Rules

Infinite Tic Tac Toe plays like classic Tic Tac Toe, but with one game-changing rule:

1. **The Setup**: A standard 3×3 grid, two players — **X** and **O**.
2. **The Twist**: Each player can only have **3 marks on the board at once**. When you place a 4th mark, your **oldest mark disappears** automatically.
3. **Strategy**: The fading mark is highlighted before it vanishes, so both players can plan around it — but the board is always in motion.
4. **Winning**: Get **3 of your marks in a row** (horizontal, vertical, or diagonal) at any point in time to win.

---

## ✨ Features

- **Infinite Mechanic** — Oldest marks fade away, keeping the game dynamic and strategic.
- **Vs Computer** — Challenge the AI in three difficulties: Easy, Medium, and **Unbeatable** (Minimax with Alpha-Beta pruning).
- **Play As X or O** — Choose your symbol when playing against the AI.
- **Match History** — Tracks the outcome of every completed game, persisted across sessions.
- **Event Logs** — Live move-by-move game log with color-coded entries.
- **Dark / Light Mode** — Toggle between themes, saved automatically.
- **Sound Effects** — Synthesized Web Audio API sounds for moves, fades, wins, and clicks.
- **Confetti** — Canvas-based particle burst on victory.
- **Mobile Ready** — Fully responsive with a bottom navigation bar and slide-up drawers for settings and logs.

---

## 📁 Repository Structure

- **`.github/`**: GitHub Actions workflows, including automated deployment to GitHub Pages.
- **`/app`**: The frontend codebase. Built with **React 19**, **TypeScript**, and **Vite**, structured into modular components and utility libraries.
- **`LICENSE`**: MIT license terms for open-source distribution.
- **`README.md`**: Main project guide and instructions.

---

## 🛠️ Running Locally

If you'd like to run the game on your own machine:

1. Navigate to the frontend directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the link provided in your terminal (usually `http://localhost:5173/`) in your browser.
