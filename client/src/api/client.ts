import { CreatePollRequest, CreatePollResponse, Poll } from "@/types";
import { getClientId } from "@/utils/clientId";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

type ApiError = Error & {
  response?: {
    status: number;
    data?: unknown;
    headers?: Record<string, string>;
  };
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      (data as { message?: string }).message || "Request failed",
    ) as ApiError;
    error.response = {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
    throw error;
  }
  return data as T;
}

export const api = {
  createPoll: async (data: CreatePollRequest): Promise<CreatePollResponse> => {
    const response = await fetch(`${API_BASE}/api/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return parseResponse<CreatePollResponse>(response);
  },

  getPoll: async (pollId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE}/api/polls/${pollId}`, {
      headers: {
        "X-Client-Id": getClientId(),
      },
    });

    return parseResponse<Poll>(response);
  },

  vote: async (pollId: string, optionId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE}/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": getClientId(),
      },
      body: JSON.stringify({ optionId }),
    });

    return parseResponse<Poll>(response);
  },
};
