const DEFAULT_API_BASE_URL = 'https://cadence-api-production-9f0b.up.railway.app'

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super(`PickCourse API request failed with status ${status}`)
    this.name = 'ApiError'
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  return response
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return (await request(path, init)).json() as Promise<T>
}

export async function apiTextRequest(path: string, init?: RequestInit): Promise<string> {
  return (await request(path, init)).text()
}
