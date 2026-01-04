"use client";

import { Navigation } from "@/components/Navigation";
import { AlertTriangle, Shield, Info, ExternalLink, Clock, Mail, FileWarning } from "lucide-react";
import Link from "next/link";

export default function DisclaimerPage() {
  const sections = [
    {
      id: "general",
      title: "1. General Disclaimer",
      icon: AlertTriangle,
      content: `The information contained on AniStream ("Service") is for general information purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Service or the information contained on the Service for any purpose.

Any reliance you place on such information is strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this Service.`
    },
    {
      id: "content",
      title: "2. Content Disclaimer",
      icon: FileWarning,
      content: `All anime content available on AniStream is provided for entertainment and informational purposes only. We do not own or host any of the anime content displayed on our platform. All anime titles, characters, images, and related materials are the property of their respective copyright holders.

Content Accuracy:
• Episode information, air dates, and descriptions are provided as-is and may contain errors
• We strive to provide accurate information but cannot guarantee completeness
• Content availability may change without notice
• Some content may be region-restricted based on licensing agreements

Age Ratings:
• Age ratings and content warnings are provided for informational purposes
• Parents and guardians should supervise minors' use of the Service
• We are not responsible for viewing of age-inappropriate content`
    },
    {
      id: "external-links",
      title: "3. External Links Disclaimer",
      icon: ExternalLink,
      content: `Through this Service, you may be able to link to other websites or resources which are not under the control of AniStream. We have no control over the nature, content, and availability of those sites or resources.

Important Points:
• The inclusion of any links does not necessarily imply a recommendation
• We do not endorse the views expressed within external sites
• We are not responsible for the content or availability of linked websites
• External sites may have their own terms of use and privacy policies
• Users should exercise caution and review terms when visiting external sites

We cannot be held responsible for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any external content, goods, or services available through such websites or resources.`
    },
    {
      id: "streaming",
      title: "4. Video Streaming Disclaimer",
      icon: Info,
      content: `Video Hosting and Streaming:
• AniStream uses third-party video hosting services and embedded players
• We do not host, upload, or store any video content on our servers
• All video streams are provided through external services (e.g., Streamtape, etc.)
• We have no control over the availability or quality of video streams
• Stream quality may vary based on your internet connection and device
• We are not responsible for buffering, loading issues, or streaming interruptions

Quality and Performance:
• Video quality depends on the source and your internet connection
• We recommend a minimum connection speed for optimal viewing
• Some features may not work on all devices or browsers
• Ad-blockers and browser extensions may affect streaming functionality`
    },
    {
      id: "availability",
      title: "5. Service Availability",
      icon: Clock,
      content: `While we strive to provide continuous, uninterrupted service, AniStream makes no guarantees regarding:

Service Uptime:
• The Service may be temporarily unavailable due to maintenance, updates, or technical issues
• We reserve the right to suspend or discontinue the Service at any time
• Scheduled maintenance will be performed with minimal disruption when possible
• Emergency maintenance may occur without advance notice

Content Availability:
• Anime titles may be added or removed without notice
• Episode availability depends on licensing agreements and content providers
• Some content may be geographically restricted
• We are not responsible for the removal of any content from the Service`
    },
    {
      id: "copyright",
      title: "6. Copyright and Fair Use",
      icon: Shield,
      content: `Copyright Notice:
AniStream respects the intellectual property rights of others and expects users to do the same. All anime content displayed on our platform is the property of their respective copyright holders, production studios, and distributors.

Fair Use and Educational Purpose:
• Content may be used for commentary, criticism, news reporting, teaching, or research
• Users should respect applicable copyright laws in their jurisdiction
• We do not encourage or condone copyright infringement

DMCA Compliance:
• We respond promptly to valid copyright infringement notices
• Copyright holders can submit takedown requests through proper channels
• Users who repeatedly infringe copyrights may have their access terminated

We encourage users to support official releases and legitimate streaming services whenever possible.`
    },
    {
      id: "user-content",
      title: "7. User-Generated Content Disclaimer",
      icon: Info,
      content: `Community Features:
Users may post comments, reviews, ratings, and other content on AniStream. Please note:

Responsibility:
• User-generated content represents the views of individual users, not AniStream
• We do not endorse, support, or guarantee the accuracy of user content
• Users are solely responsible for their posted content
• We reserve the right to remove content that violates our policies

Moderation:
• While we moderate community content, we cannot review all submissions
• Offensive, inappropriate, or illegal content should be reported immediately
• We do not guarantee the removal of all objectionable content
• Moderation decisions are made at our sole discretion`
    },
    {
      id: "technical",
      title: "8. Technical Disclaimer",
      icon: Shield,
      content: `Device and Browser Compatibility:
• The Service may not function properly on all devices or browsers
• Older browsers and operating systems may have limited functionality
• We recommend using the latest versions of supported browsers
• Mobile experience may differ from desktop experience

Security:
• We implement reasonable security measures but cannot guarantee absolute security
• Users are responsible for maintaining the security of their accounts
• Report any security vulnerabilities to our security team immediately
• We are not liable for unauthorized access resulting from user negligence

Data Loss:
• We maintain regular backups but cannot guarantee against data loss
• Users should maintain their own backups of important information
• We are not responsible for loss of watchlists, preferences, or user data`
    },
    {
      id: "health",
      title: "9. Health and Safety Warning",
      icon: AlertTriangle,
      content: `Viewing Safety:
Please be aware that some anime content may contain:

• Flashing lights and rapid scene changes that may trigger photosensitive epilepsy
• Intense action sequences and visual effects
• Loud audio that may be startling or disturbing
• Content that may be emotionally distressing

Recommendations:
• Take regular breaks during extended viewing sessions
• Maintain appropriate viewing distance from screens
• Adjust volume to comfortable levels
• Stop viewing if you experience discomfort, dizziness, or eye strain
• Consult a healthcare professional if you have concerns about photosensitivity

Parental Guidance:
• Parents should review content ratings before allowing children to watch
• Some content may contain mature themes not suitable for all ages
• Parental controls and supervision are recommended`
    },
    {
      id: "no-warranty",
      title: "10. No Warranty",
      icon: Shield,
      content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

• Warranties of merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy or completeness of content
• Uninterrupted or error-free service
• Security of data transmission

We do not warrant that:
• The Service will meet your specific requirements
• The Service will be available at all times
• All errors or defects will be corrected
• The Service is free from viruses or harmful components

Use of the Service is at your own discretion and risk.`
    },
    {
      id: "changes",
      title: "11. Changes to This Disclaimer",
      icon: Clock,
      content: `We reserve the right to update or modify this Disclaimer at any time without prior notice. Changes will be effective immediately upon posting to the Service.

Your Responsibility:
• Review this Disclaimer periodically for changes
• Continued use after changes constitutes acceptance
• Material changes may be communicated via email or Service notification

Last Updated: November 27, 2025

It is your responsibility to check this page periodically for updates. Your continued use of the Service following the posting of changes constitutes your acceptance of such changes.`
    },
    {
      id: "contact",
      title: "12. Contact Information",
      icon: Mail,
      content: `If you have any questions or concerns about this Disclaimer, please contact us:

General Inquiries: support@anistream.com
Legal Matters: legal@anistream.com
Copyright Issues: dmca@anistream.com

Mailing Address:
AniStream Legal Department
[Address Line 1]
[Address Line 2]

We will respond to your inquiry within 48-72 hours during business days.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 mb-6">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Important Information</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Disclaimer
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Important information about using AniStream and viewing content
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last Updated: November 27, 2025</span>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex gap-4">
              <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Please Read Carefully</h3>
                <p className="text-sm text-muted-foreground">
                  This disclaimer contains important information about the use of AniStream, content ownership, 
                  streaming services, and limitations of liability. By using our Service, you acknowledge that you 
                  have read, understood, and agree to this Disclaimer.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-3xl p-8 md:p-12 border border-border/50">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-white" />
                    </div>
                    {section.title.replace(/^\d+\.\s/, "")}
                  </h2>
                  <div className="prose prose-invert max-w-none pl-13">
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </section>
              ))}
            </div>

            {/* Final Notice */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Limitation of Liability</h3>
                  <p className="text-sm text-muted-foreground">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANISTREAM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                    SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                    DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Pages */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Link href="/terms" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">Read our terms and conditions for using AniStream</p>
            </Link>
            
            <Link href="/privacy" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">Learn how we protect your personal information</p>
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-2xl border border-border/50">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Questions? Contact us at</span>
              <a href="mailto:support@anistream.com" className="text-sm font-semibold text-primary hover:underline">
                support@anistream.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
