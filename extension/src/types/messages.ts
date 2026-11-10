export interface LeetTrackPingMessage {
  type: 'LEETTRACK_PING';
}

export interface LeetTrackPongMessage {
  type: 'LEETTRACK_PONG';
  ok: boolean;
  message: string;
}
