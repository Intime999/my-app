import { useEffect, useState } from 'react'
import { addAnnouncement, addTask, defaultSchoolData, loadAccounts, loadAccountsFromDatabase, loadSchoolData, loadSchoolDataFromDatabase, migrateDataToDatabase, saveAccount, saveAccountToDatabase, saveSchoolData, saveSchoolDataToDatabase, type Account, type SchoolData } from './lib/database'
import MyCourse from './mycourse'
import './App.css'

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'My courses', href: '#mycourses' },
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
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses'>('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState('bio')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: '',
    teacher: '',
    progress: 0,
    badge: 'New course',
  })
  const [newTask, setNewTask] = useState({
    title: '',
    course: 'Mathematics',
    due: 'Tomorrow',
    status: 'Ready',
  })
  const [newAnnouncement, setNewAnnouncement] = useState('')

  useEffect(() => {
    const hydrate = async () => {
      const localData = loadSchoolData()
      const localAccounts = loadAccounts()
      const [remoteData, remoteAccounts] = await Promise.all([
        loadSchoolDataFromDatabase(),
        loadAccountsFromDatabase(),
      ])

      const shouldMigrate = !remoteData || !remoteAccounts?.length
      const migrated = shouldMigrate
        ? await migrateDataToDatabase(localData, localAccounts)
        : null

      setData(migrated?.data ?? remoteData ?? localData)
      setAccounts(migrated?.accounts ?? remoteAccounts ?? localAccounts)
      setIsHydrated(true)
    }

    void hydrate()
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    saveSchoolData(data)
    void saveSchoolDataToDatabase(data)
  }, [data, isHydrated])

  const selectedCourse = data.courses.find((course) => course.id === selectedCourseId) ?? data.courses[0]
  const selectedCourseTasks = data.tasks.filter((task) => task.course === selectedCourse?.name)

  const openCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    window.history.replaceState(null, '', `#course-${courseId}`)
    document.getElementById('course-workspace')?.scrollIntoView({ behavior: 'smooth' })
  }

  const chooseCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setCurrentView('dashboard')
    window.history.replaceState(null, '', `#course-${courseId}`)
    window.requestAnimationFrame(() => {
      document.getElementById('course-workspace')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const addCourseFromPage = (name: string, teacher: string) => {
    const course = {
      id: createId(),
      name: name.trim(),
      teacher: teacher.trim(),
      progress: 0,
      badge: 'New course',
    }
    setData((current) => ({ ...current, courses: [course, ...current.courses] }))
    setSelectedCourseId(course.id)
  }

  const removeCourseFromPage = (courseId: string) => {
    setData((current) => {
      const courses = current.courses.filter((course) => course.id !== courseId)
      return { ...current, courses }
    })

    if (selectedCourseId === courseId) {
      const nextCourse = data.courses.find((course) => course.id !== courseId)
      setSelectedCourseId(nextCourse?.id ?? '')
    }
  }

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
    void saveAccountToDatabase(account)
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
    void saveSchoolDataToDatabase(inserted)
    setNewTask({ title: '', course: 'Mathematics', due: 'Tomorrow', status: 'Ready' })
    setShowTaskForm(false)
  }

  const handleAddCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newCourse.name.trim() || !newCourse.teacher.trim()) {
      return
    }

    const course = {
      ...newCourse,
      id: createId(),
      name: newCourse.name.trim(),
      teacher: newCourse.teacher.trim(),
    }
    const next = { ...data, courses: [course, ...data.courses] }
    setData(next)
    setSelectedCourseId(course.id)
    setNewCourse({ name: '', teacher: '', progress: 0, badge: 'New course' })
    setShowCourseForm(false)
  }

  const handleAddAnnouncement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const inserted = addAnnouncement(newAnnouncement)
    setData(inserted)
    void saveSchoolDataToDatabase(inserted)
    setNewAnnouncement('')
    setShowAnnouncementForm(false)
  }

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#mycourses') {
      event.preventDefault()
      setCurrentView('courses')
      return
    }

    if (href === '#dashboard') {
      event.preventDefault()
      setCurrentView('dashboard')
    }
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
            <a
              key={item.label}
              className={(item.href === '#dashboard' && currentView === 'dashboard') || (item.href === '#mycourses' && currentView === 'courses') ? 'active' : ''}
              href={item.href}
              onClick={(event) => handleNavigation(event, item.href)}
            >
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

      <main className="main-content" id={currentView === 'dashboard' ? 'dashboard' : 'mycourses'}>
        {currentView === 'courses' ? (
          <MyCourse
            courses={data.courses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={chooseCourse}
            onAddCourse={addCourseFromPage}
            onRemoveCourse={removeCourseFromPage}
          />
        ) : (
          <>
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
              <div className="panel-actions">
                <button type="button" className="ghost-btn" onClick={() => setShowCourseForm((current) => !current)}>
                  {showCourseForm ? 'Close' : 'Add course'}
                </button>
                <a href="#course-workspace">View workspace</a>
              </div>
            </div>
            {showCourseForm && (
              <form className="inline-form course-form" onSubmit={handleAddCourse}>
                <input type="text" placeholder="Course name" value={newCourse.name} onChange={(event) => setNewCourse((current) => ({ ...current, name: event.target.value }))} />
                <input type="text" placeholder="Teacher" value={newCourse.teacher} onChange={(event) => setNewCourse((current) => ({ ...current, teacher: event.target.value }))} />
                <input type="number" min="0" max="100" placeholder="Progress" value={newCourse.progress} onChange={(event) => setNewCourse((current) => ({ ...current, progress: Number(event.target.value) }))} />
                <input type="text" placeholder="Badge" value={newCourse.badge} onChange={(event) => setNewCourse((current) => ({ ...current, badge: event.target.value }))} />
                <button type="submit" className="small-btn">Save course</button>
              </form>
            )}
            <ul className="class-list">
              {data.courses.map((course) => (
                <li key={course.id} className={course.id === selectedCourseId ? 'selected' : ''}>
                  <div>
                    <h4>{course.name}</h4>
                    <p>{course.teacher}</p>
                  </div>
                  <div className="course-meta">
                    <span className="badge">{course.badge}</span>
                    <strong>{course.progress}%</strong>
                    <button type="button" className="small-btn" onClick={() => openCourse(course.id)}>Open course</button>
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

        {selectedCourse && (
          <section className="panel course-workspace" id="course-workspace">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Course workspace</p>
                <h3>{selectedCourse.name}</h3>
              </div>
              <span className="badge">{selectedCourse.badge}</span>
            </div>
            <div className="course-workspace-grid">
              <div>
                <p className="workspace-label">Teacher</p>
                <strong>{selectedCourse.teacher}</strong>
              </div>
              <div>
                <p className="workspace-label">Progress</p>
                <strong>{selectedCourse.progress}% complete</strong>
                <div className="progress-bar"><span style={{ width: `${selectedCourse.progress}%` }} /></div>
              </div>
              <div>
                <p className="workspace-label">Assignments</p>
                <strong>{selectedCourseTasks.length ? `${selectedCourseTasks.length} linked task${selectedCourseTasks.length === 1 ? '' : 's'}` : 'No tasks yet'}</strong>
              </div>
            </div>
            {selectedCourseTasks.length > 0 && (
              <ul className="workspace-task-list">
                {selectedCourseTasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <span>{task.due}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

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
          </>
        )}
      </main>
    </div>
  )
}

export default App
