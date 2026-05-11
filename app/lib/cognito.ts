const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION ?? 'mx-central-1'
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''
const ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`

export interface CognitoTokens {
  idToken: string
  accessToken: string
  refreshToken: string
}

export interface CognitoRefreshed {
  idToken: string
  accessToken: string
}

class CognitoError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'CognitoError'
  }
}

async function cognitoRequest<T>(target: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new CognitoError(json.__type ?? 'UnknownError', json.message ?? 'Cognito error')
  }

  return json as T
}

export async function register(email: string, password: string, name: string): Promise<void> {
  await cognitoRequest('SignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name },
    ],
  })
}

export async function confirmOtp(email: string, code: string): Promise<void> {
  await cognitoRequest('ConfirmSignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  })
}

export async function login(email: string, password: string): Promise<CognitoTokens> {
  const data = await cognitoRequest<{ AuthenticationResult: { IdToken: string; AccessToken: string; RefreshToken: string } }>(
    'InitiateAuth',
    {
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: password },
      ClientId: CLIENT_ID,
    },
  )

  const r = data.AuthenticationResult
  return { idToken: r.IdToken, accessToken: r.AccessToken, refreshToken: r.RefreshToken }
}

export async function refreshSession(refreshToken: string): Promise<CognitoRefreshed> {
  const data = await cognitoRequest<{ AuthenticationResult: { IdToken: string; AccessToken: string } }>(
    'InitiateAuth',
    {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: refreshToken },
      ClientId: CLIENT_ID,
    },
  )

  const r = data.AuthenticationResult
  return { idToken: r.IdToken, accessToken: r.AccessToken }
}

const STORAGE_ID = 'dilemma_id_token'
const STORAGE_ACCESS = 'dilemma_access_token'
const STORAGE_REFRESH = 'dilemma_refresh_token'

export function saveTokens(tokens: CognitoTokens): void {
  localStorage.setItem(STORAGE_ID, tokens.idToken)
  localStorage.setItem(STORAGE_ACCESS, tokens.accessToken)
  localStorage.setItem(STORAGE_REFRESH, tokens.refreshToken)
}

export function loadTokens(): CognitoTokens | null {
  const idToken = localStorage.getItem(STORAGE_ID)
  const accessToken = localStorage.getItem(STORAGE_ACCESS)
  const refreshToken = localStorage.getItem(STORAGE_REFRESH)
  if (!idToken || !accessToken || !refreshToken) return null
  return { idToken, accessToken, refreshToken }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_ID)
  localStorage.removeItem(STORAGE_ACCESS)
  localStorage.removeItem(STORAGE_REFRESH)
}
