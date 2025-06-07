const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const { logError } = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configure transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production: Use SMTP service (SendGrid, Mailgun, etc.)
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'SendGrid',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development: Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      console.info('Email service initialized successfully');
    } catch (error) {
      logError(error, { context: 'Email service initialization failed' });
    }
  }

  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      logError(error, { context: `Failed to load email template ${templateName}` });
      throw new Error(`Email template ${templateName} not found`);
    }
  }

  // Replace template variables with actual values
  interpolateTemplate(template, variables) {
    let interpolated = template;
    
    // Replace all {{variable}} patterns
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      interpolated = interpolated.replace(regex, variables[key] || '');
    });
    
    return interpolated;
  }

  async sendEmail({ to, subject, templateName, variables = {}, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      // Load and interpolate template
      const template = await this.loadTemplate(templateName);
      const html = this.interpolateTemplate(template, {
        ...variables,
        currentYear: new Date().getFullYear(),
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });

      const mailOptions = {
        from: {
          name: 'SAYU - Your Aesthetic Journey',
          address: process.env.EMAIL_FROM || 'noreply@sayu.art'
        },
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL for development
      if (process.env.NODE_ENV !== 'production') {
        console.info('Email preview URL:', nodemailer.getTestMessageUrl(result));
      }

      console.info(`Email sent successfully to ${to}: ${subject}`);
      return result;
    } catch (error) {
      logError(error, { context: 'Failed to send email' });
      throw error;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: '🎨 Welcome to SAYU - Your Aesthetic Journey Begins!',
      templateName: 'welcome',
      variables: {
        userName: user.nickname || user.email.split('@')[0],
        userEmail: user.email
      }
    });
  }

  // Email verification
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject: '✨ Verify Your SAYU Account',
      templateName: 'email-verification',
      variables: {
        userName: user.nickname || user.email.split('@')[0],
        verificationUrl
      }
    });
  }

  // Weekly insights email
  async sendWeeklyInsights(user, insights) {
    return this.sendEmail({
      to: user.email,
      subject: `🌟 Your Weekly Aesthetic Insights - ${insights.weekRange}`,
      templateName: 'weekly-insights',
      variables: {
        userName: user.nickname,
        typeCode: user.typeCode,
        archetypeName: user.archetypeName,
        weekRange: insights.weekRange,
        artworksViewed: insights.artworksViewed,
        timeSpent: insights.timeSpent,
        newDiscoveries: insights.newDiscoveries,
        topArtwork: insights.topArtwork,
        personalizedRecommendations: insights.recommendations
      }
    });
  }

  // Re-engagement email for inactive users
  async sendReEngagementEmail(user, daysSinceLastVisit) {
    const templateName = daysSinceLastVisit > 30 ? 'comeback' : 'nudge';
    
    return this.sendEmail({
      to: user.email,
      subject: daysSinceLastVisit > 30 
        ? '🎭 We miss you! New art discoveries await'
        : '🎨 Continue your aesthetic journey',
      templateName,
      variables: {
        userName: user.nickname,
        daysSinceLastVisit,
        typeCode: user.typeCode
      }
    });
  }

  // Achievement notification email
  async sendAchievementEmail(user, achievement) {
    return this.sendEmail({
      to: user.email,
      subject: `🏆 Achievement Unlocked: ${achievement.name}!`,
      templateName: 'achievement',
      variables: {
        userName: user.nickname,
        achievementName: achievement.name,
        achievementDescription: achievement.description,
        achievementIcon: achievement.icon,
        totalAchievements: achievement.totalCount
      }
    });
  }

  // Monthly curator's pick email
  async sendCuratorsPick(user, curatorsPick) {
    return this.sendEmail({
      to: user.email,
      subject: `🖼️ This Month's Curator's Pick for ${user.archetypeName}s`,
      templateName: 'curators-pick',
      variables: {
        userName: user.nickname,
        archetypeName: user.archetypeName,
        artworkTitle: curatorsPick.title,
        artistName: curatorsPick.artist,
        artworkImage: curatorsPick.imageUrl,
        curatorMessage: curatorsPick.message,
        whySelected: curatorsPick.reasoning
      }
    });
  }

  // Profile completion reminder
  async sendProfileReminderEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: '🧭 Complete Your Aesthetic Journey - Take the Quiz',
      templateName: 'profile-reminder',
      variables: {
        userName: user.nickname,
        daysRegistered: Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      }
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject: '🔐 Reset Your SAYU Password',
      templateName: 'password-reset',
      variables: {
        userName: user.nickname,
        resetUrl
      }
    });
  }
}

module.exports = new EmailService();