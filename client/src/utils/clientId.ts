const CLIENT_ID_KEY = "poll_client_id";

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function setVoted(pollId: string, optionId: string) {
  localStorage.setItem(`voted:${pollId}`, optionId);
}

export function getVoted(pollId: string): string | null {
  return localStorage.getItem(`voted:${pollId}`);
}
