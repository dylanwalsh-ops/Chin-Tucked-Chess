# Chin Tucked Chess

A browser chess game in orange, yellow, and black. The mood is lively and slightly theatrical, with heavy, clean sans-serif lettering and warm amber squares against dark panels. A chosen piece stands on a bright yellow square; legal empty squares show dark dots, and legal captures show a yellow ring.

## Play

- **Hot-seat:** two people share one device and alternate moves.
- **Vs computer:** choose White or Black; the other side uses a browser-only depth-two minimax search with alpha-beta pruning. It stops searching before a 1.9-second deadline and chooses a legal move.
- **Online:** type the same 4–12-character room code on two devices. The first visitor takes White, the second takes Black, and later visitors watch. Refreshing the page keeps a player's side on the same device. A player can reset the game for everyone.

Select a piece and then a highlighted square. On promotion, choose queen, rook, bishop, or knight. The rules module handles check, checkmate, stalemate, castling, en passant, and all pieces. The server verifies every online move before it changes the saved board.

## Run or publish

1. Install Node.js 20 or newer and create a Cloudflare account.
2. Open a terminal in this folder and run `npm install`.
3. Run `npm test`. The start position must yield **20, 400, and 8,902** legal move sequences at depths one, two, and three.
4. Run `npm run dev` for a local preview. For online play, open the local site on two browser tabs or devices that can reach that preview.
5. Log in with `npx wrangler login`, then run `npm run deploy` to publish to your Cloudflare account. This release has not been published from this workspace.

The `wrangler.jsonc` file sets the date, static site serving, the WebSocket route, observability, and the SQLite-backed room objects for Workers Free. No timer is used. Positions are saved after every accepted move.

## Plain-English glossary

**Worker:** Cloudflare's small server program that receives online connections. **Durable Object:** a server-side room that keeps one game's data and handles its players. **SQLite:** the built-in storage format backing each room. **WebSocket:** a live connection that delivers moves without refreshing. **Wrangler:** Cloudflare's command-line tool for local preview and deployment. **JSON:** a structured text format for messages, with a `type` describing the action and a `payload` containing its details. **Minimax:** a method that chooses a move by considering possible replies. **Alpha-beta pruning:** a shortcut that skips reply lines that cannot improve the choice. **Depth two:** the computer considers its move and one opponent reply. **Move-count test (perft):** counts all legal sequences for a chosen number of moves, exposing mistakes in the rules.

## Scope and references

No accounts, clocks, ratings, repetition or fifty-move draws, opening book, export, optional extra, or framework are included. No Figma reference file or link was available in the provided project, so the interface follows the requested colors and design description; visual matching to a Figma design remains unverified.
