import { useState } from 'react'
import type { Account } from './lib/database'

type StudentsPageProps = {
  accounts: Account[]
  onAddStudent: (student: Account) => string | null
}

function StudentsPage({ accounts, onAddStudent }: StudentsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const student = {
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    }
    const message = onAddStudent(student)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setForm({ name: '', username: '', email: '', password: '' })
    setShowForm(false)
  }

  return (
    <section className="students-page" id="students">
      <header className="students-page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Student control panel</h1>
          <p>Add student accounts and manage who can access the learning portal.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Close form' : 'Add student'}
        </button>
      </header>

      {showForm && (
        <form className="student-form" onSubmit={handleSubmit}>
          <h2>Create a student account</h2>
          <div className="student-form-grid">
            <input type="text" placeholder="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <input type="text" placeholder="Username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required />
            <input type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <input type="password" placeholder="Temporary password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </div>
          {error && <p className="student-form-error">{error}</p>}
          <button type="submit" className="small-btn">Create account</button>
        </form>
      )}

      <section className="student-list-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Portal access</p>
            <h2>Students</h2>
          </div>
          <span className="badge">{accounts.length} accounts</span>
        </div>
        <div className="student-list">
          {accounts.map((account) => (
            <article className="student-row" key={account.username}>
              <div className="student-avatar">{account.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{account.name}</h3>
                <p>@{account.username} · {account.email}</p>
              </div>
              <span className="student-status">Active</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default StudentsPage