import { useState } from 'react'
import type { Course, Message } from './lib/database'

type MessagesPageProps = {
  courses: Course[]
  messages: Message[]
  studentName: string
  onAddMessage: (courseId: string, body: string) => void
}

function MessagesPage({ courses, messages, studentName, onAddMessage }: MessagesPageProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '')
  const [messageBody, setMessageBody] = useState('')
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]
  const courseMessages = messages.filter((message) => message.courseId === selectedCourse?.id)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = messageBody.trim()
    if (!selectedCourse || !body) return

    onAddMessage(selectedCourse.id, body)
    setMessageBody('')
  }

  return (
    <section className="messages-page" id="messages">
      <header className="messages-page-header">
        <div>
          <p className="eyebrow">Class community</p>
          <h1>Messages</h1>
          <p>Ask questions, share ideas, and stay connected with your classmates and teachers.</p>
        </div>
        <span className="message-student-label">Posting as {studentName}</span>
      </header>

      <div className="messages-layout">
        <aside className="message-course-list" aria-label="Class conversations">
          <div className="panel-header">
            <h2>Your classes</h2>
          </div>
          {courses.map((course) => {
            const count = messages.filter((message) => message.courseId === course.id).length
            return (
              <button
                type="button"
                key={course.id}
                className={selectedCourse?.id === course.id ? 'selected' : ''}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <span>
                  <strong>{course.name}</strong>
                  <small>{course.teacher}</small>
                </span>
                <em>{count}</em>
              </button>
            )
          })}
        </aside>

        <section className="message-thread" aria-live="polite">
          {selectedCourse ? (
            <>
              <div className="message-thread-header">
                <div>
                  <p className="eyebrow">Class channel</p>
                  <h2>{selectedCourse.name}</h2>
                  <p>Teacher: {selectedCourse.teacher}</p>
                </div>
                <span className="badge">{courseMessages.length} messages</span>
              </div>

              <div className="message-list">
                {courseMessages.length > 0 ? courseMessages.map((message) => (
                  <article className={`message-bubble ${message.author === studentName ? 'own-message' : ''}`} key={message.id}>
                    <div className="message-meta">
                      <strong>{message.author}</strong>
                      <time>{message.createdAt}</time>
                    </div>
                    <p>{message.body}</p>
                  </article>
                )) : (
                  <div className="message-empty">
                    <strong>Start the conversation</strong>
                    <p>Be the first student to post in this class channel.</p>
                  </div>
                )}
              </div>

              <form className="message-compose" onSubmit={handleSubmit}>
                <textarea
                  rows={3}
                  placeholder={`Message the ${selectedCourse.name} class...`}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  required
                />
                <button type="submit" className="primary-btn">Send message</button>
              </form>
            </>
          ) : <div className="message-empty"><strong>No classes available</strong></div>}
        </section>
      </div>
    </section>
  )
}

export default MessagesPage