const TOKEN_KEY = 'prefeitura_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `prefeitura_token=${token}; path=/; max-age=${8 * 60 * 60}`;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = 'prefeitura_token=; path=/; max-age=0';
}