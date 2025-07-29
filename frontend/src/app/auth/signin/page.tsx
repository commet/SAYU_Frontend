import { SupabaseAuthForm } from '@/src/components/auth/supabase-auth-form'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            SAYU에 로그인
          </h1>
          <p className="text-sm text-muted-foreground">
            이메일과 비밀번호를 입력하세요
          </p>
        </div>
        <SupabaseAuthForm mode="signin" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link
            href="/auth/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}