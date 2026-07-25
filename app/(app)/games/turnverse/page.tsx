"use client";

/** TurnVerse lobby. */

import { GameLobby } from "../GameLobby";

export default function TurnVersePage() {
  return (
    <GameLobby
      kind="turnverse"
      title="TurnVerse"
      blurb="Players take turns saying the shown word in their own language. 15 seconds per turn, up to 6 players."
    />
  );
}
