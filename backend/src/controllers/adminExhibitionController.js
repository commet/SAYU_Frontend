const { createClient } = require('@supabase/supabase-js');
const { log } = require('../config/logger');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Admin Exhibition Controller
 * 전시 관리자 전용 컨트롤러 - 제출 검토, 승인/거부, 통계 등
 */
const adminExhibitionController = {
  // 제출된 전시 목록 조회 (관리자 전용)
  async getSubmissions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'pending',
        search,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // 기본 쿼리 - 제출 상태별 필터링
      let query = supabase
        .from('exhibition_submissions')
        .select(`
          *,
          exhibitions!inner(
            id,
            title,
            description,
            start_date,
            end_date,
            venue_name,
            venue_city,
            status,
            created_at,
            updated_at
          )
        `, { count: 'exact' })
        .range(offset, offset + limit - 1);

      // 상태 필터
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // 검색 필터
      if (search) {
        query = query.or(`
          submitter_name.ilike.%${search}%,
          submitter_email.ilike.%${search}%,
          organization.ilike.%${search}%,
          exhibitions.title.ilike.%${search}%
        `);
      }

      // 정렬
      query = query.order(sort, { ascending: order === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // 통계 정보 추가
      const { data: stats } = await supabase
        .from('exhibition_submissions')
        .select('status')
        .eq('status', 'pending');

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        stats: {
          pendingCount: stats?.length || 0
        }
      });
    } catch (error) {
      log.error('Admin get submissions error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions'
      });
    }
  },

  // 특정 제출 상세 조회
  async getSubmissionDetail(req, res) {
    try {
      const { submissionId } = req.params;

      const { data, error } = await supabase
        .from('exhibition_submissions')
        .select(`
          *,
          exhibitions!inner(
            id,
            title,
            description,
            start_date,
            end_date,
            venue_name,
            venue_address,
            venue_city,
            venue_phone,
            admission_fee,
            website_url,
            image_url,
            tags,
            status,
            view_count,
            like_count,
            created_at,
            updated_at
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      log.error('Admin get submission detail error', {
        error: error.message,
        submissionId: req.params.submissionId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch submission details'
      });
    }
  },

  // 제출 승인
  async approveSubmission(req, res) {
    try {
      const { submissionId } = req.params;
      const { reviewNotes } = req.body;
      const adminId = req.userId;

      // 제출 정보 조회
      const { data: submission, error: fetchError } = await supabase
        .from('exhibition_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }

      // 트랜잭션 시작 - 제출 상태 업데이트 및 전시 활성화
      const { error: updateError } = await supabase
        .from('exhibition_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          review_notes: reviewNotes
        })
        .eq('id', submissionId);

      if (updateError) {
        throw updateError;
      }

      // 전시 상태를 'upcoming'으로 변경
      const { error: exhibitionError } = await supabase
        .from('exhibitions')
        .update({
          status: 'upcoming',
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.exhibition_id);

      if (exhibitionError) {
        throw exhibitionError;
      }

      log.info('Exhibition submission approved', {
        submissionId,
        exhibitionId: submission.exhibition_id,
        adminId,
        submitterEmail: submission.submitter_email
      });

      res.json({
        success: true,
        message: 'Submission approved successfully'
      });
    } catch (error) {
      log.error('Admin approve submission error', {
        error: error.message,
        submissionId: req.params.submissionId,
        adminId: req.userId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to approve submission'
      });
    }
  },

  // 제출 거부
  async rejectSubmission(req, res) {
    try {
      const { submissionId } = req.params;
      const { reviewNotes, reason } = req.body;
      const adminId = req.userId;

      if (!reviewNotes) {
        return res.status(400).json({
          success: false,
          error: 'Review notes are required for rejection'
        });
      }

      // 제출 정보 조회
      const { data: submission, error: fetchError } = await supabase
        .from('exhibition_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }

      // 제출 상태 업데이트
      const { error: updateError } = await supabase
        .from('exhibition_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          review_notes: reviewNotes,
          rejection_reason: reason
        })
        .eq('id', submissionId);

      if (updateError) {
        throw updateError;
      }

      // 전시 상태를 'draft'로 변경
      const { error: exhibitionError } = await supabase
        .from('exhibitions')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.exhibition_id);

      if (exhibitionError) {
        throw exhibitionError;
      }

      log.info('Exhibition submission rejected', {
        submissionId,
        exhibitionId: submission.exhibition_id,
        adminId,
        reason,
        submitterEmail: submission.submitter_email
      });

      res.json({
        success: true,
        message: 'Submission rejected successfully'
      });
    } catch (error) {
      log.error('Admin reject submission error', {
        error: error.message,
        submissionId: req.params.submissionId,
        adminId: req.userId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to reject submission'
      });
    }
  },

  // 전시 정보 수정 (관리자 전용)
  async updateExhibition(req, res) {
    try {
      const { exhibitionId } = req.params;
      const updateData = req.body;
      const adminId = req.userId;

      // 허용된 필드만 업데이트
      const allowedFields = [
        'title', 'description', 'start_date', 'end_date',
        'venue_name', 'venue_address', 'venue_city', 'venue_phone',
        'admission_fee', 'website_url', 'image_url', 'tags', 'status'
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      filteredData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('exhibitions')
        .update(filteredData)
        .eq('id', exhibitionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      log.info('Exhibition updated by admin', {
        exhibitionId,
        adminId,
        updatedFields: Object.keys(filteredData)
      });

      res.json({
        success: true,
        data,
        message: 'Exhibition updated successfully'
      });
    } catch (error) {
      log.error('Admin update exhibition error', {
        error: error.message,
        exhibitionId: req.params.exhibitionId,
        adminId: req.userId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to update exhibition'
      });
    }
  },

  // 전시 삭제 (관리자 전용)
  async deleteExhibition(req, res) {
    try {
      const { exhibitionId } = req.params;
      const adminId = req.userId;

      // 관련 데이터 확인
      const { data: exhibition, error: fetchError } = await supabase
        .from('exhibitions')
        .select('title, venue_name')
        .eq('id', exhibitionId)
        .single();

      if (fetchError || !exhibition) {
        return res.status(404).json({
          success: false,
          error: 'Exhibition not found'
        });
      }

      // 연관된 데이터 삭제 (cascade)
      const { error: deleteError } = await supabase
        .from('exhibitions')
        .delete()
        .eq('id', exhibitionId);

      if (deleteError) {
        throw deleteError;
      }

      log.info('Exhibition deleted by admin', {
        exhibitionId,
        adminId,
        title: exhibition.title,
        venue: exhibition.venue_name
      });

      res.json({
        success: true,
        message: 'Exhibition deleted successfully'
      });
    } catch (error) {
      log.error('Admin delete exhibition error', {
        error: error.message,
        exhibitionId: req.params.exhibitionId,
        adminId: req.userId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to delete exhibition'
      });
    }
  },

  // 관리자 대시보드 통계
  async getDashboardStats(req, res) {
    try {
      // 병렬로 모든 통계 쿼리 실행
      const [
        submissions,
        exhibitions,
        recentActivity,
        monthlyStats
      ] = await Promise.all([
        // 제출 통계
        supabase
          .from('exhibition_submissions')
          .select('status')
          .then(({ data }) => {
            const stats = { pending: 0, approved: 0, rejected: 0, total: 0 };
            data?.forEach(item => {
              stats[item.status] = (stats[item.status] || 0) + 1;
              stats.total++;
            });
            return stats;
          }),

        // 전시 통계
        supabase
          .from('exhibitions')
          .select('status')
          .then(({ data }) => {
            const stats = { draft: 0, upcoming: 0, ongoing: 0, ended: 0, total: 0 };
            data?.forEach(item => {
              stats[item.status] = (stats[item.status] || 0) + 1;
              stats.total++;
            });
            return stats;
          }),

        // 최근 활동 (최근 10개)
        supabase
          .from('exhibition_submissions')
          .select(`
            id,
            status,
            created_at,
            submitter_name,
            exhibitions!inner(title, venue_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10),

        // 월별 통계 (최근 12개월)
        supabase
          .from('exhibitions')
          .select('created_at, status')
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
      ]);

      // 월별 통계 처리
      const monthlyData = {};
      monthlyStats.data?.forEach(item => {
        const month = item.created_at.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, approved: 0, rejected: 0 };
        }
        monthlyData[month].total++;
        if (item.status === 'approved') monthlyData[month].approved++;
        if (item.status === 'rejected') monthlyData[month].rejected++;
      });

      res.json({
        success: true,
        data: {
          submissions,
          exhibitions,
          recentActivity: recentActivity.data || [],
          monthlyStats: monthlyData,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      log.error('Admin dashboard stats error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // 사용자 신고 처리
  async getReports(req, res) {
    try {
      const { page = 1, limit = 20, status = 'pending' } = req.query;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('exhibition_reports')
        .select(`
          *,
          exhibitions!inner(
            id,
            title,
            venue_name,
            venue_city
          )
        `, { count: 'exact' })
        .eq('status', status)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      log.error('Admin get reports error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reports'
      });
    }
  },

  // 신고 처리 (해결/무시)
  async handleReport(req, res) {
    try {
      const { reportId } = req.params;
      const { action, notes } = req.body; // action: 'resolved' | 'dismissed'
      const adminId = req.userId;

      if (!['resolved', 'dismissed'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "resolved" or "dismissed"'
        });
      }

      const { error } = await supabase
        .from('exhibition_reports')
        .update({
          status: action,
          handled_by: adminId,
          handled_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', reportId);

      if (error) {
        throw error;
      }

      log.info('Report handled by admin', {
        reportId,
        action,
        adminId
      });

      res.json({
        success: true,
        message: `Report ${action} successfully`
      });
    } catch (error) {
      log.error('Admin handle report error', {
        error: error.message,
        reportId: req.params.reportId,
        adminId: req.userId
      });
      res.status(500).json({
        success: false,
        error: 'Failed to handle report'
      });
    }
  }
};

module.exports = adminExhibitionController;
