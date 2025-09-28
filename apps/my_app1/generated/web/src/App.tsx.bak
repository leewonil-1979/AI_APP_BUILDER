import { useState } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('홈')
  const [count, setCount] = useState(0)

  const renderPage = () => {
    switch(currentPage) {
      
      case '홈':
        return (
          <div className="page">
            <h2>📱 홈 페이지</h2>
            <p>홈 기능을 구현할 수 있습니다.</p>
            
          </div>
        )
      case '기록추가':
        return (
          <div className="page">
            <h2>📱 기록추가 페이지</h2>
            <p>기록추가 기능을 구현할 수 있습니다.</p>
            
            <div className="counter-section">
              <p>기록 카운터: {count}</p>
              <button onClick={() => setCount(count + 1)}>
                기록 추가 (+1)
              </button>
              <button onClick={() => setCount(0)} className="reset-btn">
                리셋
              </button>
            </div>
          </div>
        )
      default:
        return <div className="page"><h2>페이지를 찾을 수 없습니다</h2></div>
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AR 손씻기 습관 유도</h1>
        <p>AR로 손씻기 루틴 유지</p>
      </header>
      
      <nav className="App-nav">
        <h3>📋 페이지 네비게이션</h3>
        <div className="nav-buttons">
          
          <button 
            key="홈"
            onClick={() => setCurrentPage('홈')}
            className={`nav-btn ${currentPage === '홈' ? 'active' : ''}`}
          >
            홈
          </button>
          <button 
            key="기록추가"
            onClick={() => setCurrentPage('기록추가')}
            className={`nav-btn ${currentPage === '기록추가' ? 'active' : ''}`}
          >
            기록추가
          </button>
        </div>
      </nav>

      <main className="App-main">
        {renderPage()}
      </main>

      <footer className="App-footer">
        <p>현재 페이지: <strong>{currentPage}</strong></p>
        <p>총 기능 수: {2}</p>
      </footer>
    </div>
  )
}

export default App
