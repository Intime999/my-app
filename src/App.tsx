import { useEffect, useState } from 'react'
import { addAnnouncement, addTask, defaultSchoolData, loadAccounts, loadSchoolData, saveAccount, saveSchoolData, type Account, type SchoolData } from './lib/database'
import './App.css'

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'My courses', href: '#courses' },
  { label: 'Assignments', href: '#assignments' },
  { label: 'Grades', href: '#grades' },
  { label: 'Calendar', href: '#calendar' },
  { label: 'Messages', href: '#messages' },
]

const statusOptions = ['Ready', 'In review', 'Pending', 'Completed']

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'signup' | 'username'>('login')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [authForm, setAuthForm] = useState({
    name: '',
    username: '',
    email: 'student@educampus.edu',
    password: 'password123',
  })
  const [data, setData] = useState<SchoolData>(defaultSchoolData)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    course: 'Mathematics',
    due: 'Tomorrow',
    status: 'Ready',
  })
  const [newAnnouncement, setNewAnnouncement] = useState('')

  useEffect(() => {
    const saved = loadSchoolData()
    setData(saved)
    setAccounts(loadAccounts())
  }, [])

  useEffect(() => {
    saveSchoolData(data)
  }, [data])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const account = accounts.find(
      (item) => (item.email === authForm.email || item.username === authForm.email) && item.password === authForm.password,
    )

    if (!account) {
      setAuthError('That email, username, or password is not correct.')
      return
    }

    setAuthError('')
    setData((current) => ({ ...current, student: { ...current.student, name: account.name } }))
    setIsLoggedIn(true)
  }

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = authForm.name.trim()
    const trimmedUsername = authForm.username.trim().toLowerCase()
    const trimmedEmail = authForm.email.trim().toLowerCase()

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !authForm.password) {
      setAuthError('Complete every field to create your account.')
      return
    }

    if (accounts.some((account) => account.username === trimmedUsername || account.email === trimmedEmail)) {
      setAuthError('That username or email is already registered.')
      return
    }

    const account = { name: trimmedName, username: trimmedUsername, email: trimmedEmail, password: authForm.password }
    setAccounts(saveAccount(account))
    setData((current) => ({ ...current, student: { ...current.student, name: trimmedName } }))
    setAuthError('')
    setIsLoggedIn(true)
  }

  const handleForgotUsername = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const account = accounts.find((item) => item.email === authForm.email.trim().toLowerCase())

    if (!account) {
      setAuthError('No account was found with that email address.')
      setAuthMessage('')
      return
    }

    setAuthError('')
    setAuthMessage(`Your username is ${account.username}.`)
  }

  const switchLoginMode = (mode: 'login' | 'signup' | 'username') => {
    setLoginMode(mode)
    setAuthError('')
    setAuthMessage('')
  }

  const handleTaskStatusChange = (taskId: string, status: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    }))
  }

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!newTask.title.trim()) {
      return
    }

    const nextTask = {
      title: newTask.title.trim(),
      course: newTask.course,
      due: newTask.due,
      status: newTask.status,
    }

    const inserted = addTask(nextTask)
    setData(inserted)
    setNewTask({ title: '', course: 'Mathematics', due: 'Tomorrow', status: 'Ready' })
    setShowTaskForm(false)
  }

  const handleAddAnnouncement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const inserted = addAnnouncement(newAnnouncement)
    setData(inserted)
    setNewAnnouncement('')
    setShowAnnouncementForm(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-hero">
          <div className="brand-row">
            <div className="brand-mark">E</div>
            <span>EduDev</span>
          </div>

          <h1>Learn smarter with a digital school experience.</h1>
          <p>
            Access your courses, lessons, schedules, and academic progress in one place.
          </p>

          <div className="feature-list">
            <div>
              <strong>120+</strong>
              <span>online lessons</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>student satisfaction</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>learning access</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-header">
            <p>{loginMode === 'signup' ? 'New student' : loginMode === 'username' ? 'Account help' : 'Welcome back'}</p>
            <h2>{loginMode === 'signup' ? 'Create your account' : loginMode === 'username' ? 'Find your username' : 'Student login'}</h2>
          </div>

          <form onSubmit={loginMode === 'signup' ? handleSignUp : loginMode === 'username' ? handleForgotUsername : handleLogin} className="login-form">
            {loginMode === 'signup' && (
              <label>
                Full name
                <input type="text" value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
            )}

            {loginMode === 'signup' && (
              <label>
                Username
                <input type="text" value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} />
              </label>
            )}

            <label>
              Email address
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} />
            </label>

            {loginMode !== 'username' && (
              <label>
                Password
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} />
              </label>
            )}

            {loginMode === 'login' && (
              <div className="row-inline">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Remember me
                </label>
                <button type="button" className="text-btn" onClick={() => switchLoginMode('username')}>Forgot username?</button>
              </div>
            )}

            {authError && <p className="auth-message error">{authError}</p>}
            {authMessage && <p className="auth-message success">{authMessage}</p>}
            <button type="submit" className="primary-btn">{loginMode === 'signup' ? 'Create account' : loginMode === 'username' ? 'Find username' : 'Log in'}</button>
          </form>

          <div className="auth-links">
            {loginMode === 'login' && <button type="button" className="text-btn" onClick={() => switchLoginMode('signup')}>Create a new account</button>}
            {loginMode !== 'login' && <button type="button" className="text-btn" onClick={() => switchLoginMode('login')}>Back to login</button>}
          </div>

          <div className="divider">or continue with</div>

          <div className="social-actions">
            <a href="https://www.google.com" target="_blank" rel="noreferrer">Google</a>
            <a href="https://www.microsoft.com" target="_blank" rel="noreferrer">Microsoft</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="school-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <p className="eyebrow">Learning portal</p>
            <h2>EDuDev</h2>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <a key={item.label} className={item.href === '#dashboard' ? 'active' : ''} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="profile-card">
          <p className="label">Student</p>
          <h3>{data.student.name}</h3>
          <span>
            {data.student.grade} • {data.student.section}
          </span>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Good morning</p>
            <h1>Welcome back, {data.student.name.split(' ')[0]}</h1>
          </div>
          <button type="button" className="primary-btn" onClick={() => setShowTaskForm((current) => !current)}>
            {showTaskForm ? 'Close form' : 'Add task'}
          </button>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <span className="chip">This week</span>
            <h2>Your learning momentum is strong.</h2>
            <p>
              You have completed 86% of your weekly learning goals and have 3 tasks due soon.
            </p>
          </div>
          <div className="progress-ring">
            <div className="ring-inner">
              <strong>86%</strong>
              <span>on track</span>
            </div>
          </div>
        </section>

        <section className="stats-grid" id="grades">
          {data.stats.map((item) => (
            <article key={item.label} className={`stat-card ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel" id="courses">
            <div className="panel-header">
              <h3>My courses</h3>
              <a href="#courses">View all</a>
            </div>
            <ul className="class-list">
              {data.courses.map((course) => (
                <li key={course.id}>
                  <div>
                    <h4>{course.name}</h4>
                    <p>{course.teacher}</p>
                  </div>
                  <div className="course-meta">
                    <span className="badge">{course.badge}</span>
                    <strong>{course.progress}%</strong>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel" id="assignments">
            <div className="panel-header">
              <h3>Upcoming tasks</h3>
              <a href="#assignments">Open planner</a>
            </div>

            {showTaskForm && (
              <form className="inline-form" onSubmit={handleAddTask}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Course"
                  value={newTask.course}
                  onChange={(event) => setNewTask((current) => ({ ...current, course: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Due date"
                  value={newTask.due}
                  onChange={(event) => setNewTask((current) => ({ ...current, due: event.target.value }))}
                />
                <select
                  value={newTask.status}
                  onChange={(event) => setNewTask((current) => ({ ...current, status: event.target.value }))}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="submit" className="small-btn">Save task</button>
              </form>
            )}

            <ul className="assignment-list">
              {data.tasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <h4>{task.title}</h4>
                    <p>
                      {task.course} • {task.due}
                    </p>
                  </div>
                  <select
                    className="status-select"
                    value={task.status}
                    onChange={(event) => handleTaskStatusChange(task.id, event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel" id="calendar">
            <div className="panel-header">
              <h3>Weekly schedule</h3>
            </div>
            <div className="schedule-grid">
              {data.schedule.map((item) => (
                <div key={item.id} className={`day-card ${item.active ? 'highlight' : ''}`}>
                  <span>{item.day}</span>
                  <strong>{item.label}</strong>
                  <small>{item.slot}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" id="messages">
            <div className="panel-header">
              <h3>Announcements</h3>
              <button type="button" className="ghost-btn" onClick={() => setShowAnnouncementForm((current) => !current)}>
                {showAnnouncementForm ? 'Close' : 'Add'}
              </button>
            </div>

            {showAnnouncementForm && (
              <form className="inline-form" onSubmit={handleAddAnnouncement}>
                <input
                  type="text"
                  placeholder="New announcement"
                  value={newAnnouncement}
                  onChange={(event) => setNewAnnouncement(event.target.value)}
                />
                <button type="submit" className="small-btn">Post</button>
              </form>
            )}

            <ul className="announcement-list">
              {data.announcements.map((item) => (
                <li key={`${item}-${createId()}`}>{item}</li>
              ))}
            </ul>

            <div className="quick-actions" id="reset-password">
              <a href="#courses">Study notes</a>
              <a href="#messages">Meet tutor</a>
              <a href="#assignments">Submit work</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
