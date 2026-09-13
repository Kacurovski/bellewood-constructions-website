import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { submitToPipeline } from '../lib/pipeline'
import type { SubmitResult } from '../lib/pipeline'
import { contact } from '../config/site'
import styles from './EnquiryForm.module.css'

/** The fields a person has to fill in before the enquiry will send. */
type Required = 'firstName' | 'lastName' | 'email' | 'phone'
type Errors = Partial<Record<Required, string>>

/* The order a person meets them in, top to bottom and left to right, so the
   first one to fix is the one focus lands on. */
const REQUIRED_ORDER: Required[] = ['firstName', 'lastName', 'email', 'phone']

/**
 * Checks one field. Deliberately forgiving about format: an email needs an @
 * and a dot after it, and a phone number needs at least eight digits in any
 * arrangement of spaces, brackets, dashes and a leading plus. Anything stricter
 * turns away a real person who writes their number the way they always have,
 * and one lost enquiry costs more than a malformed one that Angus can ring back.
 */
function check(field: Required, raw: string): string | undefined {
  const value = raw.trim()
  switch (field) {
    case 'firstName':
      return value ? undefined : 'Please add your first name.'
    case 'lastName':
      return value ? undefined : 'Please add your last name.'
    case 'email':
      if (!value) return 'Please add your email.'
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'That email does not look quite right.'
    case 'phone': {
      if (!value) return 'Please add a phone number.'
      const digits = value.replace(/\D/g, '')
      const shape = /^[\d\s+()-]+$/.test(value)
      return shape && digits.length >= 8 ? undefined : 'That number does not look quite right.'
    }
  }
}

/**
 * The enquiry form. This is the point of the site.
 *
 * Deliberately short. Someone weighing up a major renovation is not going to
 * fill in a project-budget dropdown on a first visit, and asking for one costs
 * more enquiries than it qualifies. Name, contact, suburb, and room to say what
 * the job is.
 *
 * First name, last name, email and phone are required, and that is now true in
 * the code and not only in the asterisks. The form has always switched off the
 * browser's own validation — its bubbles are unstyled and inconsistent between
 * browsers — but nothing replaced it, so the fields marked required never
 * stopped anything and an empty form sent. It checks them itself now: every
 * missing or malformed field is marked and explained under its own rule, focus
 * goes to the first one, and the enquiry does not leave until they are right.
 * Phone is required because Angus answers enquiries by ringing them, and the
 * missed-call text-back on his number is the first thing this engagement
 * switched on.
 *
 * First and last name travel separately, because that is how the CRM stores a
 * contact. The combined `name` still goes too, so a webhook mapping built
 * around it keeps working.
 *
 * The honeypot field catches the bots that would otherwise fill the pipeline
 * with noise. It is not a captcha and it is not perfect, but it is free and it
 * does not make a real person prove anything.
 */
export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'invalid' | SubmitResult>('idle')
  const [errors, setErrors] = useState<Errors>({})

  /* Prefixed ids. The form renders on the home page and on /contact, and a
     label is only tied to its input while the id is unique on the page. */
  const uid = useId()
  const id = (field: string) => `${uid}-${field}`

  /* Once a field has been flagged, it is re-checked as it is typed into, so the
     message goes away the moment it is fixed rather than on the next submit.
     A field that was never flagged is left alone while someone is typing. */
  function recheck(field: Required, value: string) {
    if (!errors[field]) return
    setErrors((current) => ({ ...current, [field]: check(field, value) }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const read = (key: string) => String(data.get(key) ?? '').trim()

    // Honeypot. A real person never fills this in; it is hidden from view and
    // from screen readers alike.
    if (data.get('company')) {
      setStatus('ok')
      form.reset()
      return
    }

    const found: Errors = {}
    for (const field of REQUIRED_ORDER) {
      const message = check(field, read(field))
      if (message) found[field] = message
    }
    setErrors(found)

    const first = REQUIRED_ORDER.find((field) => found[field])
    if (first) {
      setStatus('invalid')
      form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
      return
    }

    setStatus('sending')
    const firstName = read('firstName')
    const lastName = read('lastName')
    const result = await submitToPipeline({
      source: 'website-enquiry',
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: read('email'),
      phone: read('phone'),
      suburb: read('suburb'),
      message: read('message'),
    })

    setStatus(result)
    if (result === 'ok') {
      form.reset()
      setErrors({})
    }
  }

  const sending = status === 'sending'

  return (
    <form className={[styles.form, compact ? styles.compact : ''].join(' ')} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <Field
          id={id('firstName')}
          name="firstName"
          label="First name"
          autoComplete="given-name"
          required
          error={errors.firstName}
          onValue={(v) => recheck('firstName', v)}
        />
        <Field
          id={id('lastName')}
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          required
          error={errors.lastName}
          onValue={(v) => recheck('lastName', v)}
        />
      </div>

      <div className={styles.row}>
        <Field
          id={id('email')}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email}
          onValue={(v) => recheck('email', v)}
        />
        <Field
          id={id('phone')}
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          error={errors.phone}
          onValue={(v) => recheck('phone', v)}
        />
      </div>

      <Field id={id('suburb')} name="suburb" label="Suburb" autoComplete="address-level2" />

      <div className={styles.field}>
        <label className={styles.label} htmlFor={id('message')}>
          What are you thinking of building?
        </label>
        <textarea
          className={[styles.input, styles.textarea].join(' ')}
          id={id('message')}
          name="message"
          rows={compact ? 3 : 5}
        />
      </div>

      {/* Honeypot */}
      <div className={styles.honey} aria-hidden="true">
        <label htmlFor={id('company')}>Company</label>
        <input id={id('company')} name="company" type="text" tabIndex={-1} autoComplete="off" />
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
        {status === 'invalid' && 'A few details are missing. They are marked above.'}
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
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
  error?: string
  onValue?: (value: string) => void
}

function Field({ id, name, label, type = 'text', required, autoComplete, error, onValue }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className={[styles.field, error ? styles.invalid : ''].join(' ').trim()}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {/* The asterisk is for the eye. The input's own `required` is what a
            screen reader announces, so the label does not say it a second time. */}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <input
        className={styles.input}
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onInput={onValue ? (event) => onValue(event.currentTarget.value) : undefined}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
