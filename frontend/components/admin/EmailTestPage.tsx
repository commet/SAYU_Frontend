'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { sendTestEmail, EMAIL_TEMPLATES, EmailTemplate } from '@/lib/email-api';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  template: EmailTemplate;
  success: boolean;
  message: string;
  timestamp: Date;
}

export default function EmailTestPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>('');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'Error',
        description: 'Please select an email template.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);
      await sendTestEmail(selectedTemplate, testEmail || undefined);
      
      const result: TestResult = {
        template: selectedTemplate,
        success: true,
        message: 'Test email sent successfully',
        timestamp: new Date(),
      };
      
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: 'Test email sent',
        description: `${selectedTemplate} template sent successfully`,
      });
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      
      const result: TestResult = {
        template: selectedTemplate,
        success: false,
        message: error.response?.data?.error || 'Failed to send test email',
        timestamp: new Date(),
      };
      
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: 'Error',
        description: 'Failed to send test email. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendAllTests = async () => {
    const templates = Object.values(EMAIL_TEMPLATES);
    
    for (const template of templates) {
      try {
        await sendTestEmail(template, testEmail || undefined);
        
        const result: TestResult = {
          template,
          success: true,
          message: 'Test email sent successfully',
          timestamp: new Date(),
        };
        
        setTestResults(prev => [result, ...prev]);
      } catch (error: any) {
        const result: TestResult = {
          template,
          success: false,
          message: error.response?.data?.error || 'Failed to send test email',
          timestamp: new Date(),
        };
        
        setTestResults(prev => [result, ...prev]);
      }
      
      // Small delay between sends
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    toast({
      title: 'Bulk test completed',
      description: 'All email templates have been tested',
    });
  };

  if (process.env.NODE_ENV === 'production') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Email Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Email testing is only available in development mode.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Email Template Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              This tool allows you to test email templates in development. 
              All emails will be sent using Ethereal Email with preview links.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an email template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Test Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your account email
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSendTest}
              disabled={sending || !selectedTemplate}
              className="flex-1"
            >
              {sending ? (
                <>
                  <Mail className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSendAllTests}
              disabled={sending}
            >
              Test All Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.template}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(EMAIL_TEMPLATES).map(([key, value]) => (
              <div key={value} className="p-3 border rounded-lg">
                <div className="font-medium mb-1">
                  {key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {getTemplateDescription(value)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTemplateDescription(template: EmailTemplate): string {
  const descriptions: Record<EmailTemplate, string> = {
    'welcome': 'Welcome email for new users',
    'email-verification': 'Email address verification',
    'password-reset': 'Password reset instructions',
    'weekly-insights': 'Weekly activity and insights',
    'achievement': 'Achievement unlock notifications',
    'nudge': 'Gentle re-engagement for inactive users',
    'comeback': 'Strong re-engagement for long-inactive users',
    'profile-reminder': 'Profile completion reminders',
    'curators-pick': 'Monthly curator artwork recommendation',
  };
  
  return descriptions[template] || 'Email template';
}