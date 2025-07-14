# SAYU Email System Setup Guide

This guide covers the complete setup and configuration of the SAYU email system, including automated campaigns, transactional emails, and email preferences management.

## 📧 System Overview

The SAYU email system provides:
- **Automated Email Campaigns**: Weekly insights, re-engagement, profile reminders, curator's picks
- **Transactional Emails**: Welcome, verification, password reset, achievements
- **User Preferences**: Granular control over email types and frequency
- **Email Analytics**: Open rates, click rates, campaign performance
- **Template System**: Responsive HTML templates with personalization

## 🚀 Quick Setup

### 1. Database Setup

Run the email system migration:

```bash
cd backend
node scripts/setupEmailSystem.js
```

This will create the necessary tables:
- `email_logs` - Email delivery tracking
- `email_preferences` - User email settings
- `email_verification_tokens` - Email verification tokens
- `password_reset_tokens` - Password reset tokens
- `user_artwork_interactions` - User activity tracking
- `agent_conversations` - AI conversation tracking

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Email Service Configuration
EMAIL_SERVICE=SendGrid          # or Mailgun, SES, etc.
EMAIL_USER=your-email-username
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@sayu.art

# Email Automation
ENABLE_EMAIL_AUTOMATION=true    # Enable scheduled email jobs
FRONTEND_URL=http://localhost:3000  # For email links
```

### 3. Email Templates

All email templates are located in `backend/src/templates/emails/`:

- ✅ `welcome.html` - Welcome email for new users
- ✅ `email-verification.html` - Email verification
- ✅ `password-reset.html` - Password reset
- ✅ `weekly-insights.html` - Weekly activity report
- ✅ `achievement.html` - Achievement notifications
- ✅ `profile-reminder.html` - Profile completion reminder
- ✅ `nudge.html` - Light re-engagement (7-30 days inactive)
- ✅ `comeback.html` - Strong re-engagement (30+ days inactive)
- ✅ `curators-pick.html` - Monthly curator recommendation

## 🎯 Email Campaigns

### Automated Schedules

The system runs these automated campaigns:

| Campaign | Schedule | Target Users |
|----------|----------|--------------|
| Weekly Insights | Sundays 9 AM UTC | Active users with 7+ days activity |
| Re-engagement | Daily 10 AM UTC | Users inactive 7-30 days |
| Profile Reminders | Daily 2 PM UTC | Users without completed profiles |
| Curator's Pick | Monthly 1st, 8 AM UTC | All users with profiles |

### Manual Triggers

Admin users can manually trigger campaigns:

```bash
# Via API
POST /api/email/trigger/weekly-insights
POST /api/email/trigger/re-engagement
```

## 🔧 API Endpoints

### User Email Preferences

```bash
# Get preferences
GET /api/email/preferences

# Update preferences
PUT /api/email/preferences
{
  "weekly_insights": true,
  "achievement_notifications": true,
  "re_engagement": false,
  "profile_reminders": true,
  "curators_pick": true,
  "marketing": false,
  "frequency_preference": "normal"
}

# Unsubscribe from all
POST /api/email/unsubscribe
{
  "email": "user@example.com"
}
```

### Email Verification

```bash
# Send verification email
POST /api/email/send-verification

# Verify email address
POST /api/email/verify
{
  "token": "verification-token"
}
```

### Admin Analytics

```bash
# Get email analytics (admin only)
GET /api/email/analytics

# Manual campaign trigger (admin only)
POST /api/email/trigger/weekly-insights
POST /api/email/trigger/re-engagement
```

### Development Testing

```bash
# Send test email (dev only)
POST /api/email/test
{
  "templateName": "welcome",
  "email": "test@example.com"
}
```

## 🎨 Frontend Components

### Email Settings Component

```tsx
import EmailSettings from '@/components/settings/EmailSettings';

// In your settings page
<EmailSettings />
```

### Email Verification Page

```tsx
import EmailVerificationPage from '@/components/email/EmailVerificationPage';

// Route: /verify-email
<EmailVerificationPage />
```

### Admin Email Testing

```tsx
import EmailTestPage from '@/components/admin/EmailTestPage';

// Development only
<EmailTestPage />
```

## 📊 Email Analytics

The system tracks:
- **Delivery metrics**: Send rate, bounce rate, delivery success
- **Engagement metrics**: Open rate, click-through rate, time spent
- **Conversion metrics**: Feature adoption, profile completion
- **Retention metrics**: User lifetime value, churn prevention

Access via `/api/email/analytics` (admin only).

## 🛠️ Email Service Configuration

### Development Mode

Uses **Ethereal Email** for testing:
- No real emails sent
- Preview URLs generated for testing
- All templates can be previewed

### Production Mode

Supports multiple email services:

#### SendGrid
```bash
EMAIL_SERVICE=SendGrid
EMAIL_USER=your-sendgrid-username
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```bash
EMAIL_SERVICE=Mailgun
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-api-key
```

#### Amazon SES
```bash
EMAIL_SERVICE=SES
EMAIL_USER=your-aws-access-key
EMAIL_PASSWORD=your-aws-secret-key
```

## 🔒 Security Features

- **Email Verification**: All users must verify their email
- **Token Expiry**: Verification tokens expire in 24 hours
- **Rate Limiting**: Prevents spam and abuse
- **Unsubscribe Links**: Easy opt-out in all emails
- **GDPR Compliance**: User data control and deletion

## 🎯 Personalization

Emails are personalized based on:
- **User Profile**: Name, aesthetic type, preferences
- **Activity Data**: Artworks viewed, time spent, conversations
- **Behavioral Triggers**: Quiz completion, achievements, inactivity
- **Aesthetic Type**: 128 personality types with custom content

## 📧 Template Variables

All templates support these variables:

```html
{{userName}}          - User's display name
{{userEmail}}         - User's email address  
{{typeCode}}          - Aesthetic type code (e.g., LREF)
{{archetypeName}}     - Aesthetic archetype name
{{appUrl}}            - Frontend application URL
{{currentYear}}       - Current year
{{unsubscribeUrl}}    - Unsubscribe link
```

Campaign-specific variables:
```html
<!-- Weekly Insights -->
{{weekRange}}         - Date range for the week
{{artworksViewed}}    - Number of artworks viewed
{{timeSpent}}         - Time spent in minutes
{{topArtwork}}        - Most viewed artwork

<!-- Achievements -->
{{achievementName}}   - Achievement title
{{achievementIcon}}   - Achievement icon
{{totalAchievements}} - Total achievement count

<!-- Re-engagement -->
{{daysSinceLastVisit}} - Days since last login
```

## 🚀 Deployment

### Railway (Production)

1. Set environment variables in Railway dashboard
2. Deploy backend with email automation enabled
3. Configure domain authentication (SPF, DKIM, DMARC)
4. Monitor email delivery and analytics

### Email Authentication

Set up proper DNS records:

```bash
# SPF Record
TXT @ "v=spf1 include:sendgrid.net ~all"

# DKIM Record  
TXT s1._domainkey "k=rsa; p=YOUR_DKIM_PUBLIC_KEY"

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@sayu.art"
```

## 🧪 Testing

### Template Testing

Use the admin testing interface:

1. Navigate to `/admin/email-test` (dev only)
2. Select template and test email
3. Send individual or bulk tests
4. Review Ethereal preview links

### Campaign Testing

```bash
# Test individual campaigns
curl -X POST http://localhost:3001/api/email/trigger/weekly-insights \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Email Flow Testing

1. **Registration**: Should send welcome email
2. **Email Verification**: Should send verification email
3. **Password Reset**: Should send reset email
4. **Profile Completion**: Should trigger reminders
5. **Achievements**: Should send notifications
6. **Inactivity**: Should trigger re-engagement

## 📋 Monitoring

### Health Checks

- Email service connection status
- Template file availability
- Database table integrity
- Scheduled job status

### Metrics to Monitor

- Email delivery rates
- Open and click rates
- Unsubscribe rates
- User engagement correlation
- Campaign performance

### Error Handling

- Failed email sends are logged
- Retry logic for transient failures
- User notification for persistent failures
- Admin alerts for system issues

## 🔧 Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check email service credentials
   - Verify EMAIL_SERVICE setting
   - Check rate limits

2. **Templates not loading**
   - Ensure all template files exist
   - Check file permissions
   - Verify template syntax

3. **Database errors**
   - Run migration script
   - Check connection string
   - Verify table existence

4. **Automation not working**
   - Check ENABLE_EMAIL_AUTOMATION setting
   - Verify cron job initialization
   - Check server timezone

### Debug Mode

Enable debug logging:

```bash
DEBUG=sayu:email node src/server.js
```

## 🎉 Success Metrics

A successful email system should achieve:
- **Delivery Rate**: >95%
- **Open Rate**: >20%
- **Click Rate**: >3%
- **Unsubscribe Rate**: <2%
- **User Engagement**: Increased session frequency

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Node-cron Documentation](https://www.npmjs.com/package/node-cron)
- [Email Marketing Best Practices](https://mailchimp.com/resources/email-marketing-best-practices/)
- [GDPR Email Compliance](https://gdpr.eu/email-compliance/)

---

**Need help?** Contact the development team or check the project's GitHub issues for common problems and solutions.