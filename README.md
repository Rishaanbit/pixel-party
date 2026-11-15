# Pixel Party

A static arcade with Snake, Tetris, Pong, and a browser-local token shop. Plain HTML, CSS, and JavaScript; no accounts, ads, dependencies, or build step.

## Play and earn

The homepage links to each game through the shared player. Each game also has its own standalone page in `games/`, with navigation back to the menu and shop.

- Snake: 2 tokens per food collected.
- Tetris: 8 tokens per completed row. Movement and dropping alone do not award tokens.
- Pong: 3 tokens per player point, plus 10 for winning a first-to-seven match.

Tokens save at the scoring event, so players can leave or restart without losing earned tokens. Each game displays its current round's tokens. The menu and player show the shared wallet.

## Shop

`shop.html` offers Ocean (40 tokens) and Sunset (60 tokens) site themes, plus Frost (25 tokens) and Candy (35 tokens) game-screen palettes. Themes change backgrounds and interface accents throughout the site. Screen palettes recolor the canvas in all three games. Purchases equip immediately and can be re-equipped for free. Midnight and Original restore the default appearance for free.

The wallet, lifetime earnings, purchases, and equipped items share the `pixel-party-wallet-v1` localStorage key. Progress belongs to one browser profile and origin, not an account. Clearing site data removes it. If storage is unavailable, the shop displays a notice and progress remains in memory for that page session. Where supported, Web Locks serialize wallet updates between tabs.

Use GitHub Pages or a local HTTP server for consistent shared storage between pages; browsers differ in how they handle storage for files opened directly with `file://`.

## GitHub Pages

Upload this folder's contents to a GitHub repository. In Settings → Pages, select deployment from a branch, choose the branch and `/ (root)`, and save. All resource links are relative and support repository subpaths. There is no compilation or installation step.

## Files

- `index.html`, `style.css`: game menu and player layout.
- `play.html`, `player.js`: embedded game player.
- `economy.js`, `economy.css`: shared wallet, purchase logic, navigation, and equipped themes.
- `shop.html`, `shop.js`: shop interface.
- `games/hemdani-snake/`: copied Snake game with local layout, styling, and token integration. The original project is untouched.
- `games/tetris/`, `games/pong/`: standalone games.
- `games/arcade.css`, `games/theme.css`: shared game styles.
- `assets/`: local pixel font and its license.

## Verification

With Node installed, run `node tests/progression.mjs`. This checks real scoring hooks in each game, storage reloads, purchases, insufficient funds, repeated purchases, equipping, unavailable storage, invalid saved data, relative links, and JavaScript syntax. Node is only for optional development checks, not for running or deploying the website.
