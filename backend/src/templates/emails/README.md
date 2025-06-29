# Email Templates

This directory contains HTML email templates for the SAYU application.

## Structure

```
templates/emails/
├── base.html              # Base template layout
├── auth/                  # Authentication-related emails
├── notifications/         # User notification emails
├── reports/              # Report-related emails
└── README.md             # This file
```

## Base Template

The `base.html` file contains the foundational layout that all other email templates can extend. It includes:

- Responsive design optimized for mobile and desktop
- SAYU branding and styling
- Standard header and footer structure
- Template variables for customization

## Template Variables

The base template supports the following variables:

- `{{title}}` - Email document title
- `{{headerTitle}}` - Main header text
- `{{headerSubtitle}}` - Subtitle text
- `{{content}}` - Main email content
- `{{userEmail}}` - Recipient email address
- `{{unsubscribeUrl}}` - Unsubscribe link

## Usage

To use the base template, insert your specific email content into the `{{content}}` variable placeholder. Each email type should have its own template file that references the base layout.

## Email Categories

### Authentication (`auth/`)
- Welcome emails
- Password reset emails
- Email verification emails
- Account activation emails

### Notifications (`notifications/`)
- Achievement notifications
- Daily recommendations
- Weekly insights
- Quiz completion notifications

### Reports (`reports/`)
- Generated report emails
- Analytics summaries
- Export notifications