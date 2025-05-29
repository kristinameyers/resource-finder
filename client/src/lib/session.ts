// Simple client-side session management for anonymous voting
export function getSessionId(): string {
  const key = 'voting-session-id';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}