-- Cron Job 로그 테이블 생성
-- Railway에서 실행되는 cron job들의 실행 기록을 저장

CREATE TABLE IF NOT EXISTS cron_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'running')),
    metadata JSONB DEFAULT '{}',
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    execution_time INTEGER, -- 실행 시간 (milliseconds)
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON cron_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON cron_job_logs(executed_at DESC);

-- 자동 정리를 위한 함수 (오래된 로그 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cron_job_logs 
    WHERE executed_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 코멘트 추가
COMMENT ON TABLE cron_job_logs IS 'Railway cron job 실행 로그';
COMMENT ON COLUMN cron_job_logs.job_name IS '작업 이름 (exhibition-collection, data-backup 등)';
COMMENT ON COLUMN cron_job_logs.status IS '실행 상태 (success, failed, running)';
COMMENT ON COLUMN cron_job_logs.metadata IS '작업 관련 추가 정보 (JSON)';
COMMENT ON COLUMN cron_job_logs.execution_time IS '실행 시간 (밀리초)';

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO cron_job_logs (job_name, status, metadata, executed_at) VALUES 
    ('exhibition-collection', 'success', '{"collected": 25, "duplicates": 5}', NOW() - INTERVAL '1 day'),
    ('data-backup', 'success', '{"backupFile": "exhibition-backup-2025-07-15.json", "cleanedCount": 3}', NOW() - INTERVAL '1 day'),
    ('system-maintenance', 'success', '{"total": 4, "success": 4, "failed": 0}', NOW() - INTERVAL '7 days'),
    ('status-update', 'success', '{"ongoing": 12, "ended": 8, "total": 20}', NOW() - INTERVAL '1 hour');

-- 권한 설정 (필요한 경우)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cron_job_logs TO your_service_role;