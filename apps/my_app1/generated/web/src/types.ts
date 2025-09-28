// <gen:begin types>
// 자동 생성된 타입 정의
export type PageId = '홈' | '기록추가';

export type AppState = {
  currentPage: PageId;
  counters: Record<string, number>;
  lastUpdated: string;
};

export type Feature = {
  id: PageId;
  title: string;
  description: string;
  hasCounter?: boolean;
};

export const FEATURES: Feature[] = [
  {
    id: '홈',
    title: '홈',
    description: '홈 기능을 구현할 수 있습니다.',
    hasCounter: false
  },
  {
    id: '기록추가',
    title: '기록추가',
    description: '기록추가 기능을 구현할 수 있습니다.',
    hasCounter: true
  }
];

export type AppConfig = {
  title: string;
  version: string;
  description: string;
};

// <gen:end types>