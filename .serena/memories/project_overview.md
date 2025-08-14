# SAYU Project Overview

## Purpose
SAYU는 사용자의 내면과 예술을 연결하는 관계 중심 플랫폼입니다. 16가지 APT 유형별 고유한 UX/UI와 인터랙션 패턴을 구현한 예술 추천 및 전시 정보 서비스입니다.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Railway, Vercel
- **Image Storage**: Cloudinary
- **Authentication**: OAuth (Facebook, Google)

## Core Architecture
- Monorepo structure with workspaces: frontend, backend, shared
- API-based communication between frontend and backend
- Supabase for database management with complex art/exhibition data
- Mobile-first responsive design

## Key Features
- Personality-based art recommendation (16 APT types)
- Exhibition discovery and tracking
- Artist profiles and artwork collections
- Quiz system for personality assessment
- Mobile-optimized interface

## Database Structure
- exhibitions table (main exhibition data)
- artists table (artist information)
- venues table (exhibition venues)
- users table (user profiles with APT types)
- Various recommendation and preference tables