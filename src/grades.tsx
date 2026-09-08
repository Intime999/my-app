import type { Course, GradeRecord } from './lib/database'

type GradesPageProps = {
  courses: Course[]
  grades: GradeRecord[]
  onGradeChange: (courseId: string, field: 'score' | 'letter' | 'feedback', value: string) => void
}

const letterOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']

function GradesPage({ courses, grades, onGradeChange }: GradesPageProps) {
  const average = grades.length
    ? Math.round(grades.reduce((total, grade) => total + grade.score, 0) / grades.length)
    : 0

  return (
    <section className="grades-page" id="grades">
      <header className="grades-page-header">
        <div>
          <p className="eyebrow">Academic progress</p>
          <h1>Grade book</h1>
          <p>Review each subject and update the grade and feedback for the student.</p>
        </div>
        <div className="grade-average">
          <strong>{average}%</strong>
          <span>Current average</span>
        </div>
      </header>

      <div className="grade-list">
        {courses.map((course) => {
          const grade = grades.find((item) => item.courseId === course.id) ?? {
            courseId: course.id,
            score: 0,
            letter: 'A',
            feedback: '',
          }

          return (
            <article className="grade-row" key={course.id}>
              <div className="grade-course">
                <span className="course-provider">{course.badge}</span>
                <h2>{course.name}</h2>
                <p>{course.teacher}</p>
              </div>
              <label>
                Score
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grade.score}
                  onChange={(event) => onGradeChange(course.id, 'score', event.target.value)}
                />
              </label>
              <label>
                Letter
                <select value={grade.letter} onChange={(event) => onGradeChange(course.id, 'letter', event.target.value)}>
                  {letterOptions.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
                </select>
              </label>
              <label className="grade-feedback">
                Feedback
                <textarea
                  rows={2}
                  placeholder="Add helpful feedback"
                  value={grade.feedback}
                  onChange={(event) => onGradeChange(course.id, 'feedback', event.target.value)}
                />
              </label>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default GradesPage
