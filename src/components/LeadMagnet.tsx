import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { submitToPipeline } from '../lib/pipeline'
import type { SubmitResult } from '../lib/pipeline'
import { contact, forms } from '../config/site'
import styles from './LeadMagnet.module.css'

/** Preview the original feature without collecting requests for an unfinished guide. */
export function LeadMagnet({ tone = 'wash', headingId }: {
  tone?: 'wash' | 'sage' | 'green'
  headingId?: string
}) {
  const id = useId()
  const ready = Boolean(forms.leadMagnet.file && forms.endpoint)
  const [status, setStatus] = useState<'idle' | 'sending' | SubmitResult>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || status === 'sending') return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)

    if (data.get('website')) {
      setStatus('ok')
      form.reset()
      return
    }

    setStatus('sending')
    const result = await submitToPipeline({
      source: 'lead-magnet-checklist',
      email: String(data.get('email') ?? ''),
      magnet: forms.leadMagnet.title,
    })
    setStatus(result)
    if (result === 'ok') form.reset()
  }

  return (
    <div
      className={[
        tone === 'green' ? 'on-green' : '',
        styles.wrap,
        tone === 'sage' ? styles.sage : '',
        tone === 'green' ? styles.green : '',
      ].join(' ')}
    >
      <div className={styles.copy}>
        <p className="eyebrow">Before you start</p>
        <h2 id={headingId ?? `${id}-heading`} className={['sub-heading', styles.title].join(' ')}>{forms.leadMagnet.title}</h2>
        <p className={['small', styles.blurb].join(' ')}>{forms.leadMagnet.blurb}</p>
      </div>

      <form className={styles.form} onSubmit={onSubmit} aria-labelledby={headingId ?? `${id}-heading`}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            className={styles.input}
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!ready || status === 'sending'}
            aria-describedby={!ready ? `${id}-availability` : undefined}
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.honey} aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" disabled={!ready} />
        </div>

        {!ready && (
          <p id={`${id}-availability`} className={styles.preparation}>
            The checklist is in preparation. Email requests will open when it is ready.
          </p>
        )}

        <button className={styles.send} type="submit" disabled={!ready || status === 'sending'}
          aria-describedby={!ready ? `${id}-availability` : undefined}>
          <span>{status === 'sending' ? 'Sending…' : 'Send it to me'}</span>
        </button>

        <p className={['small', styles.status].join(' ')} role="status" aria-live="polite">
          {status === 'ok' && 'Request received. Thank you.'}
          {status === 'error' && `That did not send. Please try again or email ${contact.email}.`}
          {status === 'not-configured' &&
            `Requests are temporarily unavailable. Please contact ${contact.email}.`}
        </p>
      </form>
    </div>
  )
}
