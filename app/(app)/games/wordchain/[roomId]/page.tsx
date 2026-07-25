"use client";

/** A Word Chain room in play. */

import { useParams } from "next/navigation";
import { GameRoom } from "../../GameRoom";

export default function WordChainRoomPage() {
  const params = useParams<{ roomId: string }>();
  return <GameRoom kind="wordchain" roomId={params.roomId} />;
}
