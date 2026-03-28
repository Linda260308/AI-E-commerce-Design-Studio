/**
 * Authentication utilities
 */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

/**
 * Save auth tokens to localStorage
 */
export function saveAuthTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('token_expires_at', tokens.expires_at);
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Clear auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_at');
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  
  const expiresAt = localStorage.getItem('token_expires_at');
  if (!expiresAt) return true;
  
  const expiresDate = new Date(expiresAt);
  return expiresDate.getTime() > Date.now();
}

/**
 * Logout user
 */
export async function logout(backendUrl?: string): Promise<void> {
  const token = getAccessToken();
  
  if (token && backendUrl) {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearAuthTokens();
}
