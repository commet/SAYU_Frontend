'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Mail, Bell, Settings, Users, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getEmailPreferences, 
  updateEmailPreferences, 
  EmailPreferences,
  sendVerificationEmail 
} from '@/lib/email-api';
import { useToast } from '@/hooks/use-toast';

export default function EmailSettings() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getEmailPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load email preferences:', error);
      setError('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof EmailPreferences, value: any) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updatedPreferences = await updateEmailPreferences({
        [key]: value
      });
      setPreferences(updatedPreferences);
      
      toast({
        title: 'Settings updated',
        description: 'Your email preferences have been saved.',
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update email preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      await sendVerificationEmail();
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox and spam folder.',
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-48 animate-pulse" />
                </div>
                <div className="h-6 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadPreferences} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Verification Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Email Verification</Label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Email address verified</span>
            </div>
            <Badge variant="secondary">Verified</Badge>
          </div>
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <Label className="text-sm font-medium">Notification Types</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekly-insights" className="text-sm">Weekly Insights</Label>
                <p className="text-xs text-muted-foreground">
                  Personalized weekly reports about your art journey and discoveries
                </p>
              </div>
              <Switch
                id="weekly-insights"
                checked={preferences.weekly_insights}
                onCheckedChange={(value) => updatePreference('weekly_insights', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="achievement-notifications" className="text-sm">Achievement Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Celebrate your milestones and unlock notifications
                </p>
              </div>
              <Switch
                id="achievement-notifications"
                checked={preferences.achievement_notifications}
                onCheckedChange={(value) => updatePreference('achievement_notifications', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="curators-pick" className="text-sm">Curator's Monthly Pick</Label>
                <p className="text-xs text-muted-foreground">
                  Personalized artwork recommendations from our AI curator
                </p>
              </div>
              <Switch
                id="curators-pick"
                checked={preferences.curators_pick}
                onCheckedChange={(value) => updatePreference('curators_pick', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="re-engagement" className="text-sm">Re-engagement Emails</Label>
                <p className="text-xs text-muted-foreground">
                  Gentle reminders to continue your aesthetic journey
                </p>
              </div>
              <Switch
                id="re-engagement"
                checked={preferences.re_engagement}
                onCheckedChange={(value) => updatePreference('re_engagement', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="profile-reminders" className="text-sm">Profile Completion Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders to complete your aesthetic personality assessment
                </p>
              </div>
              <Switch
                id="profile-reminders"
                checked={preferences.profile_reminders}
                onCheckedChange={(value) => updatePreference('profile_reminders', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-sm">Marketing & Updates</Label>
                <p className="text-xs text-muted-foreground">
                  Product updates, new features, and special announcements
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(value) => updatePreference('marketing', value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Frequency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <Label className="text-sm font-medium">Email Frequency</Label>
          </div>
          
          <RadioGroup
            value={preferences.frequency_preference}
            onValueChange={(value) => updatePreference('frequency_preference', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal" className="text-sm">
                Minimal - Only essential emails
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="text-sm">
                Normal - Regular updates and insights
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="frequent" id="frequent" />
              <Label htmlFor="frequent" className="text-sm">
                Frequent - All updates and recommendations
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Status indicator */}
        {saving && (
          <Alert>
            <Settings className="h-4 w-4 animate-spin" />
            <AlertDescription>Saving your preferences...</AlertDescription>
          </Alert>
        )}

        {/* Unsubscribe info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            You can unsubscribe from all emails at any time by clicking the unsubscribe link in any email, 
            or by turning off all notification types above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}