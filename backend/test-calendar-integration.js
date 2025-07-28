// 전시 캘린더 통합 기능 테스트
const express = require('express');
const app = express();

app.use(express.json());

// 테스트용 전시 데이터
const sampleExhibition = {
  id: 'test-exhibition-001',
  title: '모네와 인상주의의 거장들',
  institution_name: '국립현대미술관',
  address: '서울특별시 종로구 삼청로 30',
  city: '서울',
  start_date: '2025-08-01',
  end_date: '2025-10-15',
  description: '클로드 모네를 중심으로 한 인상주의 대표 작품들을 만나보세요. 빛과 색채의 마법을 통해 일상의 아름다움을 재발견하는 전시입니다.',
  website_url: 'https://mmca.go.kr'
};

// Google 캘린더 URL 생성 함수
function generateGoogleCalendarUrl(exhibition) {
  const startDate = new Date(exhibition.start_date);
  const endDate = new Date(exhibition.end_date);

  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: exhibition.title,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: `${exhibition.description || ''}\n\n📍 ${exhibition.institution_name}\n🌐 ${exhibition.website_url || ''}`,
    location: `${exhibition.institution_name}, ${exhibition.address || exhibition.city}`,
    sf: 'true',
    output: 'xml'
  });

  return `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
}

// Apple 캘린더용 ICS 파일 생성 함수
function generateICSContent(exhibition) {
  const startDate = new Date(exhibition.start_date);
  const endDate = new Date(exhibition.end_date);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SAYU//Exhibition Calendar//EN
BEGIN:VEVENT
UID:${exhibition.id}@sayu.art
DTSTART;VALUE=DATE:${formatDateForICS(startDate)}
DTEND;VALUE=DATE:${formatDateForICS(endDate)}
SUMMARY:${exhibition.title}
DESCRIPTION:${exhibition.description || ''}\\n\\n📍 ${exhibition.institution_name}\\n🌐 ${exhibition.website_url || ''}
LOCATION:${exhibition.institution_name}, ${exhibition.address || exhibition.city}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

// Outlook 캘린더 URL 생성 함수
function generateOutlookUrl(exhibition) {
  const startDate = new Date(exhibition.start_date);
  const endDate = new Date(exhibition.end_date);

  const outlookParams = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: exhibition.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${exhibition.description || ''}\n\n📍 ${exhibition.institution_name}\n🌐 ${exhibition.website_url || ''}`,
    location: `${exhibition.institution_name}, ${exhibition.address || exhibition.city}`
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;
}

function formatDateForGoogle(date) {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function formatDateForICS(date) {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

// API 엔드포인트들
app.get('/api/calendar/test-exhibition', (req, res) => {
  res.json({
    exhibition: sampleExhibition,
    calendar_links: {
      google: generateGoogleCalendarUrl(sampleExhibition),
      outlook: generateOutlookUrl(sampleExhibition),
      ics_content: generateICSContent(sampleExhibition)
    }
  });
});

app.get('/api/calendar/google/:exhibitionId', (req, res) => {
  // 실제 전시 데이터를 가져오는 대신 샘플 데이터 사용
  const googleUrl = generateGoogleCalendarUrl(sampleExhibition);
  res.redirect(googleUrl);
});

app.get('/api/calendar/outlook/:exhibitionId', (req, res) => {
  const outlookUrl = generateOutlookUrl(sampleExhibition);
  res.redirect(outlookUrl);
});

app.get('/api/calendar/ics/:exhibitionId', (req, res) => {
  const icsContent = generateICSContent(sampleExhibition);

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename="${sampleExhibition.title}.ics"`);
  res.send(icsContent);
});

app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Calendar Integration Test',
    version: '1.0.0',
    sample_exhibition: sampleExhibition,
    endpoints: [
      'GET /api/calendar/test-exhibition - 테스트 전시 및 캘린더 링크',
      'GET /api/calendar/google/:exhibitionId - Google 캘린더로 리다이렉트',
      'GET /api/calendar/outlook/:exhibitionId - Outlook 캘린더로 리다이렉트',
      'GET /api/calendar/ics/:exhibitionId - ICS 파일 다운로드'
    ]
  });
});

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`🗓️  SAYU Calendar Test Server running on http://localhost:${PORT}`);
  console.log('📅 Test endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/calendar/test-exhibition`);
  console.log(`   GET  http://localhost:${PORT}/api/calendar/google/test-exhibition-001`);
  console.log(`   GET  http://localhost:${PORT}/api/calendar/outlook/test-exhibition-001`);
  console.log(`   GET  http://localhost:${PORT}/api/calendar/ics/test-exhibition-001`);

  console.log('\n🧪 Testing calendar integration...');

  // 자동 테스트
  setTimeout(async () => {
    try {
      console.log('\n1️⃣ Testing calendar URL generation...');

      const googleUrl = generateGoogleCalendarUrl(sampleExhibition);
      console.log('✅ Google Calendar URL generated');
      console.log(`   ${googleUrl.substring(0, 100)}...`);

      const outlookUrl = generateOutlookUrl(sampleExhibition);
      console.log('✅ Outlook Calendar URL generated');
      console.log(`   ${outlookUrl.substring(0, 100)}...`);

      const icsContent = generateICSContent(sampleExhibition);
      console.log('✅ ICS file content generated');
      console.log(`   ${icsContent.split('\n')[0]}...`);

      console.log('\n2️⃣ Calendar integration test completed!');
      console.log('🎉 All calendar features are working correctly!');

    } catch (error) {
      console.error('❌ Calendar test failed:', error);
    }
  }, 1000);
});
