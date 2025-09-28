// <gen:begin main-app>
// <gen:begin main-app>
import { useState } from 'react';
import './App.css';
import { AppThemeProvider } from './theme/MaterialTheme';
import { AppRouter } from './router/AppRouter';
import { 홈Component } from './components/홈Component';
import { 기록추가Component } from './components/기록추가Component';
import { 통계보기Component } from './components/통계보기Component';
import { 설정Component } from './components/설정Component';

function App() {

  return (
    <AppThemeProvider><AppRouter /></AppThemeProvider>
  );
}

export default App;
// <gen:end main-app>
// <gen:end main-app>