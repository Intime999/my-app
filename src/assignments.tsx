import type { Course, Task } from './lib/database'

type AssignmentsPageProps = {
  courses: Course[]
  tasks: Task[]
  statusOptions: string[]
  onStatusChange: (taskId: string, status: string) => void
  onAddTask: () => void
}

function AssignmentsPage({ courses, tasks, statusOptions, onStatusChange, onAddTask }: AssignmentsPageProps) {
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length

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
                      <select
                        className={`status-select assignment-status ${task.status.toLowerCase().replaceAll(' ', '-')}`}
                        value={task.status}
                        aria-label={`Status for ${task.title}`}
                        onChange={(event) => onStatusChange(task.id, event.target.value)}
                      >
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-subject">No take-home assignments yet.</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default AssignmentsPage