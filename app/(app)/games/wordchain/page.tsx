"use client";

/** Word Chain lobby. */

import { GameLobby } from "../GameLobby";

export default function WordChainPage() {
  return (
    <GameLobby
      kind="wordchain"
      title="Word Chain"
      blurb="Each word must start with the last letter of the previous one. 20 seconds per turn, 10 points a word."
    />
  );
}
