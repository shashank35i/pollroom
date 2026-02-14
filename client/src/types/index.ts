export interface PollOption {
  id: string;
  text: string;
}

export interface PollResult {
  optionId: string;
  votes: number;
}

export interface Poll {
  pollId: string;
  question: string;
  options: PollOption[];
  results: PollResult[];
  totalVotes: number;
  createdAt: number;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
}

export interface CreatePollResponse {
  pollId: string;
  shareUrl: string;
}

export interface PollState {
  pollId: string;
  results: PollResult[];
  totalVotes: number;
}

export interface UserStatus {
  hasVoted: boolean;
  votedOptionId?: string;
}
