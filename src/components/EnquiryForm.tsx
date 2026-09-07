import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitToPipeline } from '../lib/pipeline'
import type { SubmitResult } from '../lib/pipeline'
import { contact } from '../config/site'
import styles from './EnquiryForm.module.css'

/**
 * The enquiry form. This is the point of the site.
 *
 * Deliberately short. Someone weighing up a major renovation is not going to
 * fill in a project-budget dropdown on a first visit, and asking for one costs
 * more enquiries than it qualifies. Name, contact, suburb, and room to say what
 * the job is.
 *
 * The honeypot field catches the bots that would otherwise fill the pipeline
 * with noise. It is not a captcha and it is not perfect, but it is free and it
 * does not make a real person prove anything.
 */
export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | SubmitResult>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot. A real person never fills this in; it is hidden from view and
    // from screen readers alike.
    if (data.get('company')) {
      setStatus('ok')
      form.reset()
      return
    }

    setStatus('sending')
    const result = await submitToPipeline({
      source: 'website-enquiry',
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      suburb: String(data.get('suburb') ?? ''),
      message: String(data.get('message') ?? ''),
    })

    setStatus(result)
    if (result === 'ok') form.reset()
  }

  const sending = status === 'sending'

  return (
    <form className={[styles.form, compact ? styles.compact : ''].join(' ')} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <Field name="name" label="Your name" autoComplete="name" required />
        <Field name="suburb" label="Suburb" autoComplete="address-level2" />
      </div>

      <div className={styles.row}>
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="phone" label="Phone" type="tel" autoComplete="tel" />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          What are you thinking of building?
        </label>
        <textarea
          className={[styles.input, styles.textarea].join(' ')}
          id="message"
          name="message"
          rows={compact ? 3 : 5}
        />
      </div>

      {/* Honeypot */}
      <div className={styles.honey} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.actions}>
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className={['small', styles.aside].join(' ')}>
          Or call Angus on{' '}
          <a href={contact.phoneHref} className={styles.inlineLink}>
            {contact.phone}
          </a>
          .
        </p>
      </div>

      <p className={['small', styles.status].join(' ')} role="status" aria-live="polite">
        {status === 'ok' && 'Thank you — that has come through. Angus will be in touch.'}
        {status === 'error' &&
          `That did not send. Please call ${contact.phone} or email ${contact.email}.`}
        {status === 'not-configured' &&
          `This form is not connected yet. Please call ${contact.phone} or email ${contact.email}.`}
      </p>
    </form>
  )
}

type FieldProps = {
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
}

function Field({ name, label, type = 'text', required, autoComplete }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <input
        className={styles.input}
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  )
}
