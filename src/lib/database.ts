export type Course = {
  id: string
  name: string
  teacher: string
  progress: number
  badge: string
}

export type Task = {
  id: string
  title: string
  course: string
  due: string
  status: string
}

export type ScheduleItem = {
  id: string
  day: string
  slot: string
  label: string
  active: boolean
}

export type Announcement = string

export type Account = {
  name: string
  username: string
  email: string
  password: string
}

export type SchoolData = {
  student: {
    name: string
    grade: string
    section: string
  }
  stats: Array<{ label: string; value: string; tone: string }>
  courses: Course[]
  tasks: Task[]
  schedule: ScheduleItem[]
  announcements: Announcement[]
}

const STORAGE_KEY = 'educampus-school-db-v1'
const ACCOUNTS_KEY = 'educampus-accounts-v1'

const defaultAccounts: Account[] = [
  {
    name: 'Amelia Scott',
    username: 'amelia.scott',
    email: 'student@educampus.edu',
    password: 'password123',
  },
]

export const defaultSchoolData: SchoolData = {
  student: {
    name: 'Amelia Scott',
    grade: 'Grade 10',
    section: 'Section A',
  },
  stats: [
    { label: 'Courses', value: '8', tone: 'blue' },
    { label: 'Completion', value: '86%', tone: 'green' },
    { label: 'Points', value: '1,240', tone: 'purple' },
    { label: 'Streak', value: '17 days', tone: 'orange' },
  ],
  courses: [
    { id: 'bio', name: 'Biology', teacher: 'Dr. Smith', progress: 82, badge: 'Live class' },
    { id: 'math', name: 'Mathematics', teacher: 'Mr. Owen', progress: 91, badge: 'Top score' },
    { id: 'lit', name: 'Literature', teacher: 'Ms. Vega', progress: 73, badge: 'Reading' },
    { id: 'code', name: 'Coding Lab', teacher: 'Mr. Hall', progress: 95, badge: 'New' },
  ],
  tasks: [
    { id: 'essay', title: 'Essay Draft', course: 'Literature', due: 'Due today', status: 'In review' },
    { id: 'quiz', title: 'Quiz Practice', course: 'Mathematics', due: 'Due tomorrow', status: 'Ready' },
    { id: 'lab', title: 'Lab Reflection', course: 'Biology', due: 'Friday', status: 'Pending' },
  ],
  schedule: [
    { id: 'mon', day: 'Mon', slot: '9:00 AM', label: 'Algebra', active: true },
    { id: 'tue', day: 'Tue', slot: '11:00 AM', label: 'Biology', active: false },
    { id: 'wed', day: 'Wed', slot: '1:30 PM', label: 'Coding', active: true },
    { id: 'thu', day: 'Thu', slot: '10:00 AM', label: 'Literature', active: false },
  ],
  announcements: [
    'Your chemistry tutor left a new video lesson for you.',
    'The school counselling session is available on Friday.',
    'New assignment feedback is ready in the portal.',
  ],
}

export function loadSchoolData(): SchoolData {
  if (typeof window === 'undefined') {
    return defaultSchoolData
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return defaultSchoolData
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SchoolData>
    return {
      ...defaultSchoolData,
      ...parsed,
      student: { ...defaultSchoolData.student, ...parsed.student },
      stats: parsed.stats?.length ? parsed.stats : defaultSchoolData.stats,
      courses: parsed.courses?.length ? parsed.courses : defaultSchoolData.courses,
      tasks: parsed.tasks?.length ? parsed.tasks : defaultSchoolData.tasks,
      schedule: parsed.schedule?.length ? parsed.schedule : defaultSchoolData.schedule,
      announcements: parsed.announcements?.length ? parsed.announcements : defaultSchoolData.announcements,
    }
  } catch {
    return defaultSchoolData
  }
}

export function saveSchoolData(data: SchoolData) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function persistTaskStatus(taskId: string, status: string) {
  const current = loadSchoolData()
  const updatedTasks = current.tasks.map((task) =>
    task.id === taskId ? { ...task, status } : task,
  )

  const next = { ...current, tasks: updatedTasks }
  saveSchoolData(next)
  return next
}

export function addTask(task: Omit<Task, 'id'>) {
  const current = loadSchoolData()
  const nextTask: Task = {
    ...task,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  }

  const next = {
    ...current,
    tasks: [nextTask, ...current.tasks],
  }

  saveSchoolData(next)
  return next
}

export function addAnnouncement(message: string) {
  const current = loadSchoolData()
  const trimmed = message.trim()
  if (!trimmed) {
    return current
  }

  const next = {
    ...current,
    announcements: [trimmed, ...current.announcements],
  }

  saveSchoolData(next)
  return next
}

export function updateStudent(student: SchoolData['student']) {
  const current = loadSchoolData()
  const next = {
    ...current,
    student,
  }

  saveSchoolData(next)
  return next
}

export function loadAccounts(): Account[] {
  if (typeof window === 'undefined') {
    return defaultAccounts
  }

  const raw = window.localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) {
    return defaultAccounts
  }

  try {
    const parsed = JSON.parse(raw) as Account[]
    return parsed.length ? parsed : defaultAccounts
  } catch {
    return defaultAccounts
  }
}

export function saveAccount(account: Account): Account[] {
  const nextAccounts = [...loadAccounts(), account]

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts))
  }

  return nextAccounts
}
