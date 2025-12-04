import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portfolioData } from '../data/portfolioData'
import Modal from '../components/Modal'
import './ProjectDetail.css'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const isCurrentlyExpanded = prev[sectionId]
      
      // 현재 클릭한 섹션이 이미 열려있으면 닫기
      if (isCurrentlyExpanded) {
        return {
          ...prev,
          [sectionId]: false
        }
      }
      
      // 다른 섹션이 열려있으면 모두 닫고 새 섹션만 열기
      return {
        [sectionId]: true
      }
    })
  }

  const project = portfolioData.find(p => p.id === parseInt(id))

  if (!project) {
    return (
      <div className="project-detail">
        <div className="detail-container">
          <p>프로젝트를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  // 프로젝트 상세 정보
  const projectDetails = {
    1: {
      title: '이창현수학',
      subtitle: '수학 강의 및 학습 플랫폼',
      website: 'https://www.mathchang.com/',
      overview: {
        purpose: '수학 강의 플랫폼 (이창현수학)',
        techStack: {
          frontend: 'React 18.2 + Vite + React Router DOM',
          backend: 'Node.js + Express + MongoDB (Mongoose)',
          auth: 'JWT (JSON Web Token)',
          deploy: 'Vercel (프론트), AWS (백), MongoDB Atlas (백)'
        }
      },
      backend: {
        server: {
          title: '서버 설정 (server/index.js)',
          features: [
            'CORS 설정: 다중 origin 허용 (로컬, Vercel 배포 URL)',
            'MongoDB 연결: Atlas 또는 로컬 MongoDB',
            '요청 로깅: API 요청 상세 로깅',
            '에러 핸들링: 통합 에러 핸들러'
          ],
          principle: 'CORS 미들웨어: 모든 응답에 CORS 헤더 추가 / JWT 인증: Bearer 토큰 방식 / MongoDB 연결: 환경변수 기반 동적 연결'
        },
        models: [
          {
            name: 'User 모델',
            fields: 'userId, password(bcrypt 해시), name, email, phone, schoolName, studentContact, parentContact, userType, isAdmin, profileImage, privacyAgreement, termsAgreement',
            principle: 'Pre-save hook: 비밀번호 자동 해시, 강사 자동 관리자 권한 부여 / Unique 인덱스: userId, email'
          },
          {
            name: 'Course 모델',
            fields: 'sku(고유), courseName, instructorId(User 참조), grade, courseCount, textbook, textbookType, courseStatus, courseType, lectures[]',
            principle: 'instructorId로 User와 populate / sku unique 인덱스'
          },
          {
            name: 'Class 모델',
            fields: 'grade, className, instructorId, instructorName, students[](User 참조), courses[](Course 참조)',
            principle: '{grade, className} 복합 unique 인덱스 / 다대다 관계: 학생-반, 강좌-반'
          },
          {
            name: 'ClassRecord 모델',
            fields: 'date, classId, className, progress, assignment, hasVideo, createdBy',
            principle: '{classId, date} 복합 unique 인덱스 (중복 방지)'
          },
          {
            name: 'StudentRecord 모델',
            fields: 'date, studentId, classId, attendance, assignment, dailyTestScore, monthlyEvaluationScore, hasClinic, createdBy',
            principle: '{studentId, date, classId} 복합 unique 인덱스'
          },
          {
            name: 'Notice 모델',
            fields: 'title, content, author, authorName, attachments[]',
            principle: 'createdAt 인덱스 (최신순 정렬)'
          },
          {
            name: 'PreviewCourse 모델',
            fields: 'title, videoLink(YouTube), createdBy',
            principle: 'YouTube 링크 유효성 검증'
          },
          {
            name: 'AttendanceComment 모델',
            fields: 'content, author, authorName, courseName, className, isPublic, reply(중첩 스키마)',
            principle: '댓글-답글 구조'
          },
          {
            name: 'PrivacyLog 모델',
            fields: 'userId, action, accessedBy, ipAddress, userAgent, details',
            principle: '개인정보 처리 이력 기록'
          }
        ],
        middleware: {
          title: '인증 미들웨어 (middleware/auth.js)',
          features: ['protect: JWT 토큰 검증', 'authorize: 역할 기반 접근 제어', 'authenticate: 하위 호환용 인증'],
          principle: 'Bearer 토큰 추출 → JWT 검증 → User 조회 → req.user에 저장 / 역할 기반 권한: userType + isAdmin 조합'
        },
        controllers: [
          {
            name: 'usersController.js',
            features: ['회원가입, 로그인, 아이디 찾기, 비밀번호 재설정', '사용자 CRUD, 프로필 수정', '개인정보처리 로그 기록'],
            principle: 'bcrypt 비밀번호 검증 / JWT 토큰 발급 / PrivacyLog 자동 기록'
          },
          {
            name: 'coursesController.js',
            features: ['강좌 CRUD', '내 강좌 조회 (학생별)', '강사별 강좌 조회'],
            principle: 'instructorId populate / 학생-강좌 매핑 조회'
          },
          {
            name: 'classesController.js',
            features: ['반 CRUD', '학생/강좌 추가/제거'],
            principle: '배열 기반 다대다 관계 관리'
          },
          {
            name: 'classRecordsController.js',
            features: ['수업 기록 CRUD', '반별 기록 조회'],
            principle: '날짜별 중복 방지 (unique 인덱스)'
          },
          {
            name: 'studentRecordsController.js',
            features: ['학생별 출석/과제/시험 기록 CRUD', '월별 통계 집계'],
            principle: '날짜 범위 쿼리로 월별 집계'
          },
          {
            name: 'noticesController.js',
            features: ['공지사항 CRUD', '파일 첨부 (Cloudinary)'],
            principle: 'Cloudinary 업로드 후 URL 저장'
          },
          {
            name: 'previewCoursesController.js',
            features: ['맛보기 강좌 CRUD'],
            principle: 'YouTube 링크 임베드'
          },
          {
            name: 'attendanceCommentsController.js',
            features: ['수강 문의 댓글 CRUD', '답글 기능'],
            principle: '중첩 스키마로 댓글-답글 구조'
          }
        ]
      },
      frontend: {
        routing: {
          title: '라우팅 (App.jsx)',
          routes: [
            '공개: /, /login, /signup, /preview-courses',
            '학생: /my-classroom/courses, /my-class/status, /my-class/statistics',
            '학부모: /parent-class/status, /parent-class/statistics',
            '관리자: /admin/*, /admin/courses, /admin/users, /admin/classes',
            '커뮤니티: /community/notice, /community/attendance'
          ]
        },
        api: {
          title: 'API 설정 (api/axiosConfig.js)',
          features: ['Axios 인스턴스 생성', '요청 인터셉터: 토큰 자동 추가', '응답 인터셉터: 에러 처리'],
          principle: 'localStorage/sessionStorage에서 토큰 자동 추출 / Authorization: Bearer {token} 헤더 자동 추가 / 401 에러 시 자동 로그아웃 처리'
        },
        components: [
          {
            name: 'Header.jsx',
            features: ['로그인 상태 관리 (localStorage/sessionStorage)', '반응형 네비게이션(드롭다운 메뉴)', '사용자 메뉴 (내정보, 관리자 페이지, 로그아웃)', '카카오톡 인앱브라우저 대응'],
            principle: 'storage 이벤트로 다중 탭 동기화 / 3초마다 로그인 상태 확인 / onTouchStart로 카카오톡 URL 공유메뉴 방지'
          },
          {
            name: 'Login.jsx',
            features: ['로그인 폼', '아이디 찾기 모달', '"아이디 기억하기" 기능', '토큰 저장(localStorage/sessionStorage)'],
            principle: 'JWT 토큰을 localStorage/sessionStorage에 저장 / 사용자 정보도 함께 저장'
          },
          {
            name: 'MyCourses.jsx',
            features: ['내 강좌 목록 조회', 'YouTube 썸네일 자동 생성', '강좌 상태 표시 (완강/진행중)'],
            principle: '/courses/my-courses API 호출 / YouTube URL에서 video ID 추출 → 썸네일 URL 생성'
          },
          {
            name: 'Admin.jsx',
            features: ['관리자 대시보드', '통계 정보 표시']
          },
          {
            name: 'Notice.jsx',
            features: ['공지사항 목록', '검색/필터링']
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '로그인 요청 → 서버에서 bcrypt 비밀번호 검증',
            'JWT 토큰 발급 (userId, id, userType, isAdmin 포함)',
            '클라이언트에서 localStorage/sessionStorage에 저장',
            '이후 모든 API 요청에 Authorization 헤더로 토큰 전송',
            '서버에서 protect 미들웨어로 토큰 검증'
          ]
        },
        permission: {
          title: '권한 관리',
          details: [
            'userType: "학생", "학부모", "강사"',
            'isAdmin: true/false (강사는 자동 true)',
            'authorize 미들웨어로 역할 기반 접근 제어'
          ]
        },
        relationship: {
          title: '데이터 관계',
          details: [
            'User (강사) ──→ Course (1:N)',
            'User (학생) ──→ Class (N:M)',
            'Class ──→ Course (N:M)',
            'Class ──→ ClassRecord (1:N)',
            'User (학생) ──→ StudentRecord (1:N)',
            'Class ──→ StudentRecord (1:N)'
          ]
        }
      },
      features: {
        security: ['bcrypt 비밀번호 해싱 (salt rounds: 10)', 'JWT 토큰 인증', 'CORS 설정', '개인정보 처리 로그'],
        performance: ['MongoDB 인덱스 최적화', 'Populate로 관계 데이터 효율적 조회', 'React 컴포넌트 최적화'],
        ux: ['반응형 디자인 (모바일/데스크톱)', '카카오톡 인앱 브라우저 대응', '로딩 상태 관리', '에러 처리 및 사용자 피드백'],
        scalability: ['모듈화된 구조 (MVC 패턴)', '환경변수 기반 설정', 'Cloudinary 파일 업로드 통합']
      }
    },
    3: {
      title: '캠핑공작소',
      subtitle: '캠핑카 DIY 공방 웹사이트',
      website: 'https://www.campgong.com/',
      overview: {
        purpose: '캠핑카 DIY 공방 웹사이트 (캠핑공작소)',
        techStack: {
          frontend: 'React 18.2 + Vite + React Router DOM',
          backend: 'Node.js + Express + MongoDB (Mongoose)',
          auth: 'JWT (JSON Web Token)',
          deploy: 'Vercel (프론트), Heroku (백), MongoDB Atlas (백)'
        }
      },
      backend: {
        server: {
          title: '서버 설정 (server/index.js)',
          features: [
            'CORS 설정: 모든 origin 허용',
            'MongoDB 연결: Atlas 또는 로컬 MongoDB',
            '요청 로깅: API 요청 상세 로깅',
            '에러 핸들링: 통합 에러 핸들러',
            '헬스 체크: /health 엔드포인트'
          ],
          principle: 'CORS 미들웨어: 모든 응답에 CORS 헤더 추가 / MongoDB 연결: 환경변수 기반 동적 연결 / 에러 핸들링: 모든 라우트 이후에 위치하여 처리되지 않은 에러 캐치'
        },
        models: [
          {
            name: 'User 모델',
            fields: 'userId (unique, indexed), password (bcrypt 해시, minlength: 6), name, phoneNumber (선택), userType: admin/customer, createdAt, updatedAt',
            principle: 'Unique 인덱스: userId / 비밀번호는 컨트롤러에서 bcrypt로 해싱 / 기본값: userType: customer'
          },
          {
            name: 'Video 모델',
            fields: 'title, youtubeUrl (유효성 검증), thumbnailUrl, videoType: 자작솜씨/자작강의/기타, videoFormat: 동영상/쇼츠, publishedAt (YouTube 게시 시간), order, createdAt, updatedAt',
            principle: 'YouTube URL 형식 검증 (validator) / Enum으로 타입/형식 제한 / publishedAt 우선, 없으면 createdAt 사용'
          },
          {
            name: 'Inquiry 모델',
            fields: 'title, content, author (User 참조), authorName, email, phone, status: 답변대기/답변완료, views (조회수), answer, answeredAt, answeredBy (User 참조)',
            principle: 'author와 answeredBy로 User와 populate / createdAt 인덱스 (최신순 정렬) / status 인덱스'
          }
        ],
        middleware: {
          title: '인증 미들웨어 (middleware/auth.js)',
          features: ['verifyToken: JWT 토큰 검증', 'verifyAdmin: 관리자 권한 확인'],
          principle: 'Bearer 토큰 추출 → JWT 검증 → req.user에 저장 / 관리자 권한 확인: req.user.userType !== admin 시 403 반환'
        },
        controllers: [
          {
            name: 'userController.js',
            features: ['회원가입, 로그인', '사용자 CRUD (관리자)', '토큰으로 사용자 정보 조회'],
            principle: 'bcrypt 비밀번호 해싱 (salt rounds: 10) / JWT 토큰 발급 (7일 유효) / 토큰에 userId, id, userType 포함'
          },
          {
            name: 'videoController.js',
            features: ['영상 조회 (페이지네이션)', 'YouTube 채널 동기화', '영상 타입 수정 (관리자)'],
            principle: 'YouTube Data API v3로 채널 영상 가져오기 / Shorts 자동 감지 (duration ≤ 60초 또는 #Shorts 태그) / RSS 피드 백업 (API 키 없을 때) / 중복 방지: youtubeUrl 또는 videoId로 확인'
          },
          {
            name: 'inquiryController.js',
            features: ['문의사항 CRUD', '답변 작성/수정/삭제 (관리자)', '조회수 증가'],
            principle: '작성자 본인 또는 관리자만 삭제 가능 / 관리자만 답변 작성 가능 / 답변 작성 시 상태 자동 변경 (답변완료) / User 모델과 populate로 작성자 정보 조회'
          }
        ]
      },
      frontend: {
        routing: {
          title: '라우팅 (App.jsx)',
          routes: [
            '공개: /, /about, /contact',
            '영상: /videos/:type, /videos/:type/list, /videos/:type/shorts',
            '관리자: /admin, /admin/users, /admin/videos'
          ]
        },
        api: {
          title: 'API 설정 (utils/api.js)',
          features: ['Axios 인스턴스 생성', '요청 인터셉터: 토큰 자동 추가', '응답 인터셉터: 에러 처리'],
          principle: 'localStorage에서 토큰 자동 추출 / Authorization: Bearer {token} 헤더 자동 추가 / 401 에러 시 자동 로그아웃 처리'
        },
        components: [
          {
            name: 'Header.jsx',
            features: ['로그인 상태 관리 (localStorage)', '드롭다운 메뉴 (자작솜씨, 자작강의)', '사용자 메뉴 (관리자 페이지, 로그아웃)', '로그인/회원가입 모달'],
            principle: 'storage 이벤트로 다중 탭 동기화 / localStorage에서 사용자 정보 읽기 / 모바일/데스크톱 드롭다운 처리'
          },
          {
            name: 'Footer.jsx',
            features: ['회사 정보 표시', '소셜 링크 (블로그, YouTube)']
          },
          {
            name: 'LoginModal.jsx',
            features: ['로그인 폼', '유효성 검증', '토큰 저장 (localStorage)'],
            principle: 'JWT 토큰과 사용자 정보를 localStorage에 저장 / 로그인 성공 시 페이지 새로고침'
          },
          {
            name: 'SignupModal.jsx',
            features: ['회원가입 폼', '비밀번호 검증 (영문+숫자, 6자 이상)', '전화번호 형식 검증 (선택)'],
            principle: '실시간 유효성 검증 / 비밀번호 확인 일치 검사'
          },
          {
            name: 'VideoPlayer.jsx',
            features: ['YouTube 영상 모달 재생', 'iframe 임베드'],
            principle: 'YouTube embed URL 생성 / 오버레이 클릭으로 닫기'
          },
          {
            name: 'MobileConsultButton.jsx',
            features: ['모바일 전화 버튼 (고정)', 'Footer 근처에서 자동 숨김'],
            principle: 'ResizeObserver로 Footer 위치 감지 / 스크롤 이벤트 디바운싱'
          },
          {
            name: 'Home.jsx',
            features: ['Hero 섹션 (배너 이미지)', '회사소개 (동적 이미지 높이 조정)', '주요 서비스 소개', '최신 영상 4개 표시'],
            principle: 'ResizeObserver로 프로필 이미지 높이 동기화 / 왼쪽 이미지를 오른쪽의 95% 높이로 맞춤 / requestAnimationFrame으로 렌더링 최적화'
          },
          {
            name: 'VideoPage.jsx',
            features: ['타입별 영상 필터링', '동영상/쇼츠 분리 표시', '동영상 페이지네이션'],
            principle: 'URL 파라미터로 타입 디코딩 / videoFormat으로 분리 / 동영상만 페이지네이션 (4개/페이지)'
          },
          {
            name: 'VideoListPage.jsx',
            features: ['타입별 동영상 목록', '페이지네이션', '최신순 정렬', '상대 시간 표시 (N일 전)'],
            principle: 'publishedAt 기준 정렬 / 클릭 시 VideoPlayer 모달 / getTimeAgo 함수로 상대 시간 계산'
          },
          {
            name: 'ShortsPage.jsx',
            features: ['타입별 쇼츠 목록', 'TikTok 스타일 세로 스와이프', '자동 재생', '음소거/재생 제어'],
            principle: 'YouTube iframe API로 재생 제어 / 터치/마우스 드래그로 네비게이션 / 키보드 화살표 지원 / postMessage로 mute/unmute 제어'
          },
          {
            name: 'ContactPage.jsx',
            features: ['문의사항 목록 (페이지네이션)', '문의사항 작성 (로그인 필요)', '문의사항 상세 조회', '답변 작성/수정/삭제 (관리자)', '조회수 증가'],
            principle: '작성자 본인 또는 관리자만 삭제 가능 / 관리자만 답변 작성 가능 / 클릭 시 조회수 증가 API 호출 / 상태 배지 (답변대기, 답변완료)'
          },
          {
            name: 'AdminPage.jsx',
            features: ['관리자 대시보드', '관리 메뉴 (유저 관리, 영상 관리)'],
            principle: 'JWT 토큰으로 관리자 권한 확인 / 비관리자 접근 시 홈으로 리다이렉트'
          },
          {
            name: 'UserManagement.jsx',
            features: ['사용자 목록 조회 (페이지네이션)', '사용자 추가/수정/삭제', '사용자 타입 변경'],
            principle: '관리자 권한 확인 / 비밀번호 변경은 선택 (빈 값이면 유지) / 모달로 추가/수정 폼'
          },
          {
            name: 'VideoManagement.jsx',
            features: ['영상 목록 조회 (페이지네이션)', 'YouTube 채널 동기화', '영상 타입 변경 (드롭다운)'],
            principle: '채널 동기화 버튼 클릭 시 /videos/admin/sync 호출 / 낙관적 업데이트로 즉시 UI 반영 / 실패 시 원래 상태로 복구'
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '로그인 요청 → 서버에서 bcrypt 비밀번호 검증',
            'JWT 토큰 발급 (userId, id, userType 포함)',
            '클라이언트에서 localStorage에 저장',
            '이후 모든 API 요청에 Authorization 헤더로 토큰 전송',
            '서버에서 verifyToken 미들웨어로 토큰 검증'
          ]
        },
        permission: {
          title: '권한 관리',
          details: [
            'userType: admin, customer',
            '관리자만 접근 가능: /admin/*, 문의사항 답변, 유저/영상 관리',
            'verifyAdmin 미들웨어로 권한 확인'
          ]
        },
        relationship: {
          title: '데이터 관계',
          details: [
            'User (작성자) ──→ Inquiry (1:N)',
            'User (답변자) ──→ Inquiry (1:N)',
            'Video ──→ (독립적, YouTube URL 기반)'
          ]
        }
      },
      features: {
        security: ['bcrypt 비밀번호 해싱 (salt rounds: 10)', 'JWT 토큰 인증 (7일 유효)', 'CORS 설정', '관리자 권한 검증'],
        performance: ['MongoDB 인덱스 최적화 (userId, createdAt)', '페이지네이션으로 대량 데이터 처리', 'ResizeObserver로 이미지 크기 조정 최적화', 'requestAnimationFrame으로 렌더링 최적화'],
        ux: ['반응형 디자인 (모바일/데스크톱)', 'TikTok 스타일 쇼츠 플레이어', '드래그/스와이프 네비게이션', '로딩 상태 관리', '에러 처리 및 사용자 피드백', '모바일 전화 버튼 (Footer 근처에서 자동 숨김)'],
        scalability: ['모듈화된 구조 (MVC 패턴)', '환경변수 기반 설정', '에러 핸들링 통합', '타입 안정성 (enum 사용)']
      }
    },
    2: {
      title: '신동우와 물화탐구',
      subtitle: '과학 강사 소개 웹사이트',
      website: 'https://dongwoo-update.vercel.app/',
      overview: {
        purpose: '과학 강사 신동우 선생님의 개인 웹사이트 및 커뮤니티 플랫폼',
        techStack: {
          frontend: 'HTML5 + CSS3 + Vanilla JavaScript (ES6+)',
          backend: 'Firebase Realtime Database + Firebase Authentication',
          auth: 'Firebase Authentication',
          deploy: 'GitHub (프론트), Vercel (프론트)'
        }
      },
      backend: {
        server: {
          title: 'Firebase 설정 (firebase-config.js)',
          features: [
            'Firebase SDK v8 CDN 로드',
            'Firebase App 초기화',
            'Realtime Database 인스턴스 생성',
            'Authentication 인스턴스 생성',
            '전역 변수로 database, auth 할당'
          ],
          principle: 'firebase.initializeApp(firebaseConfig) / firebase.database() - Realtime Database / firebase.auth() - Authentication / SDK 로드 대기 로직'
        },
        models: [
          {
            name: 'Users 데이터 구조',
            fields: 'email, name, isAdmin, createdAt (timestamp)',
            principle: 'Firebase Realtime Database의 users/{uid} 경로에 저장 / isAdmin 필드로 관리자 권한 관리'
          },
          {
            name: 'Notices 데이터 구조',
            fields: 'title, content, author, authorEmail, date (YYYY.MM.DD), dateISO (ISO 8601), views, createdAt',
            principle: 'Firebase Realtime Database의 notices/{noticeId} 경로에 저장 / 실시간 동기화'
          },
          {
            name: 'Materials 데이터 구조',
            fields: 'title, content, author, authorEmail, date, dateISO, views, createdAt',
            principle: 'Firebase Realtime Database의 materials/{materialId} 경로에 저장 / 공지사항과 동일한 구조'
          },
          {
            name: 'Guestbooks 데이터 구조',
            fields: 'author, userId, message, date (ISO 8601), isAdmin',
            principle: 'Firebase Realtime Database의 guestbooks/{guestbookId} 경로에 저장 / 실시간 업데이트'
          }
        ],
        middleware: {
          title: '인증 시스템 (script.js)',
          features: ['로그인: Firebase Authentication', '회원가입: Firebase Auth + Database 저장', '로그아웃: Firebase Auth 로그아웃', '관리자 계정 자동 초기화'],
          principle: 'Firebase Auth: signInWithEmailAndPassword() / createUserWithEmailAndPassword() / Firebase Database에서 사용자 정보 조회 및 저장 / localStorage에 사용자 정보 저장'
        },
        controllers: [
          {
            name: '인증 컨트롤러',
            features: ['로그인: 이메일 형식 {아이디}@dongwoo.com', '회원가입: 이메일, 비밀번호, 이름 입력', '로그아웃: Firebase Auth 로그아웃', '관리자 계정 자동 초기화 (admin@dongwoo.com)'],
            principle: 'Firebase Authentication으로 인증 / Firebase Database에 사용자 정보 저장 / localStorage에 사용자 정보 저장 / Custom Event로 페이지 간 통신'
          },
          {
            name: '공지사항/수업자료 관리',
            features: ['목록 실시간 로드', '작성/수정/삭제 (관리자만)', '상세 조회 및 조회수 증가', '날짜별 정렬 (최신순)'],
            principle: 'Firebase: database.ref("notices").on("value") - 실시간 리스너 / 관리자 권한 체크 (isAdmin) / XSS 방지 처리'
          },
          {
            name: '방명록 관리',
            features: ['방명록 목록 실시간 로드', '방명록 작성 (로그인 필수)', '방명록 수정/삭제 (본인 또는 관리자만)', '상대 시간 표시', '사용자 아바타 초성 표시'],
            principle: 'Firebase: database.ref("guestbooks").on("value") - 실시간 동기화 / 로그인 사용자 이름 자동 입력 / Firebase Auth 상태 변경 감지'
          }
        ]
      },
      frontend: {
        routing: {
          title: '페이지 구조',
          routes: [
            '메인 페이지 (index.html): Hero, About Me, Services, Portfolio, Contact',
            '선생님소개 페이지 (about.html): 프로필, 소개, Skills, Career',
            '공지사항 페이지 (notice.html): 목록, 작성/수정/삭제, 상세 조회',
            '수업자료 페이지 (materials.html): 목록, 작성/수정/삭제, 상세 조회',
            '커뮤니티 페이지 (community.html): 방명록 작성/조회/수정/삭제',
            '관리자 페이지 (admin.html): 회원, 공지사항, 수업자료, 방명록 관리'
          ]
        },
        api: {
          title: 'Firebase 통신',
          features: ['Firebase Realtime Database 실시간 동기화', 'Firebase Authentication 인증', '실시간 리스너 (on("value"))', '데이터 CRUD 작업'],
          principle: 'Firebase SDK를 통한 실시간 데이터 동기화 / on("value") 이벤트로 데이터 변경 시 자동 콜백 실행 / Firebase Auth로 사용자 인증'
        },
        components: [
          {
            name: 'Header (모든 페이지 공통)',
            features: ['로고 및 네비게이션 메뉴', '로그인/회원가입 버튼 (비로그인 시)', '사용자 메뉴 (로그인 시)', '모바일 반응형 햄버거 메뉴'],
            principle: 'localStorage에서 사용자 정보 확인 / Firebase Auth 상태와 동기화 / Custom Event (userLogin, userLogout)로 페이지 간 통신 / storage 이벤트로 다중 탭 동기화'
          },
          {
            name: '모달 시스템',
            features: ['로그인 모달', '회원가입 모달', '글쓰기 모달 (공지사항/수업자료)', '상세 조회 모달', '삭제 확인 모달'],
            principle: 'CSS 클래스 토글 (active 클래스) / 배경 클릭 시 닫기 / ESC 키로 닫기'
          },
          {
            name: '공지사항 페이지 (notice.js)',
            features: ['공지사항 목록 실시간 로드', '관리자만 글쓰기 버튼 표시', '모달로 작성/수정/삭제', '조회수 자동 증가', '날짜별 정렬'],
            principle: 'Firebase: database.ref("notices").on("value") - 실시간 리스너 / 관리자 권한 체크 / XSS 방지 처리'
          },
          {
            name: '수업자료 페이지 (materials.js)',
            features: ['수업자료 목록 실시간 로드', '관리자만 글쓰기 버튼 표시', '모달로 작성/수정/삭제', '조회수 자동 증가'],
            principle: '공지사항과 동일한 구조 및 로직 / Firebase의 materials 경로에 데이터 저장'
          },
          {
            name: '커뮤니티 페이지 (community.js)',
            features: ['방명록 작성 (로그인 필수)', '방명록 목록 실시간 조회', '방명록 수정/삭제 (본인 또는 관리자만)', '상대 시간 표시', '사용자 아바타 초성 표시'],
            principle: 'Firebase: database.ref("guestbooks").on("value") - 실시간 동기화 / 로그인 사용자 이름 자동 입력 / 다중 시점 업데이트로 안정성 확보'
          },
          {
            name: '관리자 페이지 (admin.js)',
            features: ['탭 기반 관리 인터페이스', '회원 관리: 목록 조회, 삭제', '공지사항/수업자료/방명록 관리', '통계 정보 표시'],
            principle: '관리자 권한 검증 (isAdmin 필드) / Firebase에서 데이터 조회 및 삭제 / 모달로 상세 정보 조회'
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '회원가입: 사용자 입력 → Firebase Auth에 사용자 생성 → Firebase Database에 사용자 정보 저장',
            '로그인: 사용자 입력 → Firebase Auth로 인증 → Firebase Database에서 사용자 정보 조회 → localStorage에 저장',
            '로그아웃: Firebase Auth 로그아웃 → localStorage에서 사용자 정보 삭제 → UI 업데이트',
            'Custom Event 전송으로 다른 페이지에 알림'
          ]
        },
        permission: {
          title: '권한 관리',
          details: [
            '일반 사용자: isAdmin: false',
            '관리자: isAdmin: true',
            '공지사항/수업자료 글쓰기: 관리자만 가능',
            '방명록 수정/삭제: 본인 또는 관리자만 가능',
            '관리자 페이지 접근: 관리자만 가능'
          ]
        },
        relationship: {
          title: '데이터 구조',
          details: [
            'users/{uid}: 사용자 정보 (email, name, isAdmin)',
            'notices/{noticeId}: 공지사항 정보',
            'materials/{materialId}: 수업자료 정보',
            'guestbooks/{guestbookId}: 방명록 정보'
          ]
        }
      },
      features: {
        security: ['Firebase Authentication (이메일/비밀번호 인증)', '권한 관리 (isAdmin 필드)', 'XSS 방지 (텍스트 이스케이프 처리)', '관리자 계정 자동 초기화'],
        performance: ['Firebase Realtime Database 실시간 동기화', 'Intersection Observer로 스크롤 애니메이션 최적화', '이벤트 위임으로 동적 요소 최적화'],
        ux: ['반응형 디자인 (모바일/태블릿/데스크톱)', '스크롤 애니메이션 (Fade-in, Slide-up)', '실시간 업데이트', '다중 탭 동기화', '사용자 피드백 (로딩 상태, 에러 메시지)'],
        scalability: ['모듈화된 구조 (페이지별 독립적인 JavaScript 파일)', 'Firebase 기반 서버리스 아키텍처', '환경변수 기반 설정 (firebase-config.js)']
      }
    },
    4: {
      title: '창현이에게 하고싶은말',
      subtitle: '개인 방명록 웹 애플리케이션',
      website: 'https://talking-chang.vercel.app/',
      overview: {
        purpose: '개인 방명록 웹 애플리케이션 (창현이에게 하고싶은말)',
        techStack: {
          frontend: 'HTML5 + CSS3 + Vanilla JavaScript (ES6+)',
          backend: 'Firebase (Authentication, Realtime Database)',
          auth: 'Firebase Authentication',
          deploy: 'Vercel (프론트), GitHub (프론트)'
        }
      },
      backend: {
        server: {
          title: 'Firebase 초기화 (index.html)',
          features: [
            'Firebase SDK 모듈 임포트 (firebase-app, firebase-database, firebase-auth)',
            '전역 변수로 Firebase 인스턴스 공유',
            '에러 처리 및 폴백',
            'Authentication 초기화 실패 시 안내'
          ],
          principle: 'CDN을 통한 모듈 임포트 / window.firebaseApp, window.firebaseDb, window.firebaseAuth 전역 변수 / 최대 10초 대기 로직'
        },
        models: [
          {
            name: 'Guestbooks 데이터 구조',
            fields: 'authorName, message, date (ISO 8601), userId (Firebase Auth UID), isAdmin',
            principle: 'Firebase Realtime Database의 guestbooks/{guestbookId} 경로에 저장 / 실시간 동기화'
          },
          {
            name: 'Users 데이터 구조',
            fields: 'email, displayName, isAdmin',
            principle: 'Firebase Realtime Database의 users/{userId} 경로에 저장 / isAdmin 플래그로 관리자 권한 관리'
          }
        ],
        middleware: {
          title: '인증 시스템 (AuthManager 클래스)',
          features: ['로그인: Firebase Authentication signInWithEmailAndPassword', '회원가입: createUserWithEmailAndPassword', '로그아웃: signOut', '첫 관리자 생성: 관리자 없을 시 자동 생성'],
          principle: 'Firebase Authentication JWT 토큰 기반 인증 (자동 관리) / onAuthStateChanged로 상태 감지 / Realtime Database에 isAdmin 플래그 저장'
        },
        controllers: [
          {
            name: 'GuestbookManager 클래스',
            features: ['방명록 추가: addGuestbook()', '방명록 수정: updateGuestbook()', '방명록 삭제: deleteGuestbook()', '권한 확인: isOwner()', '실시간 리스너: onValue'],
            principle: 'Firebase Realtime Database push/update/remove / 작성자 확인 (userId 비교) / 실시간 동기화'
          },
          {
            name: 'AuthManager 클래스',
            features: ['로그인: login()', '회원가입: signup()', '로그아웃: logout()', 'UI 업데이트: updateUI()', '관리자 확인: checkAdminExists()'],
            principle: 'Firebase Authentication으로 인증 / 에러 코드별 한국어 메시지 변환 / 성공 시 자동 UI 업데이트'
          }
        ]
      },
      frontend: {
        routing: {
          title: '페이지 구조',
          routes: [
            '메인 페이지 (index.html): Hero Section, User Info Bar, Guestbook Form, Guestbook List, Footer',
            '관리자 페이지 (admin.html): 대시보드, 사용자 관리, 방명록 관리'
          ]
        },
        api: {
          title: 'Firebase 통합',
          features: ['Firebase Realtime Database 실시간 동기화', 'Firebase Authentication 인증', '실시간 리스너 (onValue)', '데이터 CRUD 작업'],
          principle: 'Firebase SDK를 통한 실시간 데이터 동기화 / onValue 이벤트로 데이터 변경 시 자동 콜백 실행 / 오프라인 지원 (로컬 캐시)'
        },
        components: [
          {
            name: 'Hero Section',
            features: ['메인 타이틀 "창현이에게 하고싶은말" 표시', '이모지 아이콘 (💬) 애니메이션 효과', '서브 타이틀 및 설명 문구'],
            principle: 'CSS 애니메이션 (@keyframes iconAnimate)로 translateY, rotate, scale 효과 / 부드러운 움직임 (ease-in-out)'
          },
          {
            name: 'User Info Bar',
            features: ['로그인 상태 표시', '로그인/회원가입 버튼 (비로그인 시)', '로그아웃 버튼 (로그인 시)', '관리자 페이지 버튼 (관리자 권한 시)', '첫 관리자 생성 버튼'],
            principle: 'Firebase Authentication 상태 감지 (onAuthStateChanged) / 사용자 정보 동적 표시 / 권한에 따른 조건부 렌더링'
          },
          {
            name: 'Guestbook Form Section',
            features: ['방명록 작성 폼', '이름 입력 필드 (로그인 시 자동 채움)', '메시지 입력 필드 (가로 스크롤만)', '작성 버튼', '비로그인 시 안내 메시지'],
            principle: '로그인 상태에 따른 폼 활성화/비활성화 / Firebase Realtime Database에 데이터 저장 / XSS 방지를 위한 HTML 이스케이프 처리'
          },
          {
            name: 'Guestbook List Section',
            features: ['방명록 목록 표시 (최신순)', '작성자 이름, 작성 시간 (상대 시간), 메시지', '긴 메시지 자동 줄임 (3줄 또는 150자 초과 시)', '더보기 버튼으로 전체 메시지 모달', '본인 글만 수정/삭제 버튼 표시'],
            principle: 'Firebase Realtime Database 실시간 리스너 (onValue) / 날짜 기준 내림차순 정렬 / -webkit-line-clamp로 텍스트 줄임 / 모달로 전체 메시지 표시'
          },
          {
            name: '인증 모달',
            features: ['로그인 폼 (이메일/비밀번호)', '회원가입 폼 (이름, 이메일, 비밀번호, 비밀번호 확인)', '첫 관리자 생성 모달', '에러 메시지 표시', '탭 전환'],
            principle: 'CSS 클래스 토글 (active 클래스) / Firebase Authentication 인증 / 비밀번호 최소 길이 검증 (6자) / 에러 코드별 한국어 메시지 변환'
          },
          {
            name: '관리자 페이지 (admin.html)',
            features: ['대시보드: 통계 카드 (전체 사용자 수, 방명록 수, 관리자 수)', '사용자 관리: 목록 조회, 삭제, 관리자 권한 부여/제거', '방명록 관리: 목록 조회, 삭제'],
            principle: 'Firebase Realtime Database에서 데이터 집계 / 관리자 권한으로 모든 방명록 삭제 가능 / isAdmin 플래그 관리'
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '회원가입: 사용자 입력 → AuthManager.signup() → Firebase Authentication createUserWithEmailAndPassword → 성공 시 자동 로그인',
            '로그인: 사용자 입력 → AuthManager.login() → Firebase Authentication signInWithEmailAndPassword → JWT 토큰 자동 저장 → onAuthStateChanged로 상태 감지',
            '로그아웃: AuthManager.logout() → Firebase Authentication signOut → UI 상태 초기화'
          ]
        },
        permission: {
          title: '권한 관리',
          details: [
            '일반 사용자: isAdmin: false',
            '관리자: isAdmin: true',
            '방명록 수정/삭제: isOwner() 메서드로 작성자 확인 (userId 비교)',
            '관리자 페이지 접근: isAdmin 플래그 확인',
            '관리자 권한으로 모든 방명록 삭제 가능'
          ]
        },
        relationship: {
          title: '데이터 구조',
          details: [
            'guestbooks/{guestbookId}: 방명록 정보 (authorName, message, date, userId, isAdmin)',
            'users/{userId}: 사용자 정보 (email, displayName, isAdmin)',
            'Firebase Authentication UID와 방명록 userId로 작성자 확인'
          ]
        }
      },
      features: {
        security: ['XSS 방지 (HTML 이스케이프 처리)', 'Firebase Authentication (JWT 토큰)', '비밀번호 최소 길이 검증 (6자)', '권한 기반 접근 제어', 'Firebase Realtime Database 보안 규칙'],
        performance: ['Firebase Realtime Database 실시간 동기화', '사용자 정보 캐싱', '시간 표시 업데이트 최적화 (30초마다)', '불필요한 리렌더링 최소화', '이벤트 위임 패턴'],
        ux: ['반응형 디자인 (모바일 우선 설계)', '호버 효과 (입체감)', '부드러운 애니메이션', '모달 및 탭 전환', '긴 메시지 자동 줄임 및 더보기 기능', '상대 시간 표시 (방금 전, N분 전 등)', '사용자 피드백 (로딩 상태, 에러 메시지)'],
        scalability: ['모듈화된 구조 (GuestbookManager, AuthManager 클래스)', 'Firebase 기반 서버리스 아키텍처', '환경 변수 기반 설정', '재사용 가능한 컴포넌트 (모달, 폼, 카드)']
      }
    }
  }

  const details = projectDetails[project.id]

  const AccordionSection = ({ sectionId, title, children }) => {
    const isExpanded = expandedSections[sectionId]
    return (
      <div className="subsection">
        <button 
          className="subsection-title accordion-header"
          onClick={() => toggleSection(sectionId)}
        >
          <span>{title}</span>
          <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        {isExpanded && (
          <div className="accordion-content">
            {children}
          </div>
        )}
      </div>
    )
  }

  const renderBackendContent = () => (
    <>
      <AccordionSection sectionId="backend-server" title={details.backend.server.title}>
        <div className="features-list">
          <h4>주요 기능</h4>
          <ul>
            {details.backend.server.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="principle-box">
          <h4>원리</h4>
          <p>{details.backend.server.principle}</p>
        </div>
      </AccordionSection>

      <AccordionSection sectionId="backend-models" title="데이터 모델 (Models)">
        {details.backend.models.map((model, index) => (
          <div key={index} className="model-box">
            <h4>{model.name}</h4>
            <div className="model-field">
              <strong>필드:</strong> {model.fields}
            </div>
            <div className="model-principle">
              <strong>원리:</strong> {model.principle}
            </div>
          </div>
        ))}
      </AccordionSection>

      <AccordionSection sectionId="backend-middleware" title={details.backend.middleware.title}>
        <div className="features-list">
          <h4>기능</h4>
          <ul>
            {details.backend.middleware.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="principle-box">
          <h4>원리</h4>
          <p>{details.backend.middleware.principle}</p>
        </div>
      </AccordionSection>

      <AccordionSection sectionId="backend-controllers" title="컨트롤러 (Controllers)">
        {details.backend.controllers.map((controller, index) => (
          <div key={index} className="controller-box">
            <h4>{controller.name}</h4>
            <div className="features-list">
              <strong>기능:</strong>
              <ul>
                {controller.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="principle-box">
              <strong>원리:</strong> {controller.principle}
            </div>
          </div>
        ))}
      </AccordionSection>
    </>
  )

  const renderFrontendContent = () => (
    <>
      <AccordionSection sectionId="frontend-routing" title={details.frontend.routing.title}>
        <div className="routes-list">
          <h4>주요 라우트</h4>
          <ul>
            {details.frontend.routing.routes.map((route, index) => (
              <li key={index}>{route}</li>
            ))}
          </ul>
        </div>
      </AccordionSection>

      <AccordionSection sectionId="frontend-api" title={details.frontend.api.title}>
        <div className="features-list">
          <h4>기능</h4>
          <ul>
            {details.frontend.api.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="principle-box">
          <h4>원리</h4>
          <p>{details.frontend.api.principle}</p>
        </div>
      </AccordionSection>

      <AccordionSection sectionId="frontend-components" title="공통 컴포넌트">
        {details.frontend.components.map((component, index) => (
          <div key={index} className="component-box">
            <h4>{component.name}</h4>
            <div className="features-list">
              <strong>기능:</strong>
              <ul>
                {component.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            {component.principle && (
              <div className="principle-box">
                <strong>원리:</strong> {component.principle}
              </div>
            )}
          </div>
        ))}
      </AccordionSection>
    </>
  )

  const renderDataFlowContent = () => (
    <>
      <AccordionSection sectionId="dataflow-auth" title={details.dataFlow.auth.title}>
        <ol className="flow-list">
          {details.dataFlow.auth.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </AccordionSection>

      <AccordionSection sectionId="dataflow-permission" title={details.dataFlow.permission.title}>
        <ul>
          {details.dataFlow.permission.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection sectionId="dataflow-relationship" title={details.dataFlow.relationship.title}>
        <ul>
          {details.dataFlow.relationship.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </AccordionSection>
    </>
  )

  const renderFeaturesContent = () => (
    <div className="features-grid">
      <div className="feature-category">
        <h3>보안</h3>
        <ul>
          {details.features.security.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="feature-category">
        <h3>성능</h3>
        <ul>
          {details.features.performance.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="feature-category">
        <h3>사용자 경험</h3>
        <ul>
          {details.features.ux.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="feature-category">
        <h3>확장성</h3>
        <ul>
          {details.features.scalability.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className="project-detail">
      <div className="detail-container">
        <button className="back-button" onClick={() => navigate(`/projects?filter=${project.status}`)}>
          ← 뒤로가기
        </button>

        {details ? (
          <>
            <div className="project-header">
              <h1 className="project-title">{details.title}</h1>
              <p className="project-subtitle">{details.subtitle}</p>
              <a 
                href={details.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="website-link"
              >
                🌐 {details.website}
              </a>
              <div className="project-tags">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="project-images-compact">
              <div className="device-showcase">
                <div className="device-pc">
                  <img src={project.pcImage} alt={`${project.title} PC`} className="device-image-pc" />
                  <span className="device-label">PC 버전</span>
                </div>
                <div className="device-mobile">
                  <img src={project.mobileImage} alt={`${project.title} Mobile`} className="device-image-mobile" />
                  <span className="device-label">모바일 버전</span>
                </div>
              </div>
            </div>

            <section className="detail-section">
              <h2 className="section-title">프로젝트 개요</h2>
              <div className="info-box">
                <div className="info-item">
                  <span className="info-label">목적</span>
                  <span className="info-value">{details.overview.purpose}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">프론트엔드</span>
                  <span className="info-value">{details.overview.techStack.frontend}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">백엔드</span>
                  <span className="info-value">{details.overview.techStack.backend}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">인증</span>
                  <span className="info-value">{details.overview.techStack.auth}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">배포</span>
                  <span className="info-value">{details.overview.techStack.deploy}</span>
                </div>
              </div>
            </section>

            <div className="analysis-buttons">
              <button className="analysis-button" onClick={() => {
                setExpandedSections({})
                setOpenModal('backend')
              }}>
                <span className="button-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                  </svg>
                </span>
                <span className="button-text">백엔드 구조 및 기능</span>
              </button>
              <button className="analysis-button" onClick={() => {
                setExpandedSections({})
                setOpenModal('frontend')
              }}>
                <span className="button-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                    <path d="M7 8l5 5 5-5"></path>
                  </svg>
                </span>
                <span className="button-text">프론트엔드 구조 및 기능</span>
              </button>
              <button className="analysis-button" onClick={() => {
                setExpandedSections({})
                setOpenModal('dataflow')
              }}>
                <span className="button-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </span>
                <span className="button-text">데이터 흐름 및 원리</span>
              </button>
              <button className="analysis-button" onClick={() => {
                setExpandedSections({})
                setOpenModal('features')
              }}>
                <span className="button-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
                <span className="button-text">주요 기술적 특징</span>
              </button>
            </div>
          </>
        ) : (
          <div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </div>
        )}
      </div>

      <Modal 
        isOpen={openModal === 'backend'} 
        onClose={() => {
          setOpenModal(null)
          setExpandedSections({})
        }}
        title="백엔드 (Server) 구조 및 기능"
      >
        {renderBackendContent()}
      </Modal>

      <Modal 
        isOpen={openModal === 'frontend'} 
        onClose={() => {
          setOpenModal(null)
          setExpandedSections({})
        }}
        title="프론트엔드 (Client) 구조 및 기능"
      >
        {renderFrontendContent()}
      </Modal>

      <Modal 
        isOpen={openModal === 'dataflow'} 
        onClose={() => {
          setOpenModal(null)
          setExpandedSections({})
        }}
        title="데이터 흐름 및 원리"
      >
        {renderDataFlowContent()}
      </Modal>

      <Modal 
        isOpen={openModal === 'features'} 
        onClose={() => {
          setOpenModal(null)
          setExpandedSections({})
        }}
        title="주요 기술적 특징"
      >
        {renderFeaturesContent()}
      </Modal>
    </div>
  )
}

export default ProjectDetail
