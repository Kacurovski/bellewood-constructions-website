import { forms } from '../config/site'

/**
 * Everything this site captures goes to one place: the Systemations pipeline.
 *
 * There is exactly one endpoint, in `src/config/site.ts`. Drop the GHL inbound
 * webhook URL into `forms.endpoint` and both the enquiry form and the lead
 * magnet are live. There is no second place to change and no environment
 * variable to set.
 *
 * Until that value is set, submissions are NOT silently swallowed. The caller
 * gets `not-configured` back and tells the visitor plainly to call or email
 * instead. An enquiry from a two-million-dollar renovation is not something to
 * lose to a placeholder.
 */

export type SubmitResult = 'ok' | 'not-configured' | 'error'

export type Payload = Record<string, string> & {
  /** Which form this came from, so the pipeline can route it. */
  source: string
}

export async function submitToPipeline(payload: Payload): Promise<SubmitResult> {
  if (!forms.endpoint) return 'not-configured'

  try {
    const res = await fetch(forms.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        submittedAt: new Date().toISOString(),
        page: typeof window !== 'undefined' ? window.location.href : '',
      }),
    })
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}
