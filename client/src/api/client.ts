import { Poll, CreatePollRequest, CreatePollResponse, PollResult, PollOption } from "@/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "poll_data_db";
const DELAY_MS = 600; // Simulate network latency

// Load initial state
const loadPolls = (): Record<string, Poll> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const savePolls = (polls: Record<string, Poll>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new Event("storage"));
};

const polls = loadPolls();

// Helper to simulate async
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  createPoll: async (data: CreatePollRequest): Promise<CreatePollResponse> => {
    await delay(DELAY_MS);
    
    const pollId = Math.random().toString(36).substring(2, 10);
    const options: PollOption[] = data.options.map((text) => ({
      id: Math.random().toString(36).substring(2, 8),
      text: text.trim(),
    }));

    const results: PollResult[] = options.map((opt) => ({
      optionId: opt.id,
      votes: 0,
    }));

    const newPoll: Poll = {
      pollId,
      question: data.question,
      options,
      results,
      totalVotes: 0,
      createdAt: Date.now(),
    };

    polls[pollId] = newPoll;
    savePolls(polls);

    return {
      pollId,
      shareUrl: `${window.location.origin}/p/${pollId}`,
    };
  },

  getPoll: async (pollId: string): Promise<Poll> => {
    await delay(DELAY_MS);
    const poll = polls[pollId];
    if (!poll) {
      if (pollId === "demo") {
        return createDemoPoll();
      }
      throw new Error("Poll not found");
    }
    return poll;
  },

  vote: async (pollId: string, optionId: string): Promise<{ ok: boolean }> => {
    await delay(DELAY_MS / 2);
    const poll = polls[pollId];
    if (!poll) throw new Error("Poll not found");

    const optionIndex = poll.results.findIndex((r) => r.optionId === optionId);
    if (optionIndex === -1) throw new Error("Option not found");

    poll.results[optionIndex].votes++;
    poll.totalVotes++;
    
    polls[pollId] = poll;
    savePolls(polls);

    return { ok: true };
  },
};

function createDemoPoll(): Poll {
  const pollId = "demo";
  const options = [
    { id: "opt1", text: "React" },
    { id: "opt2", text: "Vue" },
    { id: "opt3", text: "Svelte" },
    { id: "opt4", text: "Angular" },
  ];
  const results = options.map(o => ({ optionId: o.id, votes: Math.floor(Math.random() * 50) }));
  const totalVotes = results.reduce((a, b) => a + b.votes, 0);
  
  const demoPoll = {
    pollId,
    question: "Which frontend framework do you prefer for 2025?",
    options,
    results,
    totalVotes,
    createdAt: Date.now(),
  };
  
  polls[pollId] = demoPoll;
  savePolls(polls);
  return demoPoll;
}
