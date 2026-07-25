"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import { requestLiveToken } from "@/lib/api/live";

/**
 * Connect to a LiveKit room and expose the tracks the UI needs.
 *
 * Rooms are named the same way the mobile app names them (`generateCallId`
 * for 1:1 calls, the stream's room id for broadcasts) and tokens come from
 * the shared `/live/token` endpoint, so web and mobile participants land in
 * the same room.
 */

export type LiveRole = "participant" | "host" | "viewer";

export interface RemoteParticipantState {
  identity: string;
  name?: string;
  audioTrack?: RemoteTrack;
  videoTrack?: RemoteTrack;
  isSpeaking: boolean;
}

export interface UseLiveKitRoomOptions {
  roomName: string | null;
  participantName: string | null;
  /** Viewers subscribe only — they never publish. */
  role?: LiveRole;
  publishAudio?: boolean;
  publishVideo?: boolean;
  /** Wait for an explicit `connect()` instead of joining on mount. */
  manual?: boolean;
}

export interface UseLiveKitRoomResult {
  room: Room | null;
  state: ConnectionState;
  connecting: boolean;
  connected: boolean;
  error: string | null;
  participants: RemoteParticipantState[];
  localVideoTrack: Track | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  switchCamera: () => Promise<void>;
}

export function useLiveKitRoom({
  roomName,
  participantName,
  role = "participant",
  publishAudio = true,
  publishVideo = false,
  manual = false,
}: UseLiveKitRoomOptions): UseLiveKitRoomResult {
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipantState[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<Track | null>(null);
  const [micEnabled, setMicEnabled] = useState(publishAudio);
  const [cameraEnabled, setCameraEnabled] = useState(publishVideo);
  const facingRef = useRef<"user" | "environment">("user");

  const isViewer = role === "viewer";

  /** Rebuild the remote participant list from the room's current state. */
  const syncParticipants = useCallback((current: Room) => {
    const next: RemoteParticipantState[] = [];
    current.remoteParticipants.forEach((participant: RemoteParticipant) => {
      next.push({
        identity: participant.identity,
        name: participant.name,
        audioTrack: participant
          .getTrackPublication(Track.Source.Microphone)
          ?.track as RemoteTrack | undefined,
        videoTrack: participant
          .getTrackPublication(Track.Source.Camera)
          ?.track as RemoteTrack | undefined,
        isSpeaking: participant.isSpeaking,
      });
    });
    setParticipants(next);
  }, []);

  const disconnect = useCallback(async () => {
    const current = roomRef.current;
    if (!current) return;
    roomRef.current = null;
    setRoom(null);
    setParticipants([]);
    setLocalVideoTrack(null);
    await current.disconnect();
  }, []);

  const connect = useCallback(async () => {
    if (!roomName || !participantName) return;
    if (roomRef.current) return;

    setError(null);
    setState(ConnectionState.Connecting);

    try {
      const { token, serverUrl } = await requestLiveToken(
        roomName,
        participantName
      );

      const next = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      next
        .on(RoomEvent.ConnectionStateChanged, (s) => setState(s))
        .on(RoomEvent.ParticipantConnected, () => syncParticipants(next))
        .on(RoomEvent.ParticipantDisconnected, () => syncParticipants(next))
        .on(RoomEvent.ActiveSpeakersChanged, () => syncParticipants(next))
        .on(
          RoomEvent.TrackSubscribed,
          (
            _track: RemoteTrack,
            _pub: RemoteTrackPublication,
            _participant: RemoteParticipant
          ) => syncParticipants(next)
        )
        .on(RoomEvent.TrackUnsubscribed, () => syncParticipants(next))
        .on(RoomEvent.LocalTrackPublished, (pub) => {
          if (pub.source === Track.Source.Camera && pub.track) {
            setLocalVideoTrack(pub.track);
          }
        })
        .on(RoomEvent.LocalTrackUnpublished, (pub) => {
          if (pub.source === Track.Source.Camera) setLocalVideoTrack(null);
        })
        .on(RoomEvent.Disconnected, () => {
          roomRef.current = null;
          setRoom(null);
          setParticipants([]);
          setLocalVideoTrack(null);
        });

      await next.connect(serverUrl, token);

      // Viewers of a broadcast consume only — publishing would put them on stage.
      if (!isViewer) {
        if (publishAudio) await next.localParticipant.setMicrophoneEnabled(true);
        if (publishVideo) await next.localParticipant.setCameraEnabled(true);
      }

      roomRef.current = next;
      setRoom(next);
      setMicEnabled(!isViewer && publishAudio);
      setCameraEnabled(!isViewer && publishVideo);
      syncParticipants(next);
    } catch (err) {
      console.error("[live] room connect failed", err);
      setError(
        err instanceof Error ? err.message : "Could not connect to the call."
      );
      setState(ConnectionState.Disconnected);
    }
  }, [roomName, participantName, isViewer, publishAudio, publishVideo, syncParticipants]);

  // Auto-join unless the caller wants to drive it (e.g. after ringing).
  useEffect(() => {
    if (manual) return;
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual, roomName, participantName]);

  // Always release the mic/camera when the screen goes away.
  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, []);

  const toggleMic = useCallback(async () => {
    const current = roomRef.current;
    if (!current) return;
    const next = !micEnabled;
    await current.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [micEnabled]);

  const toggleCamera = useCallback(async () => {
    const current = roomRef.current;
    if (!current) return;
    const next = !cameraEnabled;
    await current.localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  }, [cameraEnabled]);

  const switchCamera = useCallback(async () => {
    const current = roomRef.current;
    if (!current || !cameraEnabled) return;
    facingRef.current = facingRef.current === "user" ? "environment" : "user";
    await current.localParticipant.setCameraEnabled(true, {
      facingMode: facingRef.current,
    });
  }, [cameraEnabled]);

  return {
    room,
    state,
    connecting: state === ConnectionState.Connecting,
    connected: state === ConnectionState.Connected,
    error,
    participants,
    localVideoTrack,
    micEnabled,
    cameraEnabled,
    connect,
    disconnect,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
}
