const TOKEN_KEY = 'studysync_token'

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // Ignore localStorage errors in restricted environments
  }
}

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (netErr) {
    const error = new Error('Network error. Please check your connection.')
    error.status = 0
    throw error
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    const message = data?.message || response.statusText || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
}

export default api
