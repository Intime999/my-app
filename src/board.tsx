import { useState } from 'react'
import type { BoardPost, Course } from './lib/database'

type BoardPageProps = {
  courses: Course[]
  posts: BoardPost[]
  studentName: string
  onAddPost: (courseId: string, body: string) => void
}

function BoardPage({ courses, posts, studentName, onAddPost }: BoardPageProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '')
  const [postBody, setPostBody] = useState('')
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]
  const coursePosts = posts.filter((post) => post.courseId === selectedCourse?.id)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = postBody.trim()
    if (!selectedCourse || !body) return
    onAddPost(selectedCourse.id, body)
    setPostBody('')
  }

  return (
    <section className="board-page" id="board">
      <header className="board-page-header">
        <div>
          <p className="eyebrow">Shared learning space</p>
          <h1>Class board</h1>
          <p>Share questions, ideas, and useful resources with each class.</p>
        </div>
        <span className="message-student-label">Posting as {studentName}</span>
      </header>

      <div className="board-layout">
        <aside className="board-course-list" aria-label="Board classes">
          <div className="panel-header"><h2>Choose a class</h2></div>
          {courses.map((course) => (
            <button type="button" className={course.id === selectedCourse?.id ? 'selected' : ''} key={course.id} onClick={() => setSelectedCourseId(course.id)}>
              <strong>{course.name}</strong>
              <small>{posts.filter((post) => post.courseId === course.id).length} posts</small>
            </button>
          ))}
        </aside>

        <section className="board-content" aria-live="polite">
          {selectedCourse && (
            <>
              <div className="board-content-header">
                <div><p className="eyebrow">Class board</p><h2>{selectedCourse.name}</h2><p>{selectedCourse.teacher}</p></div>
                <span className="badge">{coursePosts.length} posts</span>
              </div>
              <div className="board-post-list">
                {coursePosts.length > 0 ? coursePosts.map((post) => (
                  <article className="board-post" key={post.id}>
                    <div className="board-post-meta"><strong>{post.author}</strong><time>{post.createdAt}</time></div>
                    <p>{post.body}</p>
                  </article>
                )) : <div className="message-empty"><strong>No posts yet</strong><p>Start the class discussion.</p></div>}
              </div>
              <form className="board-compose" onSubmit={handleSubmit}>
                <textarea rows={3} placeholder={`Post to the ${selectedCourse.name} board...`} value={postBody} onChange={(event) => setPostBody(event.target.value)} required />
                <button type="submit" className="primary-btn">Post to board</button>
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  )
}

export default BoardPage