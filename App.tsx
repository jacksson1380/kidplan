/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Leaf, 
  Briefcase, 
  Palette, 
  Beaker, 
  Heart, 
  ChevronRight, 
  Calendar, 
  Coins, 
  Info,
  Sparkles,
  ArrowLeft,
  Download,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import pptxgen from 'pptxgenjs';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Session {
  round: number;
  title: string;
  objective: string;
  activity: string;
  budget: string;
  materials: string[];
}

interface ProgramPlan {
  id: string;
  theme: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hexColors: {
    bg: string;
    text: string;
    border: string;
  };
  sessions: Session[];
}

// --- Mock Data ---

const PROGRAMS: ProgramPlan[] = [
  {
    id: 'env',
    theme: '환경',
    title: '지구 수비대: 초록빛 탐험',
    description: '우리 주변의 자연을 보호하고 환경의 소중함을 배우는 시간입니다.',
    icon: <Leaf className="w-6 h-6" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hexColors: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    sessions: [
      { round: 1, title: '지구는 어떤 모습일까?', objective: '지구의 소중함 알기', activity: '지구의 아픈 곳(쓰레기, 매연 등)을 찾아보고, 우리가 지킬 수 있는 3가지 약속을 정해 포스트잇으로 붙이기', budget: '0원', materials: ['종이', '색연필'] },
      { round: 2, title: '분리배출 마스터', objective: '올바른 분리배출 방법 익히기', activity: '실제 쓰레기 모형을 사용하여 캔, 종이, 플라스틱, 비닐로 올바르게 나누는 팀별 릴레이 경주 게임 진행', budget: '1,000원', materials: ['라벨 스티커', '재활용 박스'] },
      { round: 3, title: '플라스틱의 여행', objective: '플라스틱 오염의 심각성 이해', activity: '코에 빨대가 박힌 거북이 이야기를 인형극으로 관람하고, 플라스틱이 바다 생물에게 주는 영향을 토론하기', budget: '0원', materials: ['그림책'] },
      { round: 4, title: '나만의 작은 정원', objective: '식물 키우며 생명 존중 배우기', activity: '버려진 페트병을 잘라 꾸미고 상토를 채운 뒤, 공기 정화 식물이나 꽃 씨앗을 심어 이름표 달아주기', budget: '3,000원', materials: ['상토', '씨앗', '페트병'] },
      { round: 5, title: '에너지 도둑을 잡아라', objective: '에너지 절약 실천하기', activity: '사용하지 않는 플러그 뽑기, 불 끄기 등 집에서 실천할 수 있는 항목을 체크리스트로 만들고 스티커 붙이기', budget: '500원', materials: ['점검표 인쇄물'] },
      { round: 6, title: '업사이클링 예술가', objective: '버려지는 물건의 재탄생', activity: '산업 폐기물인 양말목을 활용하여 손가락 뜨개질로 컵 받침대를 만들며 자원 순환의 의미 배우기', budget: '4,000원', materials: ['양말목 세트'] },
      { round: 7, title: '물은 어디서 올까?', objective: '물 절약의 중요성 배우기', activity: '층층이 쌓은 자갈, 모래, 숯을 통과하며 더러운 물이 깨끗해지는 과정을 관찰하고 물의 소중함 느끼기', budget: '2,000원', materials: ['자갈', '모래', '거즈'] },
      { round: 8, title: '지구를 위한 식탁', objective: '로컬 푸드와 채식 이해', activity: '요리하고 남은 채소 꽁지(청경채, 연근 등)에 물감을 묻혀 도장처럼 찍어보며 자연의 무늬 발견하기', budget: '3,000원', materials: ['자투리 채소', '물감'] },
      { round: 9, title: '환경 신문 만들기', objective: '배운 내용 정리 및 공유', activity: '그동안 배운 내용을 바탕으로 기자가 되어 환경 보호 기사를 쓰고 사진 대신 그림을 그려 신문 완성하기', budget: '1,000원', materials: ['전지', '잡지'] },
      { round: 10, title: '지구 수비대 임명식', objective: '지속적인 실천 다짐', activity: '환경을 오염시키지 않는 천연 재료로 비누를 만들고, \'지구 수비대\' 배지를 달아주며 활동 마무리', budget: '5,000원', materials: ['비누 베이스', '천연 가루'] },
    ]
  },
  {
    id: 'career',
    theme: '학업/진로',
    title: '꿈꾸는 탐험가: 나의 미래 지도',
    description: '나의 장점을 발견하고 다양한 직업의 세계를 탐색합니다.',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    hexColors: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    sessions: [
      { round: 1, title: '나는 누구일까?', objective: '자기 이해 및 자존감 향상', activity: '나의 장점, 별명, 꿈을 담은 \'나만의 명함\'을 디자인하고 친구들에게 자신을 소개하는 시간 갖기', budget: '1,000원', materials: ['색지', '스티커'] },
      { round: 2, title: '내가 좋아하는 것들', objective: '흥미와 적성 발견', activity: '내가 시간 가는 줄 모르고 하는 일들을 중심에 두고 가지를 뻗어 나가며 나의 흥미 분야 시각화하기', budget: '0원', materials: ['활동지'] },
      { round: 3, title: '세상의 수많은 직업', objective: '직업의 다양성 이해', activity: '알고 있는 직업 25가지를 빙고판에 적고, 각 직업이 하는 일을 설명하며 빙고를 완성하는 지식 탐색 게임', budget: '500원', materials: ['빙고판'] },
      { round: 4, title: '미래의 하루', objective: '직업 생활 상상하기', activity: '의사, 요리사, 유튜버 등 꿈꾸는 직업의 의상이나 소품을 간단히 갖추고 상황극을 통해 직업 체험하기', budget: '0원', materials: ['간단한 소품'] },
      { round: 5, title: '공부는 왜 할까?', objective: '학습 동기 부여', activity: '"왜 공부해야 할까?"에 대한 답을 나뭇잎 모양 종이에 적어 큰 나무 그림에 붙이며 학습의 이유 찾기', budget: '1,000원', materials: ['나뭇가지', '종이'] },
      { round: 6, title: '시간 관리 마법사', objective: '효율적인 시간 사용법', activity: '학교 시간 외에 내가 자유롭게 쓸 수 있는 시간을 확인하고, 놀이와 공부의 균형을 맞춘 계획표 만들기', budget: '500원', materials: ['계획표 양식'] },
      { round: 7, title: '실패해도 괜찮아', objective: '회복탄력성 기르기', activity: '넘어져도 다시 일어나는 오뚝이를 만들며, 실수가 끝이 아니라 다시 시작할 수 있는 기회임을 배우기', budget: '3,000원', materials: ['오뚝이 키트'] },
      { round: 8, title: '우리 동네 직업 탐방', objective: '주변 직업인 인터뷰', activity: '부모님이나 주변 어른이 하는 일을 인터뷰 질문지로 작성해보고, 그 직업의 보람과 힘든 점 정리하기', budget: '0원', materials: ['필기도구'] },
      { round: 9, title: '10년 후의 나에게', objective: '미래 비전 설정', activity: '10년 후의 나에게 보내는 응원 메시지와 현재 나의 꿈을 적어 예쁜 상자에 담고 미래를 약속하기', budget: '2,000원', materials: ['편지지', '작은 상자'] },
      { round: 10, title: '나의 꿈 발표회', objective: '자신감 고취 및 공유', activity: '내가 되고 싶은 모습의 사진이나 그림을 모아 보드를 만들고, 친구들 앞에서 나의 꿈을 당당하게 발표하기', budget: '4,000원', materials: ['폼보드', '사진'] },
    ]
  },
  {
    id: 'art',
    theme: '예술',
    title: '꼬마 예술가: 색깔 놀이터',
    description: '다양한 재료와 방법으로 나만의 예술 세계를 표현합니다.',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    hexColors: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    sessions: [
      { round: 1, title: '선과 면의 춤', objective: '기초 조형 요소 익히기', activity: '클래식과 빠른 팝송을 번갈아 들으며 리듬에 맞춰 크레파스로 선의 굵기와 모양을 자유롭게 표현하기', budget: '1,000원', materials: ['도화지', '크레파스'] },
      { round: 2, title: '색깔 요정의 마법', objective: '색의 혼합과 감정 연결', activity: '빨강, 노랑, 파랑 물감만 사용하여 주황, 초록, 보라 등 수십 가지의 새로운 색을 만들고 이름 붙여주기', budget: '2,000원', materials: ['물감', '팔레트'] },
      { round: 3, title: '내 얼굴은 도화지', objective: '자화상 그리기', activity: '거울 속 나의 눈, 코, 입 모양을 자세히 관찰하고 나의 매력 포인트를 강조하여 자화상 완성하기', budget: '500원', materials: ['거울', '연필'] },
      { round: 4, title: '찰흙으로 빚는 세상', objective: '입체 표현 능력 향상', activity: '찰흙의 촉감을 느끼며 주무르고 두드려 평면이 아닌 입체적인 동물 모형을 만들고 채색하기', budget: '3,000원', materials: ['찰흙', '조각도'] },
      { round: 5, title: '자연물 콜라주', objective: '자연 재료의 질감 탐색', activity: '주변에서 수집한 자연물의 질감을 살려 종이에 배치하고 풀로 붙여 입체적인 자연 풍경화 제작하기', budget: '0원', materials: ['자연물', '목공풀'] },
      { round: 6, title: '빛과 그림자 놀이', objective: '명암의 원리 이해', activity: '검은 종이로 인형 실루엣을 오려 막대에 붙이고, 조명을 비추어 벽면에 생기는 그림자로 짧은 이야기 공연하기', budget: '2,000원', materials: ['검은 종이', '막대'] },
      { round: 7, title: '명화 속으로 퐁당', objective: '유명 화가 작품 감상 및 재해석', activity: '명화의 붓 터치를 색종이를 찢어 붙이는 모자이크 기법으로 표현하여 나만의 명화 작품 만들기', budget: '2,000원', materials: ['색종이', '풀'] },
      { round: 8, title: '리듬을 그려요', objective: '청각의 시각화', activity: '소리를 시각적인 이미지(점, 선, 면)로 바꾸어 표현하며 감각의 전이와 창의적 표현력 기르기', budget: '1,000원', materials: ['파스텔'] },
      { round: 9, title: '우리들의 공동 벽화', objective: '협동심과 공동체 의식', activity: '친구들과 긴 전지를 나눠 쓰고 서로의 그림을 이어 그리며 하나의 거대한 마을이나 우주 완성하기', budget: '3,000원', materials: ['대형 전지', '마카'] },
      { round: 10, title: '작은 전시회', objective: '성취감 및 감상 예절', activity: '그동안 만든 작품을 전시하고, 부모님이나 친구를 초대하기 위한 팝업 초대장 직접 디자인하기', budget: '5,000원', materials: ['액자 프레임', '간식'] },
    ]
  },
  {
    id: 'science',
    theme: '과학',
    title: '호기심 실험실: 엉뚱한 과학자',
    description: '질문하고 실험하며 과학의 원리를 재미있게 발견합니다.',
    icon: <Beaker className="w-6 h-6" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    hexColors: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    sessions: [
      { round: 1, title: '공기는 힘이 셀까?', objective: '공기의 압력 이해', activity: '빨대와 풍선을 연결해 공기가 빠져나가는 힘(작용-반작용)으로 움직이는 자동차를 만들고 누가 멀리 가는지 시합하기', budget: '2,000원', materials: ['풍선', '빨대', '병뚜껑'] },
      { round: 2, title: '물 위의 마법', objective: '표면장력과 밀도 탐구', activity: '화이트보드 마커로 매끄러운 접시에 그림을 그린 뒤 물을 부어 그림이 둥둥 떠오르는 현상 관찰하기', budget: '1,000원', materials: ['화이트보드 마커', '접시'] },
      { round: 3, title: '화산이 폭발해요!', objective: '화학 반응 관찰', activity: '찰흙으로 만든 화산 모형에 베이킹소다와 식초를 섞어 거품이 폭발하듯 솟구치는 화학 반응 체험하기', budget: '3,000원', materials: ['베이킹소다', '식초', '찰흙'] },
      { round: 4, title: '자석의 밀당', objective: '자기력의 성질 이해', activity: '자석이 붙는 물건과 붙지 않는 물건을 구분해보고, 자석 낚싯대로 클립이 달린 물고기를 잡으며 자기력 이해하기', budget: '2,000원', materials: ['자석', '클립'] },
      { round: 5, title: '무지개 탑 쌓기', objective: '액체의 밀도 차이 학습', activity: '설탕의 양을 다르게 한 색깔 물들을 농도(밀도) 차이를 이용해 섞이지 않게 층층이 쌓아 무지개 탑 만들기', budget: '1,000원', materials: ['설탕', '식용색소'] },
      { round: 6, title: '비밀 편지 쓰기', objective: '산성과 염기성 반응', activity: '투명한 레몬즙으로 글씨를 쓰고 드라이기 열을 가하면 갈색으로 변하며 글씨가 나타나는 산화 반응 관찰하기', budget: '1,500원', materials: ['레몬', '면봉', '드라이기'] },
      { round: 7, title: '그림자 시계', objective: '지구의 자전 이해', activity: '햇빛 아래 나무젓가락의 그림자 위치가 시간에 따라 변하는 것을 표시하며 지구의 자전 원리 배우기', budget: '500원', materials: ['종이컵', '나무젓가락'] },
      { round: 8, title: '탱탱볼 만들기', objective: '고분자 화합물 이해', activity: '물풀과 붕사가 만나 끈적한 고분자 화합물이 되는 과정을 손으로 느끼며 나만의 탄성 공 만들기', budget: '4,000원', materials: ['붕사', '물풀'] },
      { round: 9, title: '착시의 세계', objective: '눈의 착각 현상 탐구', activity: '연속된 동작의 그림을 원통에 넣고 돌려 틈 사이로 보며 정지된 그림이 움직이는 잔상 효과 체험하기', budget: '2,000원', materials: ['검은 종이', '도안'] },
      { round: 10, title: '나도 발명가', objective: '창의적 문제 해결', activity: '빨대, 테이프, 종이컵만 사용하여 높은 곳에서 떨어뜨려도 달걀이 깨지지 않는 구조물 설계 및 실험하기', budget: '3,000원', materials: ['달걀', '빨대', '테이프'] },
    ]
  },
  {
    id: 'psych',
    theme: '심리',
    title: '마음 돋보기: 내 마음이 들리니?',
    description: '나의 감정을 이해하고 친구와 소통하는 방법을 배웁니다.',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    hexColors: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    sessions: [
      { round: 1, title: '감정의 이름표', objective: '다양한 감정 단어 익히기', activity: '기쁨, 슬픔, 화남, 무서움 등 다양한 표정 카드를 보고 내가 최근에 언제 그런 기분을 느꼈는지 이야기 나누기', budget: '1,000원', materials: ['감정 카드'] },
      { round: 2, title: '오늘 내 마음의 날씨', objective: '현재 기분 인식 및 표현', activity: '월요일부터 금요일까지 나의 기분 변화를 해, 구름, 비 등으로 표시하고 왜 그런 날씨였는지 이유 적어보기', budget: '500원', materials: ['활동지'] },
      { round: 3, title: '화가 날 땐 어떻게?', objective: '분노 조절 방법 습득', activity: '화가 났던 기억을 풍선에 불어 넣고, 풍선을 하늘로 날려 보내거나 터뜨리며 부정적 감정 해소하기', budget: '1,000원', materials: ['풍선'] },
      { round: 4, title: '너의 마음이 궁금해', objective: '공감 능력 향상', activity: '짝꿍의 눈이나 입 모양만 보고 지금 어떤 감정을 연기하고 있는지 맞히며 타인의 감정에 집중해보기', budget: '0원', materials: ['없음'] },
      { round: 5, title: '칭찬 샤워', objective: '긍정적 관계 형성', activity: '친구의 장점 적어주기 활동으로 자존감 높이기 (친구의 등에 종이를 붙이고 돌아가며 멋진 점 적어주기)', budget: '1,000원', materials: ['예쁜 종이'] },
      { round: 6, title: '나만의 안식처', objective: '심리적 안정감 찾기', activity: '내가 좋아하는 물건이나 사진, 클레이로 만든 소품을 상자에 담아 불안할 때 꺼내 볼 수 있는 \'안전 기지\' 만들기', budget: '3,000원', materials: ['작은 상자', '클레이'] },
      { round: 7, title: '경청의 귀', objective: '의사소통 기술 익히기', activity: '종이컵 전화기로 옆 친구에게 칭찬의 말을 전달하며, 상대방의 말을 끝까지 잘 듣는 경청의 자세 익히기', budget: '500원', materials: ['종이컵 전화기'] },
      { round: 8, title: '미안해, 고마워, 사랑해', objective: '감정 표현의 중요성', activity: '평소 쑥스러워 전하지 못했던 고마움이나 미안함을 예쁜 카드에 정성껏 적어 직접 전달하는 용기 내기', budget: '1,500원', materials: ['카드지'] },
      { round: 9, title: '우리는 하나', objective: '협동과 소속감', activity: '커다란 퍼즐 조각에 각자의 개성을 담아 꾸미고, 하나로 합쳐보며 \'우리\'라는 소속감과 협동의 가치 느끼기', budget: '2,000원', materials: ['퍼즐 조각'] },
      { round: 10, title: '마음 박사 수료식', objective: '자아 성장 확인', activity: '10회기 동안 성장한 나를 칭찬하며 "참 잘했어요" 상장을 스스로 만들고 친구들 앞에서 수여식 진행하기', budget: '4,000원', materials: ['상장 용지', '금박 스티커'] },
    ]
  }
];

// --- Components ---

const Header = () => (
  <header className="py-12 px-6 text-center bg-white border-b border-stone-200">
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="inline-flex items-center justify-center p-3 mb-6 bg-stone-100 rounded-full">
        <Sparkles className="w-6 h-6 text-stone-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 tracking-tight">
        KidPlan: 초등 저학년 프로그램
      </h1>
      <p className="text-lg text-stone-500 font-sans max-w-xl mx-auto leading-relaxed">
        8~10세 아이들의 호기심을 자극하고 성장을 돕는 <br className="hidden md:block" />
        5가지 주제별 10회차 기획안을 만나보세요.
      </p>
    </motion.div>
  </header>
);

const ThemeCard = ({ program, onClick }: { program: ProgramPlan, onClick: () => void }) => (
  <motion.div
    whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
    onClick={onClick}
    className={cn(
      "cursor-pointer p-8 rounded-[32px] border transition-all duration-300",
      program.color
    )}
  >
    <div className="flex flex-col h-full">
      <div className="mb-6 inline-flex p-4 bg-white/80 rounded-2xl shadow-sm w-fit">
        {program.icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
        {program.theme}
      </span>
      <h3 className="text-2xl font-serif font-medium mb-3">
        {program.title}
      </h3>
      <p className="text-sm opacity-80 mb-6 flex-grow leading-relaxed">
        {program.description}
      </p>
      <div className="flex items-center text-sm font-medium">
        기획안 보기 <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  </motion.div>
);

const SessionRow = ({ session }: { session: Session }) => (
  <div className="group grid grid-cols-1 md:grid-cols-[80px_1.5fr_2fr_1fr] gap-4 p-6 border-b border-stone-100 hover:bg-stone-50 transition-colors">
    <div className="flex items-center">
      <span className="font-mono text-sm font-bold text-stone-400">
        {String(session.round).padStart(2, '0')}
      </span>
    </div>
    <div>
      <h4 className="font-serif font-medium text-stone-900 mb-1">{session.title}</h4>
      <p className="text-xs text-stone-500 italic">{session.objective}</p>
    </div>
    <div className="text-sm text-stone-600 leading-relaxed">
      <div className="font-medium text-stone-400 text-[10px] uppercase tracking-wider mb-1">활동 내용</div>
      {session.activity}
      <div className="mt-2 flex flex-wrap gap-1">
        {session.materials.map((m, i) => (
          <span key={i} className="px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full text-[10px]">
            {m}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-col justify-center items-start md:items-end">
      <div className="font-medium text-stone-400 text-[10px] uppercase tracking-wider mb-1">예산</div>
      <span className="text-sm font-mono font-medium text-stone-700">{session.budget}</span>
    </div>
  </div>
);

const ProgramDetail = ({ program, onBack }: { program: ProgramPlan, onBack: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const totalBudget = useMemo(() => {
    return program.sessions.reduce((acc, s) => {
      const val = parseInt(s.budget.replace(/[^0-9]/g, '')) || 0;
      return acc + val;
    }, 0);
  }, [program]);

  const handleDownloadPpt = async () => {
    setIsDownloading(true);
    try {
      const pres = new pptxgen();
      
      // 1. Main Slide
      const mainSlide = pres.addSlide();
      mainSlide.background = { color: program.hexColors.bg.replace('#', '') };
      
      mainSlide.addText(program.theme, {
        x: 0.5, y: 0.5, w: '90%', h: 0.5,
        fontSize: 18, color: program.hexColors.text.replace('#', ''),
        bold: true, fontFace: 'Arial'
      });

      mainSlide.addText(program.title, {
        x: 0.5, y: 1.2, w: '90%', h: 1,
        fontSize: 36, color: program.hexColors.text.replace('#', ''),
        bold: true, fontFace: 'Arial'
      });

      mainSlide.addText(program.description, {
        x: 0.5, y: 2.5, w: '90%', h: 1,
        fontSize: 14, color: '666666',
        fontFace: 'Arial'
      });

      mainSlide.addText([
        { text: "대상: 8~10세 (초등 저학년)\n", options: { fontSize: 12 } },
        { text: "기간: 2주 1회 / 총 10회차\n", options: { fontSize: 12 } },
        { text: `총 예산: 약 ${totalBudget.toLocaleString()}원 (1인당)`, options: { fontSize: 12, bold: true } }
      ], {
        x: 0.5, y: 4.0, w: '90%', h: 1.5,
        color: '333333', fontFace: 'Arial'
      });

      // 2. Session Slides (1 per page)
      program.sessions.forEach((session) => {
        const slide = pres.addSlide();
        
        // Header
        slide.addText(`${program.title} - 제 ${session.round}회차`, {
          x: 0.5, y: 0.3, w: '90%', h: 0.5,
          fontSize: 12, color: '999999', fontFace: 'Arial'
        });

        slide.addText(session.title, {
          x: 0.5, y: 0.8, w: '90%', h: 0.8,
          fontSize: 28, color: program.hexColors.text.replace('#', ''),
          bold: true, fontFace: 'Arial'
        });

        // Objective
        slide.addText("활동 목표", {
          x: 0.5, y: 1.8, w: 2, h: 0.4,
          fontSize: 14, color: '333333', bold: true, fontFace: 'Arial',
          fill: { color: 'F0F0F0' }
        });
        slide.addText(session.objective, {
          x: 0.5, y: 2.2, w: '90%', h: 0.5,
          fontSize: 12, color: '444444', fontFace: 'Arial'
        });

        // Activity
        slide.addText("활동 내용", {
          x: 0.5, y: 3.0, w: 2, h: 0.4,
          fontSize: 14, color: '333333', bold: true, fontFace: 'Arial',
          fill: { color: 'F0F0F0' }
        });
        slide.addText(session.activity, {
          x: 0.5, y: 3.4, w: '90%', h: 1.2,
          fontSize: 12, color: '444444', fontFace: 'Arial',
          valign: 'top'
        });

        // Budget & Materials
        slide.addText(`예산: ${session.budget}`, {
          x: 0.5, y: 4.8, w: '45%', h: 0.4,
          fontSize: 12, color: '333333', bold: true, fontFace: 'Arial'
        });
        slide.addText(`준비물: ${session.materials.join(', ')}`, {
          x: 5.0, y: 4.8, w: '45%', h: 0.4,
          fontSize: 12, color: '333333', fontFace: 'Arial'
        });
      });

      await pres.writeFile({ fileName: `${program.title}_기획안.pptx` });
    } catch (error) {
      console.error('PPT generation failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto px-6 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors group print:hidden"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        목록으로 돌아가기
      </button>

      <div className="bg-[#f5f5f0] p-4 rounded-[40px]">
        <div 
          className={cn("p-10 rounded-[40px] border mb-12")}
          style={{ 
            backgroundColor: program.hexColors.bg, 
            color: program.hexColors.text, 
            borderColor: program.hexColors.border 
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex p-3 bg-white/80 rounded-2xl shadow-sm mb-4">
                {program.icon}
              </div>
              <h2 className="text-4xl font-serif font-medium mb-2">{program.title}</h2>
              <p className="text-lg opacity-80">{program.description}</p>
            </div>
            <div className="flex flex-col gap-3 bg-white/40 p-6 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 opacity-60" />
                <span>2주 1회 / 총 10회차 (20주)</span>
              </div>
              <div className="flex items-center text-sm">
                <Coins className="w-4 h-4 mr-2 opacity-60" />
                <span>총 예산: 약 {totalBudget.toLocaleString()}원 (1인당)</span>
              </div>
              <div className="flex items-center text-sm">
                <Info className="w-4 h-4 mr-2 opacity-60" />
                <span>대상: 8~10세 (초등 저학년)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[80px_1.5fr_2fr_1fr] gap-4 p-6 bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-widest text-stone-400">
            <div>회차</div>
            <div>주제 및 목표</div>
            <div>활동 및 준비물</div>
            <div className="text-right">예산</div>
          </div>
          {program.sessions.map((session) => (
            <SessionRow key={session.round} session={session} />
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center print:hidden">
        <button 
          onClick={handleDownloadPpt}
          disabled={isDownloading}
          className="flex items-center px-8 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              PPT 생성 중...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              기획안 PPT 다운로드
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProgram = useMemo(() => 
    PROGRAMS.find(p => p.id === selectedId), 
  [selectedId]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-stone-900 font-sans selection:bg-stone-200">
      <AnimatePresence mode="wait">
        {!selectedId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PROGRAMS.map((program) => (
                  <ThemeCard 
                    key={program.id} 
                    program={program} 
                    onClick={() => setSelectedId(program.id)} 
                  />
                ))}
                
                {/* AI Suggestion Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-[32px] border border-dashed border-stone-300 flex flex-col items-center justify-center text-center bg-white/50"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-stone-400 mb-2">새로운 주제 제안</h3>
                  <p className="text-sm text-stone-400 mb-6">아이들을 위한 또 다른 <br/>멋진 아이디어가 있나요?</p>
                  <button className="text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
                    AI와 함께 기획하기 →
                  </button>
                </motion.div>
              </div>

              <section className="mt-24 p-12 bg-stone-900 text-stone-100 rounded-[48px] overflow-hidden relative">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-serif font-medium mb-6">운영 팁: 아이들의 마음을 여는 법</h2>
                  <ul className="space-y-4 text-stone-400">
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-200 mr-3 mt-0.5">01</span>
                      결과보다는 과정에 집중해주세요. 아이들이 시도하는 모든 순간을 칭찬해주세요.
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-200 mr-3 mt-0.5">02</span>
                      어려운 용어 대신 아이들의 눈높이에 맞는 비유를 사용해주세요.
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-200 mr-3 mt-0.5">03</span>
                      2주에 한 번 만나는 만큼, 지난 시간에 무엇을 했는지 짧게 회상하는 시간을 가져보세요.
                    </li>
                  </ul>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-stone-800/50 to-transparent hidden lg:block" />
              </section>
            </main>
            <footer className="py-12 text-center text-stone-400 text-xs uppercase tracking-widest border-t border-stone-200 mt-12">
              &copy; 2026 KidPlan Program Designer. All rights reserved.
            </footer>
          </motion.div>
        ) : (
          <ProgramDetail 
            key="detail"
            program={selectedProgram!} 
            onBack={() => setSelectedId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
