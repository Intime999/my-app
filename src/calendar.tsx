import { useState } from 'react'
import type { ScheduleItem } from './lib/database'

type CalendarPageProps = {
  schedule: ScheduleItem[]
  onAddEvent: (event: Omit<ScheduleItem, 'id'>) => void
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function CalendarPage({ schedule, onAddEvent }: CalendarPageProps) {
  const [selectedDay, setSelectedDay] = useState('Mon')
  const [showForm, setShowForm] = useState(false)
  const [eventForm, setEventForm] = useState({ label: '', slot: '9:00 AM' })
  const selectedEvents = schedule.filter((item) => item.day === selectedDay)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!eventForm.label.trim()) return

    onAddEvent({
      day: selectedDay,
      slot: eventForm.slot,
      label: eventForm.label.trim(),
      active: true,
    })
    setEventForm({ label: '', slot: '9:00 AM' })
    setShowForm(false)
  }

  return (
    <section className="calendar-page" id="calendar">
      <header className="calendar-page-header">
        <div>
          <p className="eyebrow">Plan your week</p>
          <h1>Calendar</h1>
          <p>Click a day to see classes, study sessions, and other events.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Close form' : 'Add event'}
        </button>
      </header>

      {showForm && (
        <form className="calendar-form" onSubmit={handleSubmit}>
          <h2>Add event for {selectedDay}</h2>
          <input
            type="text"
            placeholder="Event or class name"
            value={eventForm.label}
            onChange={(event) => setEventForm((current) => ({ ...current, label: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Time"
            value={eventForm.slot}
            onChange={(event) => setEventForm((current) => ({ ...current, slot: event.target.value }))}
            required
          />
          <button type="submit" className="small-btn">Save event</button>
        </form>
      )}

      <div className="calendar-day-tabs" role="tablist" aria-label="Days of the week">
        {days.map((day) => {
          const eventCount = schedule.filter((item) => item.day === day).length
          return (
            <button
              type="button"
              role="tab"
              aria-selected={selectedDay === day}
              className={selectedDay === day ? 'selected' : ''}
              key={day}
              onClick={() => setSelectedDay(day)}
            >
              <strong>{day}</strong>
              <span>{eventCount} {eventCount === 1 ? 'event' : 'events'}</span>
            </button>
          )
        })}
      </div>

      <section className="calendar-events" aria-live="polite">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Selected day</p>
            <h2>{selectedDay}</h2>
          </div>
          <span className="badge">{selectedEvents.length} scheduled</span>
        </div>
        {selectedEvents.length > 0 ? (
          <ul className="calendar-event-list">
            {selectedEvents.map((item) => (
              <li key={item.id} className={item.active ? 'active-event' : ''}>
                <span className="event-time">{item.slot}</span>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.active ? 'Your next scheduled activity' : 'Scheduled activity'}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="calendar-empty">
            <strong>No events planned</strong>
            <p>Use Add event to plan study time or a class.</p>
          </div>
        )}
      </section>
    </section>
  )
}

export default CalendarPage
