import { useState } from 'react'
import type { Course, Task } from './lib/database'

type AssignmentsPageProps = {
  courses: Course[]
  tasks: Task[]
  statusOptions: string[]
  onStatusChange: (taskId: string, status: string) => void
  onAddTask: () => void
}

function AssignmentsPage({ courses, tasks, statusOptions, onStatusChange, onAddTask }: AssignmentsPageProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const activeTask = tasks.find((task) => task.id === activeTaskId)

  return (
    <section className="assignments-page" id="assignments">
      <header className="assignments-page-header">
        <div>
          <p className="eyebrow">Independent study</p>
          <h1>Take-home assignments</h1>
          <p>Keep every subject's work in one place and pick up where you left off.</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAddTask}>Add assignment</button>
      </header>

      <div className="assignment-summary">
        <div><strong>{tasks.length}</strong><span>Total assignments</span></div>
        <div><strong>{completedTasks}</strong><span>Completed</span></div>
        <div><strong>{tasks.length - completedTasks}</strong><span>Still to do</span></div>
      </div>

      <div className="subject-assignment-grid">
        {courses.map((course) => {
          const subjectTasks = tasks.filter((task) => task.course.toLowerCase() === course.name.toLowerCase())
          const completedSubjectTasks = subjectTasks.filter((task) => task.status === 'Completed').length

          return (
            <article className="subject-assignment-card" key={course.id}>
              <div className="subject-card-header">
                <div>
                  <span className="course-provider">{course.badge}</span>
                  <h2>{course.name}</h2>
                  <p>{course.teacher}</p>
                </div>
                <span className="subject-count">{completedSubjectTasks}/{subjectTasks.length}</span>
              </div>

              <div className="subject-progress" aria-label={`${completedSubjectTasks} of ${subjectTasks.length} assignments completed`}>
                <span style={{ width: `${subjectTasks.length ? (completedSubjectTasks / subjectTasks.length) * 100 : 0}%` }} />
              </div>

              {subjectTasks.length > 0 ? (
                <ul className="take-home-list">
                  {subjectTasks.map((task) => (
                    <li key={task.id}>
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.due}</p>
                      </div>
                      <div className="task-actions">
                        <span className={`task-status ${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span>
                        <button type="button" className="small-btn task-open-btn" onClick={() => setActiveTaskId(task.id)}>
                          {task.status === 'Completed' ? 'Review' : 'Open task'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-subject">No take-home assignments yet.</p>}
            </article>
          )
        })}
      </div>

      {activeTask && (
        <div className="task-workspace" aria-live="polite">
          <div>
            <p className="eyebrow">Task workspace</p>
            <h2>{activeTask.title}</h2>
            <p>{activeTask.course} - {activeTask.due}</p>
            <div className="task-instructions">
              <strong>What to do</strong>
              <p>{activeTask.instructions || 'Review the lesson notes and complete the assigned work carefully.'}</p>
              <span>Suggested time: {activeTask.estimatedTime || '20 minutes'}</span>
            </div>
          </div>
          <div className="task-workspace-actions">
            <label>
              Progress
              <select
                className="status-select"
                value={activeTask.status}
                onChange={(event) => onStatusChange(activeTask.id, event.target.value)}
              >
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <button
              type="button"
              className="primary-btn"
              onClick={() => onStatusChange(activeTask.id, activeTask.status === 'Completed' ? 'Ready' : 'Completed')}
            >
              {activeTask.status === 'Completed' ? 'Reopen task' : 'Mark as complete'}
            </button>
            <button type="button" className="ghost-btn" onClick={() => setActiveTaskId(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AssignmentsPage