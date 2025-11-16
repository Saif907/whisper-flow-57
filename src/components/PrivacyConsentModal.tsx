import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Database, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // IMPORTED: For robust write operation

interface PrivacyConsentModalProps {
  open: boolean;
  onConsentGiven: () => void;
}

export function PrivacyConsentModal({ open, onConsentGiven }: PrivacyConsentModalProps) {
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define the asynchronous function to save consent outside of the component body (for cleanliness)
  const saveConsent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          consent_given: true,
          consent_date: new Date().toISOString(),
          privacy_version: 1,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // On successful database write, the user profile data might be stale.
      // We explicitly invalidate the 'user' query key so the next auth check is fresh.
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      return true;
  }
  
  // 1. Initialize the mutation hook
  const consentMutation = useMutation({
      mutationFn: saveConsent,
      onSuccess: () => {
          toast({
            title: "Consent recorded",
            description: "Thank you for reviewing our privacy policy.",
          });
          onConsentGiven();
      },
      onError: (error) => {
          console.error("Error saving consent:", error);
          toast({
            title: "Error",
            description: `Failed to save consent: ${error.message}. Please try again.`,
            variant: "destructive",
          });
      }
  });


  const handleConsent = () => {
    if (!agreed || consentMutation.isPending) return;
    
    // 2. Trigger the mutation
    consentMutation.mutate();
  };

  const loading = consentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-primary" />
            Privacy & Data Protection
          </DialogTitle>
          <DialogDescription>
            Your privacy is our priority. Please review how we protect your data.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Anonymization</h3>
                  <p className="text-sm text-muted-foreground">
                    We use **pseudonymous identifiers** (random UUIDs) to store your trading data and chat history. 
                    Your personal information (email, name) is never stored in our trading records and cannot be linked back 
                    without authentication.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">What We Collect</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Trading data: ticker symbols, entry/exit prices, dates (day precision only)</li>
                    <li>Chat messages: your conversations with the AI assistant</li>
                    <li>Session metadata: timestamps rounded to day precision for analytics</li>
                    <li>No IP addresses, device fingerprints, or browser tracking</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Access & Control</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    You have complete control over your data:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>**Right to Access:** Export all your data at any time</li>
                    <li>**Right to Erasure:** Delete your account and all associated data</li>
                    <li>**Data Portability:** Download your data in standard formats</li>
                    <li>**Consent Withdrawal:** Revoke consent and delete all data</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Compliance Standards</h3>
                <p className="text-xs text-muted-foreground">
                  Our system is designed to comply with **GDPR** (General Data Protection Regulation), 
                  ** ISO/IEC 27001** security principles, and the **Indian DPDP Bill** (Digital Personal Data Protection).
                  We implement industry-standard encryption (AES-256) and security best practices.
                </p>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-sm mb-2 text-primary">Your Rights</h3>
                <p className="text-xs text-muted-foreground">
                  By using this service, you understand that your trading data and chat history are stored securely 
                  with pseudonymous identifiers. You can request data export or account deletion at any time through 
                  your account settings. We never sell or share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="consent"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have read and agree to the privacy policy. I understand my data is anonymized and I can 
              request its deletion at any time.
            </label>
          </div>
          <Button
            onClick={handleConsent}
            disabled={!agreed || loading}
            className="w-full"
            size="lg"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Accept & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}