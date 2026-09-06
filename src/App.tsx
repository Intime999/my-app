import { useEffect, useState } from 'react'
import { defaultSchoolData, loadSchoolData, saveSchoolData, type SchoolData } from './lib/database'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState<SchoolData>(defaultSchoolData)

  useEffect(() => {
    const saved = loadSchoolData()
    setData(saved)
  }, [])

  useEffect(() => {
    saveSchoolData(data)
  }, [data])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoggedIn(true)
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
            <p>Welcome back</p>
            <h2>Student login</h2>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Email address
              <input type="email" defaultValue="student@educampus.edu" />
            </label>

            <label>
              Password
              <input type="password" defaultValue="password123" />
            </label>

            <div className="row-inline">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="primary-btn">Log in</button>
          </form>

          <div className="divider">or continue with</div>

          <div className="social-actions">
            <button type="button">Google</button>
            <button type="button">Microsoft</button>
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
          <a className="active" href="#">Dashboard</a>
          <a href="#">My courses</a>
          <a href="#">Assignments</a>
          <a href="#">Grades</a>
          <a href="#">Calendar</a>
          <a href="#">Messages</a>
        </nav>

        <div className="profile-card">
          <p className="label">Student</p>
          <h3>{data.student.name}</h3>
          <span>
            {data.student.grade} • {data.student.section}
          </span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Good morning</p>
            <h1>Welcome back, {data.student.name.split(' ')[0]}</h1>
          </div>
          <button type="button" className="primary-btn">Join live class</button>
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

        <section className="stats-grid">
          {data.stats.map((item) => (
            <article key={item.label} className={`stat-card ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>My courses</h3>
              <a href="#">View all</a>
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

          <div className="panel">
            <div className="panel-header">
              <h3>Upcoming tasks</h3>
              <a href="#">Open planner</a>
            </div>
            <ul className="assignment-list">
              {data.tasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <h4>{task.title}</h4>
                    <p>
                      {task.course} • {task.due}
                    </p>
                  </div>
                  <span className="tag">{task.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
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

          <div className="panel">
            <div className="panel-header">
              <h3>Announcements</h3>
            </div>
            <ul className="announcement-list">
              {data.announcements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="quick-actions">
              <button type="button">Study notes</button>
              <button type="button">Meet tutor</button>
              <button type="button">Submit work</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
