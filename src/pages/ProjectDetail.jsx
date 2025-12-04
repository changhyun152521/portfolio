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
        purpose: '중·고등학생을 위한 온라인 수학 강의 플랫폼으로, 학생, 학부모, 강사가 각각의 역할에 맞는 기능을 제공하는 통합 학습 관리 시스템',
        techStack: {
          frontend: 'React 18.2 + Vite 5.0.8 + React Router DOM 6.21.1 + Axios 1.6.2 + Font Awesome 6.4.0',
          backend: 'Node.js + Express 4.18.2 + MongoDB Atlas + Mongoose 8.0.3',
          auth: 'JWT (jsonwebtoken 9.0.2) + bcrypt 5.1.1',
          deploy: 'Vercel (프론트엔드), AWS (백엔드), MongoDB Atlas (백엔드), Cloudinary (파일 저장소)'
        }
      },
      backend: {
        server: {
          title: '서버 설정 (server/index.js)',
          features: [
            'CORS 정책 강화: 기존에 임시로 모든 도메인을 허용하던 설정을 제거하고, mathchang.com 및 개발 환경(localhost, 내부망 IP)만 허용',
            'MongoDB 연결: MONGODB_ATLAS_URL 우선 사용, 없을 경우 로컬 MongoDB 연결, 연결 실패 시 프로세스 종료',
            '요청 로깅: 모든 API 요청 상세 로깅 (메서드, 경로, 본문, 헤더 기록)',
            '에러 핸들링: 4개 파라미터 미들웨어로 통합 에러 처리, 에러 타입별 적절한 HTTP 상태 코드 반환, 개발 환경에서만 스택 트레이스 노출',
            'Rate Limiting 적용: 로그인, 아이디 찾기, 비밀번호 재설정 API에 요청 횟수 제한을 추가하여 브루트포스(무차별대입) 공격을 방지 (로그인 15분당 5회, 비밀번호 재설정 1시간당 3회)',
            '보안 헤더 추가: helmet.js를 적용하여 클릭재킹, MIME 스니핑, XSS 등 일반적인 웹 공격에 대한 방어 헤더를 자동 설정'
          ],
          principle: 'CORS 정책 강화: 기존에 모든 도메인을 허용하던 설정을 제거하고, mathchang.com 및 개발 환경(localhost, 내부망 IP)만 허용하도록 변경 → Origin 헤더 확인 → 허용된 Origin 목록과 비교 → CORS 헤더 자동 설정 (Access-Control-Allow-Origin, Access-Control-Allow-Credentials) → OPTIONS 요청 (Preflight) 명시적 처리 / Rate Limiting: express-rate-limit으로 브루트포스 공격 방지 (로그인 15분당 5회, 비밀번호 재설정 1시간당 3회) / 보안 헤더: helmet.js를 적용하여 클릭재킹, MIME 스니핑, XSS 등 일반적인 웹 공격에 대한 방어 헤더를 자동 설정 (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection 등) / MongoDB 연결: 환경변수 기반 동적 연결 (MONGODB_ATLAS_URL 우선) / 에러 핸들러: 모든 라우트 이후에 위치하여 처리되지 않은 에러 캐치, CORS 헤더를 에러 응답에도 포함'
        },
        models: [
          {
            name: 'User 모델',
            fields: 'userId(Required, Unique, Trimmed), password(Required, Min 7자, bcrypt 해시), name(Required), email(Required, Unique, Email 형식), phone(Required, 숫자/하이픈만), schoolName(Required), studentContact(Required), parentContact(Required), userType(Enum: 학생/학부모/강사), isAdmin(Boolean, Default: false), profileImage(String, Default: ""), privacyAgreement(Boolean, Default: false), termsAgreement(Boolean, Default: false)',
            principle: 'Pre-save hook: 비밀번호 자동 해시 (bcrypt, salt rounds: 10) - 이미 해시된 비밀번호는 재해싱 방지 ($2a$ 또는 $2b$로 시작하는지 확인) / 강사 자동 관리자 권한 부여 (userType === "강사" → isAdmin = true) / Unique 인덱스: userId, email'
          },
          {
            name: 'Course 모델',
            fields: 'sku(String, Unique), courseName, instructorId(ObjectId, User 참조), instructorName, grade(Enum: 중1/중2/중3/고1/고2/고3/N수), courseCount(Number), textbook, textbookType(Enum: 자체교재/시중교재), courseStatus(Enum: 완강/진행중), courseType(Enum: 정규/특강), courseRange, courseDescription, lectures[](Array: lectureNumber, lectureTitle, duration, videoLink)',
            principle: 'instructorId로 User와 populate 가능 / 1:N 관계 (한 강사가 여러 강좌 생성) / sku unique 인덱스'
          },
          {
            name: 'Class 모델',
            fields: 'grade(String), className(String), instructorId(ObjectId, User 참조), instructorName, students[](Array[ObjectId], User 참조), courses[](Array[ObjectId], Course 참조)',
            principle: '{grade, className} 복합 unique 인덱스 (중복 방지) / 다대다(N:M) 관계: 학생 ↔ 반 (한 학생이 여러 반에 속할 수 있음), 강좌 ↔ 반 (한 강좌가 여러 반에 배정될 수 있음)'
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
            fields: 'title, content, author(ObjectId, User 참조), authorName, attachments[](Array: type(Enum: image/video/file), url(Cloudinary URL), filename, originalName)',
            principle: 'createdAt 인덱스 (-1, 내림차순, 최신순 정렬) / Cloudinary URL 저장'
          },
          {
            name: 'PreviewCourse 모델',
            fields: 'title, videoLink(String, YouTube 링크), createdBy(ObjectId, User 참조)',
            principle: 'YouTube 링크 형식 검증 (정규식) - youtube.com 또는 youtu.be 도메인 확인'
          },
          {
            name: 'AttendanceComment 모델',
            fields: 'content, author(ObjectId, User 참조), authorName, courseName, className, isPublic(Boolean), reply(Object: content, author, authorName, createdAt)',
            principle: '댓글-답글 구조 (중첩 스키마) / 공개/비공개 설정 가능'
          },
          {
            name: 'PrivacyLog 모델',
            fields: 'userId(ObjectId, 대상 사용자 ID), action(String, 처리 행위), accessedBy(ObjectId, 접근한 사용자 ID), ipAddress(String), userAgent(String), details(String, 상세 정보)',
            principle: '개인정보 처리 이력 기록 (GDPR 준수) / 모든 개인정보 접근 자동 기록 / IP 주소, User-Agent, 접근 시간 저장 / 보안 감사 용도'
          }
        ],
        middleware: {
          title: '인증 미들웨어 (middleware/auth.js)',
          features: [
            'protect: JWT 토큰 검증 - Authorization 헤더에서 Bearer 토큰 추출 → JWT_SECRET으로 토큰 검증 → 토큰에서 사용자 ID 추출 → User.findById()로 사용자 조회 → req.user에 사용자 정보 저장 (비밀번호 제외)',
            'authorize: 역할 기반 접근 제어 (RBAC) - 관리자는 모든 권한 허용, 지정된 역할만 허용, 권한 없으면 403 반환',
            'authenticate: 하위 호환성을 위한 인증 미들웨어 (protect와 유사하지만 더 간단한 구조)'
          ],
          principle: 'Bearer 토큰 추출 → JWT 검증 → User 조회 → req.user에 저장 / 역할 기반 권한: userType ("학생", "학부모", "강사") + isAdmin (true/false) 조합 / 에러 처리: 토큰 없음/유효하지 않은 토큰/사용자 없음 → 401 Unauthorized'
        },
        controllers: [
          {
            name: 'usersController.js',
            features: [
              '회원가입 (createUser): 입력 데이터 유효성 검증, 비밀번호 자동 해싱 (Pre-save hook), 이메일/아이디 중복 확인, 개인정보 처리 로그 기록',
              '로그인 (login): 아이디/비밀번호 검증, bcrypt로 비밀번호 비교, JWT 토큰 발급, 사용자 정보 반환 (비밀번호 제외)',
              '아이디 찾기 (findUserId): 이름 + 이메일로 아이디 조회, 개인정보 처리 로그 기록',
              '비밀번호 재설정 (resetPassword): 아이디 + 이메일로 사용자 확인, 새 비밀번호 해싱 후 저장, 개인정보 처리 로그 기록',
              '사용자 CRUD: getAllUsers (모든 사용자 조회, 관리자용), getUserById, getUserByUserId, updateUser, deleteUser',
              '사용자 연동: linkUser (학생-학부모 연동), unlinkUser (연동 해지) - 여러 방법으로 연동 관계 확인'
            ],
            principle: 'bcrypt 비밀번호 검증 (bcrypt.compare) / JWT 토큰 발급 (jwt.sign) / PrivacyLog 자동 기록 (IP 주소, User-Agent, 접근 시간 저장)'
          },
          {
            name: 'coursesController.js',
            features: [
              '강좌 CRUD: getAllCourses (모든 강좌 조회, 강사 정보 포함), getCourseById, getCourseBySku, createCourse, updateCourse, deleteCourse',
              '내 강좌 조회 (getMyCourses): 로그인한 학생의 강좌만 조회, 학생이 속한 반의 강좌 조회, 강사 정보 Populate',
              '강사별 강좌 조회: 특정 강사의 모든 강좌 조회'
            ],
            principle: 'instructorId populate (필요한 필드만 선택적으로: userId, name, email, userType, profileImage) / 학생-강좌 매핑 조회 (학생이 속한 반의 강좌)'
          },
          {
            name: 'classesController.js',
            features: [
              '반 CRUD: getAllClasses (모든 반 조회, 학생, 강사, 강좌 정보 포함), getClassById, createClass, updateClass, deleteClass',
              '학생/강좌 관리: addStudents (반에 학생 추가), removeStudents (반에서 학생 제거), addCourses (반에 강좌 추가), removeCourses (반에서 강좌 제거)'
            ],
            principle: '배열 기반 다대다 관계 관리 (class.students.push(studentId), class.courses.push(courseId) → await class.save())'
          },
          {
            name: 'classRecordsController.js',
            features: ['수업 기록 CRUD', '반별 기록 조회'],
            principle: '날짜별 중복 방지 (unique 인덱스)'
          },
          {
            name: 'studentRecordsController.js',
            features: [
              '학생 기록 CRUD: getAllStudentRecords, getStudentRecordsByStudent (학생별 기록 조회), getStudentRecordsByClass (반별 학생 기록 조회), createStudentRecord, updateStudentRecord, deleteStudentRecord',
              '월별 통계 집계: 날짜 범위 쿼리로 월별 데이터 집계, 출석률, 과제 제출률, 평균 점수 계산'
            ],
            principle: '날짜 범위 쿼리로 월별 집계 (startDate = new Date(year, month - 1, 1), endDate = new Date(year, month, 0)) / 출석률, 과제 제출률, 평균 점수 계산'
          },
          {
            name: 'noticesController.js',
            features: [
              '공지사항 CRUD: getAllNotices (모든 공지사항 조회, 최신순), getNoticeById, createNotice, updateNotice, deleteNotice',
              '파일 첨부 (Cloudinary): 이미지, 비디오, 파일 업로드, Cloudinary URL 저장, 원본 파일명 보존'
            ],
            principle: 'Cloudinary 업로드 후 URL 저장 / attachments 배열에 type, url, filename, originalName 저장'
          },
          {
            name: 'previewCoursesController.js',
            features: ['맛보기 강좌 CRUD'],
            principle: 'YouTube 링크 임베드'
          },
          {
            name: 'attendanceCommentsController.js',
            features: [
              '수강 문의 댓글 CRUD: getAllComments (모든 댓글 조회), createComment, updateComment, deleteComment',
              '답글 기능: addReply (답글 추가), updateReply (답글 수정), deleteReply (답글 삭제) - 중첩 스키마로 댓글-답글 구조'
            ],
            principle: '중첩 스키마로 댓글-답글 구조 / reply 필드에 content, author, authorName, createdAt 저장'
          }
        ]
      },
      frontend: {
        routing: {
          title: '라우팅 (App.jsx)',
          routes: [
            '공개: / (홈페이지), /login, /signup, /preview-courses, /preview-courses/:videoId',
            '학생: /my-classroom/courses, /my-classroom/courses/:courseId, /my-class/status, /my-class/:classId/status, /my-class/statistics, /my-class/:classId/monthly-statistics',
            '학부모: /parent-class/status, /parent-class/:classId/status, /parent-class/statistics, /parent-class/:classId/monthly-statistics',
            '관리자: /admin (대시보드), /admin/courses, /admin/users, /admin/classes, /admin/preview-courses, /admin/course/register, /admin/course/edit/:courseId, /admin/user/register, /admin/user/edit/:userId, /admin/class/register, /admin/class/edit/:classId, /admin/class/:classId/records, /admin/class-monthly-statistics, /admin/class/:classId/monthly-statistics, /admin/class-student-records, /admin/class/:classId/student-records',
            '커뮤니티: /community/notice, /community/notice/create, /community/notice/:noticeId, /community/notice/edit/:noticeId, /community/attendance',
            '공통: /profile (내 정보, 로그인 필요)'
          ]
        },
        api: {
          title: 'API 설정 (api/axiosConfig.js)',
          features: [
            'Axios 인스턴스 생성: baseURL (import.meta.env.VITE_API_URL || "/api"), timeout (30초)',
            '요청 인터셉터: localStorage/sessionStorage에서 토큰 자동 추출 → Authorization: Bearer {token} 헤더 자동 설정',
            '응답 인터셉터: 성공 응답 로깅, 에러 응답 처리 (서버 응답 에러 → 에러 객체 반환, 네트워크 에러 → 사용자 친화적 메시지), 401 에러 시 자동 로그아웃 처리'
          ],
          principle: 'localStorage/sessionStorage에서 토큰 자동 추출 / Authorization: Bearer {token} 헤더 자동 추가 / 401 에러 시 자동 로그아웃 처리 (localStorage/sessionStorage에서 토큰 및 사용자 정보 삭제)'
        },
        components: [
          {
            name: 'Header.jsx',
            features: [
              '로그인 상태 관리: localStorage/sessionStorage에서 토큰/사용자 정보 확인, storage 이벤트로 다중 탭 동기화, 3초마다 로그인 상태 재확인',
              '반응형 네비게이션: 데스크톱(호버 기반 드롭다운 메뉴), 모바일(햄버거 메뉴, 토글 방식) - 내강의실(맛보기강좌, 내강좌), 내교실(수업현황, 월별통계), 학부모교실(수업현황, 월별통계), 커뮤니티(공지사항, 수강문의)',
              '사용자 메뉴: 데스크톱(호버로 열기), 모바일(클릭으로 열기) - 내정보, 관리자 페이지(관리자만 표시), 로그아웃',
              '카카오톡 인앱 브라우저 대응: href="javascript:void(0)" 사용, onTouchStart 이벤트로 URL 공유 메뉴 방지, CSS touch-action: manipulation 적용',
              '스크롤 효과: 스크롤 시 헤더 스타일 변경 (scrolled 클래스), 그림자 효과 추가'
            ],
            principle: 'storage 이벤트로 다중 탭 동기화 / 3초마다 로그인 상태 확인 / onTouchStart로 카카오톡 URL 공유메뉴 방지 / 상태 관리: isScrolled, isMobileMenuOpen, isLoggedIn, userName, isAdmin, activeDropdown, isUserMenuOpen'
          },
          {
            name: 'Login.jsx',
            features: [
              '로그인 폼: 아이디, 비밀번호 입력, 유효성 검증, 에러 메시지 표시',
              '아이디 찾기 모달: 이름 + 이메일로 아이디 조회, 모달로 결과 표시',
              '"아이디 기억하기" 기능: 체크박스로 선택, localStorage에 아이디 저장, 다음 로그인 시 자동 입력',
              '토큰 저장: 로그인 성공 시 JWT 토큰 저장 (localStorage 또는 sessionStorage 선택), 사용자 정보도 함께 저장',
              '자동 리다이렉트: 로그인 성공 시 이전 페이지 또는 홈으로 이동, 관리자는 관리자 페이지로 이동'
            ],
            principle: 'JWT 토큰을 localStorage/sessionStorage에 저장 / 사용자 정보도 함께 저장 / 상태 관리: formData, rememberMe, errors, isSubmitting, showFindUserIdModal'
          },
          {
            name: 'MyCourses.jsx',
            features: [
              '내 강좌 목록 조회: 로그인한 학생의 강좌만 표시, 학생이 속한 반의 강좌 조회, API: GET /api/courses/my-courses',
              'YouTube 썸네일 자동 생성: YouTube URL에서 video ID 추출, YouTube 썸네일 API로 썸네일 URL 생성 (https://img.youtube.com/vi/{videoId}/maxresdefault.jpg)',
              '강좌 상태 표시: 완강/진행중 배지 표시, 색상으로 구분 (완강: 초록, 진행중: 주황)',
              '강좌 카드 클릭: 강좌 상세 페이지로 이동 (navigate("/my-classroom/courses/:courseId"))',
              '권한 확인: 로그인 상태 확인, 학부모는 접근 불가 (안내 메시지 표시)'
            ],
            principle: '/courses/my-courses API 호출 / YouTube URL에서 video ID 추출 → 썸네일 URL 생성 / 학생이 속한 반의 강좌 조회'
          },
          {
            name: 'CourseDetail.jsx',
            features: [
              '강좌 상세 정보 표시: 강좌명, 강사명, 학년, 교재 등, 강의 수, 강좌 상태',
              '강의 목록 표시: 회차별 강의 목록, 강의 제목, 재생 시간, YouTube 임베드 플레이어',
              '강의별 진행 상태: 수강 완료 여부 표시, 진행률 표시',
              'YouTube 영상 재생: YouTube iframe API 사용, 반응형 플레이어'
            ],
            principle: '강좌 ID로 상세 정보 조회 / YouTube iframe API로 영상 재생'
          },
          {
            name: 'MyClassStatus.jsx',
            features: [
              '내 수업 현황 목록: 학생이 속한 모든 반 표시, 반별 수업 기록 요약',
              '반별 수업 기록 조회: 날짜별 수업 기록, 진도 내용, 과제 내용, 영상 유무 표시',
              '반 클릭 시 상세 페이지 이동: navigate("/my-class/:classId/status")'
            ],
            principle: '학생이 속한 반 조회 → 반별 수업 기록 조회 / ClassRecord 모델 활용'
          },
          {
            name: 'MyMonthlyStatistics.jsx',
            features: [
              '월별 통계 목록: 반별 월별 통계 표시, 출석률, 과제 제출률, 평균 점수',
              '통계 데이터 집계: API: GET /api/student-records/statistics, 날짜 범위로 월별 데이터 조회, 출석률, 과제 제출률, 평균 점수 계산',
              '반 클릭 시 상세 통계 이동: navigate("/my-class/:classId/monthly-statistics")'
            ],
            principle: '날짜 범위 쿼리로 월별 데이터 집계 / 출석률, 과제 제출률, 평균 점수 계산'
          },
          {
            name: 'ParentClassStatus.jsx',
            features: [
              '자녀의 수업 현황 조회: 학생-학부모 연동 확인, 연동된 학생의 반 조회, 반별 수업 기록 표시',
              '학생-학부모 연동 로직: 방법 1 (학부모 userId = "학생userId_parent"), 방법 2 (학부모 userId = 학생의 parentContact), 방법 3 (학부모 studentContact = 학생의 phone)'
            ],
            principle: '학생-학부모 연동 확인 → 연동된 학생의 반 조회 → 반별 수업 기록 표시'
          },
          {
            name: 'Admin.jsx',
            features: [
              '관리자 대시보드: 관리자 권한 확인, 권한 없으면 접근 차단',
              '관리 메뉴 카드: 강좌 관리, 사용자 관리, 반 관리, 맛보기 강좌 관리, 수업 기록 관리, 통계 조회, 공지사항 관리',
              '카드 클릭 시 해당 페이지로 이동'
            ],
            principle: '관리자 권한 확인 (isAdmin) / 권한 없으면 접근 차단'
          },
          {
            name: 'Notice.jsx',
            features: [
              '공지사항 목록: 모든 공지사항 표시 (최신순), 제목, 작성자, 작성일 표시',
              '검색/필터링: 제목, 내용으로 검색, 작성자로 필터링',
              '공지사항 클릭 시 상세 페이지 이동: navigate("/community/notice/:noticeId")'
            ],
            principle: 'Firebase Realtime Database 또는 API로 공지사항 조회 / 최신순 정렬'
          },
          {
            name: 'ScrollToTop.jsx',
            features: [
              '페이지 이동 시 자동으로 상단으로 스크롤: useLocation 훅으로 경로 변경 감지, window.scrollTo(0, 0) 즉시 실행'
            ],
            principle: 'useLocation 훅으로 pathname 변경 감지 → useEffect로 window.scrollTo(0, 0) 실행'
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '로그인 요청: 클라이언트에서 아이디/비밀번호 입력 → POST /api/users/login → 서버에서 User.findOne({ userId })로 사용자 조회',
            '비밀번호 검증: 서버에서 bcrypt.compare(plainPassword, hashedPassword)로 해시된 비밀번호와 평문 비밀번호 비교',
            'JWT 토큰 발급: 서버에서 jwt.sign({ id, userId, userType, isAdmin }, JWT_SECRET)로 토큰에 사용자 정보 포함하여 발급',
            '토큰 저장: 클라이언트에서 localStorage 또는 sessionStorage에 토큰 저장, 사용자 정보도 함께 저장',
            '인증된 요청: 이후 모든 API 요청에 Authorization: Bearer {token} 헤더 추가 → 서버에서 protect 미들웨어로 토큰 검증 (토큰 추출 → jwt.verify(token) → User.findById(decoded.id) → req.user에 사용자 정보 저장)'
          ]
        },
        permission: {
          title: '권한 관리',
          details: [
            '권한 체계: 사용자 타입 (userType: "학생", "학부모", "강사"), 관리자 여부 (isAdmin: true/false, 강사는 자동 true)',
            '학생 권한: 자신의 강좌, 수업 현황, 통계 조회',
            '학부모 권한: 연동된 자녀의 수업 현황, 통계 조회',
            '강사 권한: 모든 기능 접근 가능 (강좌 관리, 반 관리, 수업 기록 관리, 통계 조회)',
            'authorize 미들웨어: 역할 기반 접근 제어 (RBAC) - 관리자는 모든 권한 허용, 지정된 역할만 허용, 권한 없으면 403 반환'
          ]
        },
        linking: {
          title: '학생-학부모 연동',
          details: [
            '연동 방법 1: 학부모 userId = "학생userId_parent" (예: 학생 userId가 "student123"이면 학부모 userId는 "student123_parent")',
            '연동 방법 2: 학부모 userId = 학생의 parentContact (예: 학생의 parentContact가 "010-1234-5678"이면 학부모 userId는 "010-1234-5678")',
            '연동 방법 3: 학부모 studentContact = 학생의 phone (예: 학생의 phone이 "010-1234-5678"이면 학부모 studentContact는 "010-1234-5678")',
            '연동 조회 로직: 학생인 경우 연동된 학부모 찾기, 학부모인 경우 연동된 학생 찾기 (여러 방법으로 연동 관계 확인)'
          ]
        },
        relationship: {
          title: '데이터 관계',
          details: [
            'User (강사) ──→ Course (1:N): 한 강사가 여러 강좌 생성',
            'User (학생) ──→ Class (N:M): 한 학생이 여러 반에 속할 수 있음',
            'Class ──→ Course (N:M): 한 반에 여러 강좌 배정 가능',
            'Class ──→ ClassRecord (1:N): 한 반에 여러 수업 기록',
            'User (학생) ──→ StudentRecord (1:N): 한 학생의 여러 기록',
            'Class ──→ StudentRecord (1:N): 한 반의 여러 학생 기록',
            'User ──→ Notice (1:N): 한 사용자가 여러 공지사항 작성',
            'User ──→ AttendanceComment (1:N): 한 사용자가 여러 댓글 작성'
          ]
        },
        privacy: {
          title: '개인정보 보호',
          details: [
            'PrivacyLog 기록 시점: 로그인, 아이디 찾기, 비밀번호 재설정, 프로필 조회/수정',
            '기록 정보: 대상 사용자 ID, 처리 행위, 접근한 사용자 ID, IP 주소, User-Agent, 접근 시간, 상세 정보',
            'IP 주소 추출: 프록시 환경 고려 (req.ip, req.headers["x-forwarded-for"], req.headers["x-real-ip"], req.connection.remoteAddress)',
            'GDPR 준수: 모든 개인정보 접근 자동 기록, 보안 감사 용도'
          ]
        }
      },
      features: {
        security: [
          '비밀번호 보안: bcrypt 해싱 (salt rounds: 10), 평문 비밀번호 절대 저장하지 않음, Pre-save hook에서 자동 해싱',
          '인증 보안: JWT 토큰 기반 인증, Bearer Token 형식, 토큰에 사용자 정보 포함 (id, userId, userType, isAdmin), HTTPS 권장 (프로덕션)',
          'CORS 정책 강화: 기존에 임시로 모든 도메인을 허용하던 설정을 제거하고, mathchang.com 및 개발 환경(localhost, 내부망 IP)만 허용하도록 변경',
          'Rate Limiting 적용: 로그인, 아이디 찾기, 비밀번호 재설정 API에 요청 횟수 제한을 추가하여 브루트포스(무차별대입) 공격을 방지 (로그인 15분당 5회, 비밀번호 재설정 1시간당 3회)',
          '보안 헤더 추가: helmet.js를 적용하여 클릭재킹, MIME 스니핑, XSS 등 일반적인 웹 공격에 대한 방어 헤더를 자동 설정',
          '입력 검증: 서버 측 유효성 검증, SQL Injection 방지 (MongoDB 사용), XSS 방지 (입력 데이터 이스케이프)',
          '개인정보 처리 로그: 모든 개인정보 접근 자동 기록, IP 주소, User-Agent, 접근 시간 저장, GDPR 준수'
        ],
        performance: [
          'MongoDB 인덱스 최적화: Unique 인덱스 (userId, email, sku), 복합 인덱스 ({grade, className}, {classId, date}, {studentId, date, classId}), 정렬 인덱스 (createdAt: -1, 최신순)',
          'Populate 최적화: 필요한 필드만 선택적으로 Populate (예: .populate("instructorId", "userId name email userType profileImage"))',
          'React 컴포넌트 최적화: 함수형 컴포넌트 + Hooks, useState, useEffect로 상태 관리, 불필요한 리렌더링 방지',
          '페이지네이션: 대량 데이터 처리 시 페이지네이션 적용'
        ],
        ux: [
          '반응형 디자인: 데스크톱 (968px 이상), 모바일 (968px 이하), CSS 미디어 쿼리로 반응형 구현',
          '카카오톡 인앱 브라우저 대응: href="javascript:void(0)" 사용, onTouchStart 이벤트로 URL 공유 메뉴 방지, CSS touch-action: manipulation 적용',
          '로딩 상태 관리: 모든 비동기 작업에 로딩 상태 표시, 스켈레톤 UI 또는 로딩 스피너',
          '에러 처리: 사용자 친화적 에러 메시지, 401 에러 시 자동 로그아웃, 네트워크 에러 시 재시도 안내',
          '페이지 이동 시 스크롤: ScrollToTop 컴포넌트로 자동 상단 스크롤, useLocation 훅으로 경로 변경 감지',
          '다중 탭 동기화: storage 이벤트로 다중 탭 동기화, 로그인 상태 실시간 업데이트'
        ],
        scalability: [
          '모듈화된 구조: MVC 패턴 (Model, View, Controller 분리), 라우트 분리 (기능별로 라우트 파일 분리), 컴포넌트 분리 (재사용 가능한 컴포넌트)',
          '환경변수 기반 설정: .env 파일로 환경별 설정 관리, 데이터베이스 URL, JWT Secret, CORS Origin 등',
          'Cloudinary 통합: 이미지/비디오/파일 업로드, 자동 최적화 및 변환, CDN 제공',
          '에러 핸들링 통합: 통합 에러 핸들러로 모든 에러 처리, 에러 타입별 적절한 HTTP 상태 코드 반환'
        ]
      }
    },
    3: {
      title: '캠핑공작소',
      subtitle: '캠핑카 DIY 공방 웹사이트',
      website: 'https://www.campgong.com/',
      overview: {
        purpose: '캠핑카 DIY 공방 웹사이트로, DIY 공방을 운영하며 자작회원들과 함께하는 전문 캠핑카 커스터마이징 공간을 소개하고, YouTube 영상을 통한 교육 콘텐츠를 제공하는 웹 애플리케이션',
        techStack: {
          frontend: 'React 18.2.0 + Vite 5.0.8 + React Router DOM 6.20.1 + Axios 1.6.2',
          backend: 'Node.js v18+ + Express 최신 + MongoDB Atlas + Mongoose 최신',
          auth: 'JWT (jsonwebtoken 최신) + bcryptjs 최신',
          deploy: 'Vercel (프론트엔드), Heroku (백엔드), MongoDB Atlas (백엔드)'
        }
      },
      backend: {
        server: {
          title: '서버 설정 (server/index.js)',
          features: [
            'CORS 설정: 모든 origin 허용 (클라이언트와 서버가 다른 도메인에 있어 CORS 설정 필수)',
            'MongoDB 연결: 환경변수 기반 동적 연결 (MONGODB_ATLAS_URL 우선, 없을 경우 로컬 MongoDB)',
            'JSON 파싱 미들웨어: express.json(), express.urlencoded({ extended: true })',
            '요청 로깅: API 요청 상세 로깅 (메서드, 경로, 본문, 헤더 기록)',
            '에러 핸들링: 통합 에러 핸들러로 모든 에러 처리, 에러 타입별 적절한 HTTP 상태 코드 반환',
            '헬스 체크: /health 엔드포인트로 서버 상태 확인 가능'
          ],
          principle: 'CORS 미들웨어: 모든 응답에 CORS 헤더 추가 / MongoDB 연결: 환경변수 기반 동적 연결 (.env 파일에서 MONGODB_URI 또는 MONGODB_ATLAS_URL 사용) / 에러 핸들링: 모든 라우트 이후에 위치하여 처리되지 않은 에러 캐치 / 헬스 체크: 서버 상태 모니터링 용도'
        },
        models: [
          {
            name: 'User 모델',
            fields: 'userId (String, unique, indexed, required), password (String, required, minlength: 6, bcrypt 해시), name (String, required), phoneNumber (String, optional, default: ""), userType (Enum: ["admin", "customer"], default: "customer"), createdAt (Date, auto), updatedAt (Date, auto)',
            principle: 'Unique 인덱스: userId (중복 방지) / 비밀번호는 컨트롤러에서 bcrypt로 해싱 (salt rounds: 10) / 타임스탬프 자동 관리 (Mongoose timestamps) / 기본값: userType: customer'
          },
          {
            name: 'Video 모델',
            fields: 'title (String, required), youtubeUrl (String, required, validated), thumbnailUrl (String), videoType (Enum: ["자작솜씨", "자작강의", "기타"], default: "자작솜씨"), videoFormat (Enum: ["동영상", "쇼츠"], default: "동영상"), publishedAt (Date, YouTube 게시 시간), order (Number, default: 0), createdAt (Date, auto), updatedAt (Date, auto)',
            principle: 'YouTube URL 형식 자동 검증 (validator) / Enum으로 타입/형식 제한 / publishedAt 우선 사용, 없으면 createdAt 사용 / Shorts 자동 감지 (duration ≤ 60초 또는 #Shorts 태그)'
          },
          {
            name: 'Inquiry 모델',
            fields: 'title (String, required), content (String, required), author (ObjectId, ref: "User", required), authorName (String, required), email (String, optional), phone (String, required), status (Enum: ["답변대기", "답변완료"], default: "답변대기"), views (Number, default: 0), answer (String, optional), answeredAt (Date, optional), answeredBy (ObjectId, ref: "User", optional), createdAt (Date, auto), updatedAt (Date, auto)',
            principle: 'author와 answeredBy로 User와 populate 가능 / 인덱스: createdAt: -1 (최신순 정렬 최적화), status: 1 (상태별 필터링 최적화) / 조회수 자동 증가 기능 / 답변 작성 시 상태 자동 변경 (답변완료)'
          }
        ],
        middleware: {
          title: '인증 미들웨어 (middleware/auth.js)',
          features: [
            'verifyToken: Authorization 헤더에서 Bearer 토큰 추출 → "Bearer " 접두사 제거 → JWT 검증 (JWT_SECRET 사용) → 디코딩된 정보를 req.user에 저장 → 에러 처리 (JsonWebTokenError, TokenExpiredError → 401 Unauthorized)',
            'verifyAdmin: verifyToken 미들웨어가 먼저 실행되어야 함 → req.user.userType === "admin" 확인 → 관리자가 아니면 403 Forbidden 응답 → 모든 관리자 전용 라우트에 적용하여 이중 체크로 보안 강화'
          ],
          principle: 'Bearer 토큰 추출 → JWT 검증 → req.user에 저장 / 관리자 권한 확인: req.user.userType !== "admin" 시 403 반환 / 에러 처리: 유효하지 않은 토큰, 만료된 토큰, 사용자 없음 → 401 Unauthorized'
        },
        controllers: [
          {
            name: 'userController.js',
            features: [
              'createUser (회원가입): 비밀번호 bcrypt 해싱 (salt rounds: 10), userId 중복 확인, 기본값: userType: "customer"',
              'loginUser (로그인): bcrypt 비밀번호 검증, JWT 토큰 발급 (7일 유효), 토큰에 userId, id, userType 포함',
              'getUserByToken (토큰으로 사용자 정보 조회): 미들웨어에서 검증된 토큰 사용, MongoDB 연결 상태 확인, 비밀번호 제외하고 응답',
              'getAllUsers (모든 사용자 조회, 관리자): 페이지네이션 지원, 최신순 정렬 (createdAt: -1), 비밀번호 제외',
              'updateUser (사용자 수정): 비밀번호는 선택적 업데이트 (빈 값이면 유지), findByIdAndUpdate 사용',
              'deleteUser (사용자 삭제): 관리자만 가능'
            ],
            principle: 'bcrypt 비밀번호 해싱 (salt rounds: 10) / JWT 토큰 발급 (7일 유효) / 토큰에 userId, id, userType 포함 / 비밀번호는 응답에서 제외'
          },
          {
            name: 'videoController.js',
            features: [
              'getAllVideos (모든 영상 조회): 페이지네이션 지원 (기본: page=1, limit=10), publishedAt 기준 정렬 (없으면 createdAt), MongoDB aggregation 사용',
              'syncChannelVideos (YouTube 채널 동기화): YouTube Data API로 채널 정보 가져오기 → 업로드 플레이리스트 ID 추출 → 플레이리스트의 모든 영상 가져오기 (페이지네이션) → 각 영상 처리 (Shorts 자동 감지, 썸네일 URL 생성, 게시 시간 파싱) → 기존 영상 업데이트 또는 새 영상 생성 → 에러 처리 (YouTube API 오류 시 RSS 피드로 자동 전환, 재시도 로직 최대 3회, 타임아웃 30초)',
              'updateVideoType (영상 타입 수정): 관리자만 가능, 타입: "자작솜씨", "자작강의", "기타"'
            ],
            principle: 'YouTube Data API v3로 채널 영상 가져오기 / Shorts 자동 감지: 1단계 (제목/설명에 #Shorts 태그 확인), 2단계 (YouTube Data API로 duration 확인, 60초 이하면 Shorts로 분류) / RSS 피드 백업 (API 키 없을 때) / 중복 방지: youtubeUrl 또는 videoId로 확인 / 에러 처리: API 할당량 초과 시 대기 후 재시도'
          },
          {
            name: 'inquiryController.js',
            features: [
              'getAllInquiries (모든 문의사항 조회): 페이지네이션 지원, User 모델과 populate, 최신순 정렬',
              'getInquiryById (문의사항 상세 조회): 조회수 자동 증가, 작성자/답변자 정보 포함',
              'createInquiry (문의사항 작성): 로그인한 회원만 가능 (verifyToken), 작성자 정보 자동 저장, 기본 상태: "답변대기"',
              'updateInquiryAnswer (답변 작성/수정): 관리자만 가능 (verifyAdmin), 답변 작성 시 상태 자동 변경 ("답변완료"), answeredAt, answeredBy 자동 저장',
              'deleteInquiry (문의사항 삭제): 작성자 본인 또는 관리자만 가능, 권한 체크 로직 포함'
            ],
            principle: '작성자 본인 또는 관리자만 삭제 가능 / 관리자만 답변 작성 가능 / 답변 작성 시 상태 자동 변경 (답변완료) / User 모델과 populate로 작성자 정보 조회 / 조회수 자동 증가 기능'
          }
        ]
      },
      frontend: {
        routing: {
          title: '라우팅 (App.jsx)',
          routes: [
            '공개: / (Home - 홈페이지), /about (AboutPage - 회사소개), /contact (ContactPage - 문의사항)',
            '영상: /videos/:type (VideoPage - 영상 페이지, 동영상/쇼츠 분리 표시), /videos/:type/list (VideoListPage - 영상 목록, 페이지네이션), /videos/:type/shorts (ShortsPage - TikTok 스타일 쇼츠 플레이어)',
            '관리자: /admin (AdminPage - 관리자 대시보드), /admin/users (UserManagement - 유저 관리), /admin/videos (VideoManagement - 영상 관리)',
            '공통: ScrollToTop 컴포넌트로 페이지 전환 시 상단 스크롤'
          ]
        },
        api: {
          title: 'API 설정 (utils/api.js)',
          features: [
            'Axios 인스턴스 생성: baseURL (import.meta.env.VITE_API_URL || "/api"), timeout 설정',
            '요청 인터셉터: localStorage에서 토큰 자동 추출 → Authorization: Bearer {token} 헤더 자동 설정',
            '응답 인터셉터: 성공 응답 로깅, 에러 응답 처리 (서버 응답 에러 → 에러 객체 반환, 네트워크 에러 → 사용자 친화적 메시지), 401 에러 시 자동 로그아웃 처리 (localStorage에서 토큰 및 사용자 정보 삭제)'
          ],
          principle: 'localStorage에서 토큰 자동 추출 / Authorization: Bearer {token} 헤더 자동 추가 / 401 에러 시 자동 로그아웃 처리 / 모든 API 요청에 자동으로 토큰 추가'
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
            features: [
              'Hero 섹션: 배너 이미지, 6개 버튼 이미지 오버레이',
              'About Section (회사소개): 회사 소개 텍스트, 프로필 이미지 2개 (동적 높이 조정)',
              'Services Section (주요 서비스): 6개 서비스 카드, SVG 아이콘 사용',
              'Video Section (영상 보기): 최신 동영상 4개 표시, 동영상만 필터링 (쇼츠 제외), 최신순 정렬'
            ],
            principle: 'ResizeObserver로 오른쪽 이미지 크기 변화 감지 → 왼쪽 이미지를 오른쪽의 95% 높이로 맞춤 → Aspect ratio 유지하며 너비 계산 → requestAnimationFrame으로 렌더링 최적화 → 디바운싱으로 성능 최적화'
          },
          {
            name: 'AboutPage.jsx',
            features: [
              '회사소개 페이지: 상세한 회사 정보 표시',
              '동적 이미지 높이 조정: Home.jsx와 동일한 로직 사용'
            ],
            principle: 'ResizeObserver로 이미지 크기 동기화 / 반응형 디자인 대응'
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
            features: [
              '세로 스와이프 네비게이션: 좌우 스와이프로 다음/이전 쇼츠, 최소 거리 50px, 위아래 스크롤과 구분',
              '자동 재생: YouTube iframe API 사용, 초기에는 mute 상태 (브라우저 정책), loop & playlist로 반복 재생',
              '재생 제어: 음소거/해제 토글, 재생/일시정지 토글, YouTube iframe API postMessage 사용',
              '다양한 네비게이션 방법: 터치 스와이프, 마우스 드래그, 키보드 화살표 (←/→), 좌우 버튼 클릭, 인디케이터 클릭'
            ],
            principle: 'YouTube iframe API 통신: postMessage로 재생 제어 (playVideo, mute, unMute) / 터치 스와이프 감지: 좌우 스와이프가 위아래 스크롤보다 크면 쇼츠 네비게이션 / YouTube Embed URL 설정: autoplay=1, mute=1 (초기), loop=1, playlist=${videoId}, enablejsapi=1 / 부드러운 전환 애니메이션'
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
            features: [
              '영상 목록 조회: 페이지네이션 (10개/페이지), 최신순 정렬',
              'YouTube 채널 동기화: 버튼 클릭 시 /videos/admin/sync 호출, 동기화 진행 상태 표시',
              '영상 타입 변경: 드롭다운으로 타입 변경, 낙관적 업데이트로 즉시 UI 반영, 실패 시 원래 상태로 복구'
            ],
            principle: '낙관적 업데이트: 즉시 UI 업데이트 → 비동기로 서버 업데이트 → 실패 시 원래 상태로 복구 / 사용자 경험 향상 (즉각적인 피드백)'
          },
          {
            name: 'ScrollToTop.jsx',
            features: [
              '페이지 이동 시 자동으로 상단으로 스크롤: useLocation 훅으로 경로 변경 감지, window.scrollTo({ top: 0, behavior: "instant" }) 즉시 실행'
            ],
            principle: 'useLocation 훅으로 pathname 변경 감지 → useEffect로 window.scrollTo 실행'
          }
        ]
      },
      dataFlow: {
        auth: {
          title: '인증 흐름',
          steps: [
            '로그인 요청: 클라이언트에서 아이디/비밀번호 입력 → POST /api/users/login → 서버에서 User.findOne({ userId })로 사용자 조회',
            '비밀번호 검증: 서버에서 bcrypt.compare(plainPassword, hashedPassword)로 해시된 비밀번호와 평문 비밀번호 비교',
            'JWT 토큰 발급: 서버에서 jwt.sign({ userId, id, userType }, JWT_SECRET, { expiresIn: "7d" })로 토큰에 사용자 정보 포함하여 발급',
            '토큰 저장: 클라이언트에서 localStorage에 토큰 저장, 사용자 정보도 함께 저장',
            '인증된 요청: 이후 모든 API 요청에 Authorization: Bearer {token} 헤더 추가 → 서버에서 verifyToken 미들웨어로 토큰 검증 (토큰 추출 → jwt.verify(token) → req.user에 사용자 정보 저장)'
          ]
        },
        youtubeSync: {
          title: 'YouTube 채널 동기화 흐름',
          steps: [
            '관리자가 "채널 동기화" 버튼 클릭 → POST /api/videos/admin/sync → verifyToken + verifyAdmin 미들웨어',
            'YouTube Data API 호출: 채널 정보 가져오기 → 업로드 플레이리스트 ID 추출 → 플레이리스트의 모든 영상 가져오기 (페이지네이션)',
            '각 영상 처리: videoId 추출 → 제목, 썸네일 가져오기 → Shorts 감지 (duration 확인 또는 #Shorts 태그) → 게시 시간 파싱',
            'MongoDB 저장/업데이트: 기존 영상 확인 (youtubeUrl 또는 videoId로) → 업데이트 또는 생성',
            '에러 처리: YouTube API 오류 시 RSS 피드로 자동 전환, 재시도 로직 (최대 3회), 타임아웃 설정 (30초), API 할당량 초과 시 대기 후 재시도'
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
            'User (작성자) ──→ Inquiry (1:N): 한 사용자가 여러 문의사항 작성',
            'User (답변자) ──→ Inquiry (1:N): 한 관리자가 여러 문의사항에 답변',
            'Video ──→ (독립적, YouTube URL 기반): YouTube 영상 정보만 저장, 다른 모델과의 관계 없음'
          ]
        },
        filtering: {
          title: '영상 필터링 및 분류 흐름',
          details: [
            '사용자가 /videos/자작솜씨/list 접속 → URL 파라미터 디코딩 (type = decodeURIComponent("자작솜씨"))',
            'API 호출: GET /api/videos?limit=1000 → 모든 영상 가져오기',
            '프론트엔드 필터링: videoType === "자작솜씨" 필터링 → videoFormat === "동영상" 필터링 (쇼츠 제외) → publishedAt 기준 정렬',
            '페이지네이션: 현재 페이지 (currentPage) → 페이지당 4개 → 시작 인덱스: (currentPage-1) * 4',
            'UI 렌더링: 영상 카드 그리드, 페이지네이션 버튼'
          ]
        }
      },
      features: {
        security: [
          '비밀번호 보안: bcrypt 해싱 (salt rounds: 10), 최소 길이 6자, 복잡도 요구 (영문 + 숫자)',
          '인증 보안: JWT 토큰 기반 인증 (7일 만료), Bearer 토큰 형식, 토큰에 userId, id, userType 포함, HTTPS 권장 (프로덕션)',
          '권한 관리: 역할 기반 접근 제어 (RBAC) - 일반 사용자: 자신의 데이터만 접근, 관리자: 모든 데이터 접근 가능, 이중 체크 (verifyToken + verifyAdmin)',
          '입력 검증: Mongoose 스키마 검증 (데이터 타입, 필수 필드), YouTube URL 검증 (정규식으로 형식 확인), 에러 처리 (사용자 친화적 에러 메시지)'
        ],
        performance: [
          '데이터베이스 최적화: 인덱스 사용 (userId unique, createdAt 정렬 최적화, status 필터링 최적화), MongoDB aggregation으로 효율적 쿼리',
          'API 최적화: 페이지네이션으로 대량 데이터 처리, Populate로 관계 데이터 효율적 조회, 타임아웃 설정 (30초)',
          'YouTube API 최적화: 재시도 로직 (최대 3회), API 할당량 관리, RSS 피드 백업 (API 키 없을 때)',
          '프론트엔드 최적화: ResizeObserver로 동적 크기 조정, requestAnimationFrame으로 렌더링 최적화, 디바운싱으로 불필요한 계산 방지, useCallback으로 함수 메모이제이션, 낙관적 업데이트로 즉각적인 UI 피드백'
        ],
        ux: [
          '반응형 디자인: 모바일/데스크톱 최적화, CSS 미디어 쿼리로 반응형 구현',
          'TikTok 스타일 쇼츠 플레이어: 세로 스와이프 네비게이션, 자동 재생, 재생 제어 (음소거/해제, 재생/일시정지), 다양한 네비게이션 방법 (터치, 마우스, 키보드, 버튼)',
          '로딩 상태 관리: 모든 비동기 작업에 로딩 상태 표시, 스켈레톤 UI 또는 로딩 스피너',
          '에러 처리: 사용자 친화적 에러 메시지, 401 에러 시 자동 로그아웃, 네트워크 에러 시 재시도 안내',
          '페이지 이동 시 스크롤: ScrollToTop 컴포넌트로 자동 상단 스크롤, useLocation 훅으로 경로 변경 감지',
          '모바일 전화 버튼: Footer 근처에서 자동 숨김, ResizeObserver로 Footer 위치 감지, 스크롤 이벤트 디바운싱',
          '상대 시간 표시: "N일 전", "N시간 전" 등 사용자 친화적 시간 표시'
        ],
        scalability: [
          '모듈화된 구조: MVC 패턴 (Model, View, Controller 분리), 라우트 분리 (기능별로 라우트 파일 분리), 컴포넌트 분리 (재사용 가능한 컴포넌트)',
          '환경변수 기반 설정: .env 파일로 환경별 설정 관리, 데이터베이스 URL, JWT Secret, YouTube API Key 등',
          '에러 핸들링 통합: 통합 에러 핸들러로 모든 에러 처리, 에러 타입별 적절한 HTTP 상태 코드 반환',
          '타입 안정성: Enum 사용으로 타입 제한 (videoType, videoFormat, status, userType), Mongoose 스키마 검증'
        ]
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
          deploy: 'GitHub (프론트엔드), Vercel (프론트엔드)'
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
          deploy: 'Vercel (프론트엔드), GitHub (프론트엔드)'
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
              <h4>원리</h4>
              <p>{controller.principle}</p>
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
                <h4>원리</h4>
                <p>{component.principle}</p>
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

      {details.dataFlow.linking && (
        <AccordionSection sectionId="dataflow-linking" title={details.dataFlow.linking.title}>
          <ul>
            {details.dataFlow.linking.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </AccordionSection>
      )}

      <AccordionSection sectionId="dataflow-relationship" title={details.dataFlow.relationship.title}>
        <ul>
          {details.dataFlow.relationship.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </AccordionSection>

      {details.dataFlow.privacy && (
        <AccordionSection sectionId="dataflow-privacy" title={details.dataFlow.privacy.title}>
          <ul>
            {details.dataFlow.privacy.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </AccordionSection>
      )}
      {details.dataFlow.youtubeSync && (
        <AccordionSection sectionId="dataflow-youtube-sync" title={details.dataFlow.youtubeSync.title}>
          <ol className="flow-list">
            {details.dataFlow.youtubeSync.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </AccordionSection>
      )}
      {details.dataFlow.filtering && (
        <AccordionSection sectionId="dataflow-filtering" title={details.dataFlow.filtering.title}>
          <ul>
            {details.dataFlow.filtering.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </AccordionSection>
      )}
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
