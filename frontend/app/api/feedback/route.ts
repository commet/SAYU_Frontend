import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug' | 'general';
  rating?: number;
  message: string;
  email?: string;
  context?: {
    page?: string;
    personalityType?: string;
    feature?: string;
  };
  timestamp: string;
  userAgent: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData: FeedbackData = await request.json();
    
    // Validate required fields
    if (!feedbackData.message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (feedbackData.type === 'rating' && (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';

    // Prepare feedback record
    const feedbackRecord = {
      ...feedbackData,
      clientIp,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      status: 'new'
    };

    // Save to Supabase database
    const supabase = await createClient();
    
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        type: feedbackData.type,
        rating: feedbackData.rating,
        message: feedbackData.message.trim(),
        email: feedbackData.email,
        context: feedbackData.context || {},
        user_agent: feedbackData.userAgent,
        url: feedbackData.url,
        client_ip: clientIp,
        status: 'new'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save feedback to database:', insertError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    console.log('New feedback saved to database:', feedback);

    // Optional: Send to external services like Slack, Discord, or email
    if (process.env.FEEDBACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.FEEDBACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: formatFeedbackForWebhook({ ...feedbackRecord, id: feedback.id }),
            channel: '#feedback',
            username: 'SAYU Feedback Bot',
            icon_emoji: ':speech_balloon:'
          })
        });
      } catch (webhookError) {
        console.error('Failed to send webhook:', webhookError);
      }
    }

    // Optional: Send email notification
    if (process.env.FEEDBACK_EMAIL_ENABLED === 'true') {
      try {
        await sendFeedbackEmail({ ...feedbackRecord, id: feedback.id });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: feedback.id 
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

function formatFeedbackForWebhook(feedback: FeedbackData & { id: string; clientIp: string; createdAt: string }) {
  let text = `🎯 **New ${feedback.type.toUpperCase()} Feedback**\n\n`;
  
  if (feedback.rating) {
    text += `⭐ **Rating:** ${feedback.rating}/5\n`;
  }
  
  text += `💬 **Message:** ${feedback.message}\n`;
  
  if (feedback.email) {
    text += `📧 **Email:** ${feedback.email}\n`;
  }
  
  if (feedback.context) {
    text += `📍 **Context:**\n`;
    if (feedback.context.page) text += `  • Page: ${feedback.context.page}\n`;
    if (feedback.context.personalityType) text += `  • Personality: ${feedback.context.personalityType}\n`;
    if (feedback.context.feature) text += `  • Feature: ${feedback.context.feature}\n`;
  }
  
  text += `🌐 **URL:** ${feedback.url}\n`;
  text += `🕐 **Time:** ${feedback.createdAt}\n`;
  text += `🔗 **ID:** ${feedback.id}`;
  
  return text;
}

async function sendFeedbackEmail(feedback: FeedbackData & { id: string; clientIp: string; createdAt: string }) {
  // This would integrate with your email service (SendGrid, Nodemailer, etc.)
  // For now, this is a placeholder
  console.log('Email notification would be sent for feedback:', feedback.id);
  
  // Example with nodemailer (you would need to install and configure it)
  /*
  const transporter = nodemailer.createTransporter({
    // your email configuration
  });
  
  await transporter.sendMail({
    from: 'noreply@sayu.app',
    to: 'feedback@sayu.app',
    subject: `New ${feedback.type} feedback - SAYU`,
    html: generateEmailHTML(feedback)
  });
  */
}

function generateEmailHTML(feedback: FeedbackData & { id: string; clientIp: string; createdAt: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7C3AED;">New ${feedback.type.toUpperCase()} Feedback</h2>
      
      ${feedback.rating ? `<p><strong>Rating:</strong> ${feedback.rating}/5 ⭐</p>` : ''}
      
      <p><strong>Message:</strong></p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
        ${feedback.message.replace(/\n/g, '<br>')}
      </div>
      
      ${feedback.email ? `<p><strong>Email:</strong> ${feedback.email}</p>` : ''}
      
      ${feedback.context ? `
        <p><strong>Context:</strong></p>
        <ul>
          ${feedback.context.page ? `<li>Page: ${feedback.context.page}</li>` : ''}
          ${feedback.context.personalityType ? `<li>Personality Type: ${feedback.context.personalityType}</li>` : ''}
          ${feedback.context.feature ? `<li>Feature: ${feedback.context.feature}</li>` : ''}
        </ul>
      ` : ''}
      
      <hr style="margin: 20px 0;">
      <small style="color: #666;">
        <p>ID: ${feedback.id}</p>
        <p>Time: ${feedback.createdAt}</p>
        <p>URL: ${feedback.url}</p>
        <p>IP: ${feedback.clientIp}</p>
      </small>
    </div>
  `;
}