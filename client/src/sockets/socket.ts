import { PollState, Poll } from "@/types";

type Listener = (data: any) => void;

class MockSocket {
  private listeners: Map<string, Set<Listener>> = new Map();
  private pollId: string | null = null;

  constructor() {
    // Listen for storage changes to sync across tabs
    window.addEventListener("storage", () => {
      this.checkUpdates();
    });
  }

  connect() {
    console.log("Socket connected (mock)");
    return this;
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return this;
  }

  off(event: string, callback: Listener) {
    this.listeners.get(event)?.delete(callback);
    return this;
  }

  emit(event: string, data: any) {
    console.log("Socket emit:", event, data);
    if (event === "poll:join") {
      this.pollId = data.pollId;
      this.checkUpdates(); // Send initial state
    }
  }

  private checkUpdates() {
    if (!this.pollId) return;
    
    const STORAGE_KEY = "poll_data_db";
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const polls = data ? JSON.parse(data) : {};
      const poll = polls[this.pollId];

      if (poll) {
        const state: PollState = {
          pollId: poll.pollId,
          results: poll.results,
          totalVotes: poll.totalVotes,
        };
        this.dispatch("poll:state", state);
      }
    } catch (e) {
      console.error("Socket mock error", e);
    }
  }

  private dispatch(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
  
  disconnect() {
    console.log("Socket disconnected");
  }
}

export const socket = new MockSocket();
