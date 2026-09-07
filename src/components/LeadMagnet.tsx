import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitToPipeline } from '../lib/pipeline'
import type { SubmitResult } from '../lib/pipeline'
import { contact, forms } from '../config/site'
import styles from './LeadMagnet.module.css'

/**
 * The lead magnet.
 *
 * One email field, one checklist. It goes to the same pipeline as the enquiry
 * form and through the same single endpoint, and the component is deliberately
 * self-contained so the Instagram automation can point at the same capture
 * without a second implementation.
 *
 * OPEN: the checklist PDF itself is a Milestone 2 deliverable. Until
 * `forms.leadMagnet.file` is set, this promises the checklist by email rather
 * than offering a download that does not exist.
 */
export function LeadMagnet({ tone = 'wash' }: { tone?: 'wash' | 'sage' }) {
  const [status, setStatus] = useState<'idle' | 'sending' | SubmitResult>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
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
    <div className={[styles.wrap, tone === 'sage' ? styles.sage : ''].join(' ')}>
      <div className={styles.copy}>
        <p className="eyebrow">Before you start</p>
        <h2 className={['sub-heading', styles.title].join(' ')}>{forms.leadMagnet.title}</h2>
        <p className={['small', styles.blurb].join(' ')}>{forms.leadMagnet.blurb}</p>
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="magnet-email">
            Email
          </label>
          <input
            className={styles.input}
            id="magnet-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.honey} aria-hidden="true">
          <label htmlFor="magnet-website">Website</label>
          <input id="magnet-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button className="btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send it to me'}
        </button>

        <p className={['small', styles.status].join(' ')} role="status" aria-live="polite">
          {status === 'ok' && 'On its way. Check your inbox.'}
          {status === 'error' && `That did not send. Email ${contact.email} and we will send it over.`}
          {status === 'not-configured' &&
            `Not connected yet — email ${contact.email} and we will send it over.`}
        </p>
      </form>
    </div>
  )
}
