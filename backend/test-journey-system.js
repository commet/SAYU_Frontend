require('dotenv').config();
const { Client } = require('pg');

async function testJourneySystem() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway') 
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get a test user
    const userResult = await client.query('SELECT id, pioneer_number, email FROM users ORDER BY created_at DESC LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('❌ No users found');
      return;
    }

    const testUser = userResult.rows[0];
    console.log(`🧪 Testing with Pioneer #${testUser.pioneer_number} (${testUser.email})`);

    // Initialize journey for test user
    console.log('\n1️⃣ Initializing 7-day journey...');
    
    // Clear existing journey for clean test
    await client.query('DELETE FROM journey_nudges WHERE user_id = $1', [testUser.id]);
    
    // Initialize journey manually (simulating the service)
    const insertQuery = `
      INSERT INTO journey_nudges (user_id, day_number, nudge_type, title, message, cta_text, cta_link)
      SELECT 
        $1,
        jt.day_number,
        jt.nudge_type,
        jt.title_ko,
        jt.message_ko,
        jt.cta_text_ko,
        jt.cta_link
      FROM journey_templates jt
      WHERE jt.is_active = true
      ORDER BY jt.day_number
    `;
    
    await client.query(insertQuery, [testUser.id]);
    console.log('✅ Journey initialized for user');

    // Mark first nudge as sent (Day 1 welcome)
    await client.query(`
      UPDATE journey_nudges 
      SET sent_at = NOW()
      WHERE user_id = $1 AND day_number = 1
    `, [testUser.id]);
    console.log('✅ Day 1 welcome nudge sent');

    // Check today's nudge
    console.log('\n2️⃣ Checking today\'s nudge...');
    const todayNudge = await client.query(`
      SELECT 
        day_number,
        nudge_type,
        title,
        message,
        cta_text,
        cta_link,
        sent_at,
        viewed_at
      FROM journey_nudges 
      WHERE user_id = $1 
        AND sent_at IS NOT NULL 
        AND viewed_at IS NULL
        AND sent_at <= NOW()
      ORDER BY day_number
      LIMIT 1
    `, [testUser.id]);

    if (todayNudge.rows.length > 0) {
      const nudge = todayNudge.rows[0];
      console.log('📬 Today\'s nudge:', {
        day: nudge.day_number,
        type: nudge.nudge_type,
        title: nudge.title,
        message: nudge.message.substring(0, 50) + '...',
        cta: nudge.cta_text
      });
    } else {
      console.log('📭 No pending nudges');
    }

    // Simulate viewing the nudge (mark as viewed)
    console.log('\n3️⃣ Simulating nudge interaction...');
    const viewResult = await client.query(`
      UPDATE journey_nudges 
      SET viewed_at = NOW()
      WHERE user_id = $1 AND day_number = 1
      RETURNING day_number, viewed_at
    `, [testUser.id]);
    
    if (viewResult.rows.length > 0) {
      console.log('✅ Day 1 nudge marked as viewed:', viewResult.rows[0].viewed_at);
    }

    // Schedule next day nudge
    const nextDay = await client.query(`
      UPDATE journey_nudges 
      SET sent_at = NOW() + INTERVAL '1 day'
      WHERE user_id = $1 AND day_number = 2
      RETURNING day_number, sent_at
    `, [testUser.id]);
    
    if (nextDay.rows.length > 0) {
      console.log('✅ Day 2 nudge scheduled for:', nextDay.rows[0].sent_at);
    }

    // Get full journey status
    console.log('\n4️⃣ Full journey status:');
    const journeyStatus = await client.query(`
      SELECT 
        day_number,
        nudge_type,
        title,
        CASE 
          WHEN viewed_at IS NOT NULL THEN 'completed'
          WHEN sent_at IS NOT NULL AND sent_at <= NOW() THEN 'ready'
          WHEN sent_at IS NOT NULL THEN 'scheduled'
          ELSE 'pending'
        END as status,
        sent_at,
        viewed_at
      FROM journey_nudges 
      WHERE user_id = $1 
      ORDER BY day_number
    `, [testUser.id]);

    journeyStatus.rows.forEach(day => {
      const statusEmoji = {
        'completed': '✅',
        'ready': '📬',
        'scheduled': '⏰',
        'pending': '⚪'
      };
      console.log(`   Day ${day.day_number}: ${statusEmoji[day.status]} ${day.status} - ${day.title}`);
    });

    // Journey completion stats
    console.log('\n5️⃣ Journey statistics:');
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE sent_at IS NOT NULL) as days_sent,
        COUNT(*) FILTER (WHERE viewed_at IS NOT NULL) as days_viewed,
        COUNT(*) FILTER (WHERE viewed_at IS NOT NULL)::float / 7 * 100 as completion_percentage
      FROM journey_nudges 
      WHERE user_id = $1
    `, [testUser.id]);

    const stat = stats.rows[0];
    console.log(`   📊 Progress: ${stat.days_viewed}/${stat.total_days} days completed (${parseFloat(stat.completion_percentage).toFixed(1)}%)`);
    console.log(`   📬 Sent: ${stat.days_sent} nudges`);

    console.log('\n🎉 Journey system test completed successfully!');

  } catch (error) {
    console.error('❌ Journey system test failed:', error);
  } finally {
    await client.end();
  }
}

testJourneySystem();