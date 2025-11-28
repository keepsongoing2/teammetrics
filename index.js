import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './index.module.css'

const TeametricConfig = ({ initialEndpointUrl, initialScheduleInterval, onConfigSaved }) => {
  const [endpointUrl, setEndpointUrl] = useState(initialEndpointUrl)
  const [scheduleInterval, setScheduleInterval] = useState(initialScheduleInterval)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'config-saved') {
        setStatusMessage('Configuration saved successfully.')
        if (onConfigSaved) onConfigSaved(e.data.payload)
      }
    }
    window.addEventListener('message', handleMessage, false)
    return () => window.removeEventListener('message', handleMessage, false)
  }, [onConfigSaved])

  const validate = () => {
    const errs = {}
    if (!endpointUrl) {
      errs.endpointUrl = 'Endpoint URL is required.'
    } else {
      try {
        new URL(endpointUrl)
      } catch {
        errs.endpointUrl = 'Enter a valid URL.'
      }
    }
    if (!scheduleInterval) {
      errs.scheduleInterval = 'Schedule interval is required.'
    } else if (!/^\d+$/.test(scheduleInterval)) {
      errs.scheduleInterval = 'Interval must be a number.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    window.parent.postMessage(
      { type: 'save-config', payload: { endpointUrl, scheduleInterval } },
      '*'
    )
  }

  const handleRunNow = () => {
    window.parent.postMessage({ type: 'run-now' }, '*')
  }

  return (
    <div
      id="sidebar-container"
      role="region"
      aria-label="Teametric configuration"
      className={styles.container}
    >
      <form className="grid-container" noValidate>
        <div className={styles.field}>
          <label htmlFor="endpoint-url">API Endpoint URL</label>
          <input
            type="url"
            id="endpoint-url"
            data-route="endpoint-url"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            aria-invalid={!!errors.endpointUrl}
            aria-describedby={errors.endpointUrl ? 'endpoint-url-error' : undefined}
            className={errors.endpointUrl ? 'error-state' : ''}
          />
          {errors.endpointUrl && (
            <span
              id="endpoint-url-error"
              className="error-message"
              data-field="endpoint-url"
              aria-live="polite"
            >
              {errors.endpointUrl}
            </span>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="schedule-interval">Schedule Interval (minutes)</label>
          <input
            type="text"
            id="schedule-interval"
            value={scheduleInterval}
            onChange={(e) => setScheduleInterval(e.target.value)}
            aria-invalid={!!errors.scheduleInterval}
            aria-describedby={errors.scheduleInterval ? 'schedule-interval-error' : undefined}
            className={errors.scheduleInterval ? 'error-state' : ''}
          />
          {errors.scheduleInterval && (
            <span
              id="schedule-interval-error"
              className="error-message"
              data-field="schedule-interval"
              aria-live="polite"
            >
              {errors.scheduleInterval}
            </span>
          )}
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            id="save-config"
            data-commands="save-config"
            onClick={handleSave}
            className={`primary ${styles.button}`}
          >
            Save Configuration
          </button>
          <button
            type="button"
            id="run-now"
            data-commands="run-now"
            onClick={handleRunNow}
            className={`secondary ${styles.button}`}
          >
            Run Now
          </button>
        </div>
      </form>
      {statusMessage && (
        <div className={styles.status} role="status">
          {statusMessage}
        </div>
      )}
    </div>
  )
}

TeametricConfig.propTypes = {
  initialEndpointUrl: PropTypes.string,
  initialScheduleInterval: PropTypes.string,
  onConfigSaved: PropTypes.func,
}

TeametricConfig.defaultProps = {
  initialEndpointUrl: '',
  initialScheduleInterval: '',
  onConfigSaved: null,
}

export default TeametricConfig