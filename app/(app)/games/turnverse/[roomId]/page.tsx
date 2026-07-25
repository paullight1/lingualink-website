"use client";

/** A TurnVerse room in play. */

import { useParams } from "next/navigation";
import { GameRoom } from "../../GameRoom";

export default function TurnVerseRoomPage() {
  const params = useParams<{ roomId: string }>();
  return <GameRoom kind="turnverse" roomId={params.roomId} />;
}
