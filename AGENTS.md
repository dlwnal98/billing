# 프로젝트 규칙

## 서비스 개요
전자세금계산서 발행 웹서비스.
화물 운수업 개인사업자(5060대)를 위한 서비스.
팝빌(Popbill) API로 세금계산서 발행.

## 기술 스택
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (DB + Auth)
- 팝빌 API (세금계산서 발행)
- 배포: Vercel

## 절대 규칙
1. 모든 UI 텍스트는 한글 (버튼, 라벨, 에러 메시지, placeholder 전부)
2. 날짜 형식: YYYY년 MM월 DD일
3. 금액 형식: 천단위 콤마 + 원 (예: 1,000,000원)
4. 글씨 크기 최소 16px, 주요 버튼 최소 18px
5. 버튼/클릭 영역 최소 44px
6. lib/popbill.ts는 app/api/ 폴더 안에서만 import (클라이언트 컴포넌트 금지)
7. lib/supabase-admin.ts는 app/api/ 폴더 안에서만 import
8. 리스트 렌더링 key는 반드시 고유 id 사용 (index 절대 금지)
9. any 타입 사용 금지
10. API 에러 메시지는 모두 한글

## 폴더 구조
app/
  (auth)/login, signup
  (main)/layout, page, issue, history, clients, mypage
  cert/
  api/auth, cert, clients, issue, history, dashboard
components/ hooks/ lib/ types/
middleware.ts

## 주요 타입 (types/index.ts)
- User, Client, Taxinvoice, InvoiceFormItem, ClientGroup, ApiResponse
