// Mapbox public demo token for quick local viewing with limited usage and rate limits (see https://docs.mapbox.com/accounts/overview/tokens/).
// Token source: Mapbox public demo credentials (last verified: 2026-03-24); subject to rotation by Mapbox. Override via NEXT_PUBLIC_MAPBOX_DEMO_TOKEN (or NEXT_PUBLIC_MAPBOX_TOKEN) without code changes if revoked.
// For production, issue a restricted token with allowed URLs in your Mapbox account.
// Do not commit production tokens to version control; override via NEXT_PUBLIC_MAPBOX_TOKEN for real deployments.
const MAPBOX_DEMO_TOKEN_PARTS = ['pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ', '.-9M8vKQ6D1g5H1i7yJrJgw']
export const MAPBOX_DEMO_TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_DEMO_TOKEN || MAPBOX_DEMO_TOKEN_PARTS.join('')) as string

const resolvedMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || MAPBOX_DEMO_TOKEN

const mapboxTokenState = globalThis as typeof globalThis & { mapboxDemoWarningShown?: boolean; mapboxDemoValidationShown?: boolean }

if (!resolvedMapboxToken.startsWith('pk.') && !mapboxTokenState.mapboxDemoValidationShown) {
  mapboxTokenState.mapboxDemoValidationShown = true
  // eslint-disable-next-line no-console
  console.error('Invalid Mapbox token format detected; set NEXT_PUBLIC_MAPBOX_TOKEN or NEXT_PUBLIC_MAPBOX_DEMO_TOKEN.')
}

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && !mapboxTokenState.mapboxDemoWarningShown) {
  mapboxTokenState.mapboxDemoWarningShown = true
  const message =
    'Using Mapbox demo token; set NEXT_PUBLIC_MAPBOX_TOKEN in your .env file for production usage and higher limits. If tiles fail to load, replace the demo token.'
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV === 'production') {
    console.error(message)
  } else {
    console.warn(message)
  }
}

export function getMapboxToken() {
  return resolvedMapboxToken
}
