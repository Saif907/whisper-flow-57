import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching

// Interface for the feature flags
interface FeatureFlags {
    aiStrategyPlanner: boolean;
    emotionTagging: boolean;
    journalSummarization: boolean;
    patternRecognition: boolean;
    socialSharing: boolean;
    advancedCharts: boolean;
    mobileApp: boolean;
    emailDigests: boolean;
}

// Function to simulate fetching/loading initial configuration (MOCK)
const fetchInternalConfig = async (): Promise<FeatureFlags> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // MOCK DATA (to be replaced by actual backend API call)
    return {
        aiStrategyPlanner: true,
        emotionTagging: true,
        journalSummarization: true,
        patternRecognition: false,
        socialSharing: false,
        advancedCharts: true,
        mobileApp: true,
        emailDigests: true,
    };
};


export default function Configuration() {
  const { isFounder, loading: roleLoading } = useFounderCheck();
  const { toast } = useToast();

  // 1. Fetch initial configuration using useQuery
  const { data: initialFeatures, isLoading, isError } = useQuery<FeatureFlags>({
    queryKey: ['internal-config'],
    queryFn: fetchInternalConfig,
    enabled: isFounder && !roleLoading,
    staleTime: 60 * 1000 * 10, // Highly stable data, cache for 10 minutes
  });

  // 2. Use a local state for editing, initialized from the fetched/cached data
  const [features, setFeatures] = useState<FeatureFlags | null>(null);

  // Initialize features state once data is loaded/cached
  // Use a simple useEffect/if check to handle initialization from query data
  if (initialFeatures && !features) {
    setFeatures(initialFeatures);
  }

  const handleToggle = (feature: keyof FeatureFlags) => {
    if (!features) return;
    setFeatures((prev) => ({ ...prev!, [feature]: !prev![feature] }));
  };

  const handleSave = () => {
    // NOTE: In a real app, this would use a useMutation hook to call the backend API
    console.log("Saving configuration:", features);
    toast({
      title: "Configuration Saved",
      description: "Feature flags have been updated successfully (Simulated).",
    });
  };

  // 3. Consolidate Loading and Error States
  if (roleLoading || isLoading || !features) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </InternalLayout>
    );
  }
  
  if (!isFounder || isError) {
      return (
        <InternalLayout>
          <div className="text-center py-12">
             <h2 className="text-xl font-bold text-destructive">Access Denied or Data Error</h2>
             <p className="text-muted-foreground mt-2">Could not load configuration data. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }


  return (
    <InternalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage platform features and settings</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable platform features for all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aiStrategyPlanner">AI Strategy Planner</Label>
                <p className="text-sm text-muted-foreground">
                  Let AI suggest trading strategies based on past performance
                </p>
              </div>
              <Switch
                id="aiStrategyPlanner"
                checked={features.aiStrategyPlanner}
                onCheckedChange={() => handleToggle("aiStrategyPlanner")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emotionTagging">Emotion Tagging</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to tag trades with emotional states for better insights
                </p>
              </div>
              <Switch
                id="emotionTagging"
                checked={features.emotionTagging}
                onCheckedChange={() => handleToggle("emotionTagging")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="journalSummarization">Journal Summarization</Label>
                <p className="text-sm text-muted-foreground">
                  AI-powered daily/weekly trade journal summaries
                </p>
              </div>
              <Switch
                id="journalSummarization"
                checked={features.journalSummarization}
                onCheckedChange={() => handleToggle("journalSummarization")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="patternRecognition">Pattern Recognition (Beta)</Label>
                <p className="text-sm text-muted-foreground">
                  Advanced AI pattern detection in trading behavior
                </p>
              </div>
              <Switch
                id="patternRecognition"
                checked={features.patternRecognition}
                onCheckedChange={() => handleToggle("patternRecognition")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="socialSharing">Social Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to share anonymized insights on social media
                </p>
              </div>
              <Switch
                id="socialSharing"
                checked={features.socialSharing}
                onCheckedChange={() => handleToggle("socialSharing")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advancedCharts">Advanced Charts</Label>
                <p className="text-sm text-muted-foreground">
                  Additional chart types and technical indicators
                </p>
              </div>
              <Switch
                id="advancedCharts"
                checked={features.advancedCharts}
                onCheckedChange={() => handleToggle("advancedCharts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mobileApp">Mobile App Access</Label>
                <p className="text-sm text-muted-foreground">Enable mobile app for iOS and Android</p>
              </div>
              <Switch
                id="mobileApp"
                checked={features.mobileApp}
                onCheckedChange={() => handleToggle("mobileApp")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailDigests">Email Digests</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly performance summaries sent to user emails
                </p>
              </div>
              <Switch
                id="emailDigests"
                checked={features.emailDigests}
                onCheckedChange={() => handleToggle("emailDigests")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current platform configuration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <span className="text-sm font-semibold text-green-500">Operational</span>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
              <span className="text-sm">AI Services</span>
              <span className="text-sm font-semibold text-green-500">Operational</span>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <span className="text-sm font-semibold text-green-500">Operational</span>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <span className="text-sm font-semibold text-green-500">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}