import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    
    // Create Supabase client with service role (for admin operations)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    switch (action) {
      case 'create_daily_session':
        // 오늘의 Art Pulse 세션 생성
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // 오늘의 챌린지 찾기
        const { data: challenge, error: challengeError } = await supabaseAdmin
          .from('daily_challenges')
          .select('id')
          .eq('challenge_date', today.toISOString().split('T')[0])
          .single()
        
        if (challengeError || !challenge) {
          throw new Error('오늘의 챌린지를 찾을 수 없습니다')
        }
        
        // 이미 세션이 있는지 확인
        const { data: existingSession } = await supabaseAdmin
          .from('art_pulse_sessions')
          .select('id')
          .eq('daily_challenge_id', challenge.id)
          .single()
        
        if (existingSession) {
          return new Response(
            JSON.stringify({ message: '이미 오늘의 세션이 존재합니다', session: existingSession }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // 새 세션 생성
        const startTime = new Date(today)
        startTime.setHours(19, 0, 0, 0)
        
        const endTime = new Date(today)
        endTime.setHours(19, 25, 0, 0)
        
        const { data: newSession, error: sessionError } = await supabaseAdmin
          .from('art_pulse_sessions')
          .insert({
            daily_challenge_id: challenge.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'scheduled'
          })
          .select()
          .single()
        
        if (sessionError) {
          throw sessionError
        }
        
        return new Response(
          JSON.stringify({ message: '세션이 생성되었습니다', session: newSession }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
      case 'update_session_status':
        // 세션 상태 업데이트
        const now = new Date()
        
        // 시작 시간이 된 세션을 active로
        await supabaseAdmin
          .from('art_pulse_sessions')
          .update({ status: 'active' })
          .eq('status', 'scheduled')
          .lte('start_time', now.toISOString())
          .gt('end_time', now.toISOString())
        
        // 종료 시간이 지난 세션을 completed로
        await supabaseAdmin
          .from('art_pulse_sessions')
          .update({ status: 'completed' })
          .in('status', ['scheduled', 'active'])
          .lte('end_time', now.toISOString())
        
        return new Response(
          JSON.stringify({ message: '세션 상태가 업데이트되었습니다' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})