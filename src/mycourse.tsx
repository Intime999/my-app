import { useState } from 'react'
import type { Course } from './lib/database'

type MyCourseProps = {
  courses: Course[]
  selectedCourseId?: string
  onSelectCourse?: (courseId: string) => void
  onAddCourse?: (name: string, teacher: string) => void
  onRemoveCourse?: (courseId: string) => void
}

function MyCourse({ courses, selectedCourseId, onSelectCourse, onAddCourse, onRemoveCourse }: MyCourseProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [teacherName, setTeacherName] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!courseName.trim() || !teacherName.trim()) {
      return
    }

    onAddCourse?.(courseName, teacherName)
    setCourseName('')
    setTeacherName('')
    setShowAddForm(false)
  }

  return (
    <section className="my-course-page" id="mycourses">
      <div className="my-course-header">
        <div>
          <p className="eyebrow">Learning hub</p>
          <h2>My courses</h2>
          <p>Choose a course to open its workspace and continue learning.</p>
        </div>
        <div className="my-course-actions">
          <span className="catalog-count">{courses.length} courses</span>
          <button type="button" className="small-btn" onClick={() => setShowAddForm((current) => !current)}>
            {showAddForm ? 'Close' : 'Add course'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="my-course-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Course name" value={courseName} onChange={(event) => setCourseName(event.target.value)} />
          <input type="text" placeholder="Teacher name" value={teacherName} onChange={(event) => setTeacherName(event.target.value)} />
          <button type="submit" className="small-btn">Save course</button>
        </form>
      )}

      <div className="my-course-grid">
        {courses.map((course) => (
          <article className={`my-course-card saved-course ${course.id === selectedCourseId ? 'selected-course' : ''}`} key={course.id}>
            <span className="course-provider">Your course</span>
            <h3>{course.name}</h3>
            <p>{course.teacher} - {course.progress}% complete</p>
            <div className="course-card-actions">
              <button type="button" className="small-btn" onClick={() => onSelectCourse?.(course.id)}>
                {course.id === selectedCourseId ? 'Selected course' : 'Choose course'}
              </button>
              <button type="button" className="remove-course-btn" onClick={() => onRemoveCourse?.(course.id)}>Remove</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MyCourse
