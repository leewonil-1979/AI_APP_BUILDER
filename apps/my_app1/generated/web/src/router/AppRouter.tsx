// React Router 설정
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { 홈Component } from '../components/홈Component';
import { 기록추가Component } from '../components/기록추가Component';
import { 통계보기Component } from '../components/통계보기Component';
import { 설정Component } from '../components/설정Component';

const navigation = [
  { name: '홈', path: '/홈', component: 홈Component },
  { name: '기록추가', path: '/기록추가', component: 기록추가Component },
  { name: '통계보기', path: '/통계보기', component: 통계보기Component },
  { name: '설정', path: '/설정', component: 설정Component }
];

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="app-navigation">
          <div className="nav-links">
            {navigation.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/홈" replace />} />
            <Route path="/홈" element={<홈Component />} />
            <Route path="/기록추가" element={<기록추가Component />} />
            <Route path="/통계보기" element={<통계보기Component />} />
            <Route path="/설정" element={<설정Component />} />
            <Route path="*" element={<div>페이지를 찾을 수 없습니다</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};