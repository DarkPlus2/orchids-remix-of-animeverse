"use client";

import { Navigation } from "@/components/Navigation";
import { Shield, Lock, Eye, Database, Cookie, Mail, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Shield,
      content: `Welcome to AniStream's Privacy Policy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.`
    },
    {
      id: "data-collection",
      title: "2. Information We Collect",
      icon: Database,
      content: `We may collect, use, store, and transfer different kinds of personal data about you:

• Identity Data: username, display name
• Contact Data: email address
• Technical Data: IP address, browser type, device information, operating system
• Usage Data: information about how you use our website and services
• Profile Data: your preferences, watchlist, viewing history
• Marketing Data: your preferences in receiving marketing from us`
    },
    {
      id: "data-usage",
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use your personal data for the following purposes:

• To provide and maintain our Service
• To personalize your experience and deliver content tailored to your interests
• To improve our Service and develop new features
• To communicate with you about updates, new content, and promotional offers
• To monitor and analyze usage patterns and trends
• To detect, prevent, and address technical issues and security threats
• To comply with legal obligations and enforce our Terms of Service
• To provide customer support and respond to your inquiries`
    },
    {
      id: "data-sharing",
      title: "4. Data Sharing and Disclosure",
      icon: Lock,
      content: `We may share your personal information in the following situations:

• Service Providers: We may share your data with third-party service providers who perform services on our behalf (hosting, analytics, customer support)
• Business Transfers: If we are involved in a merger, acquisition, or asset sale, your personal data may be transferred
• Legal Requirements: We may disclose your data if required by law or in response to valid requests by public authorities
• With Your Consent: We may disclose your personal information for any other purpose with your consent

We do not sell your personal information to third parties.`
    },
    {
      id: "cookies",
      title: "5. Cookies and Tracking Technologies",
      icon: Cookie,
      content: `We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.

Types of cookies we use:
• Essential Cookies: Required for the website to function properly
• Preference Cookies: Remember your settings and preferences
• Analytics Cookies: Help us understand how visitors interact with our website
• Marketing Cookies: Track your activity to deliver targeted advertisements

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.`
    },
    {
      id: "data-security",
      title: "6. Data Security",
      icon: Shield,
      content: `We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:

• Encryption of data in transit and at rest
• Regular security assessments and penetration testing
• Access controls and authentication mechanisms
• Employee training on data protection and security
• Incident response and disaster recovery procedures

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.`
    },
    {
      id: "data-retention",
      title: "7. Data Retention",
      icon: Clock,
      content: `We will retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.

Retention periods:
• Account Data: Retained for the duration of your account plus 30 days after deletion
• Usage Data: Typically retained for 90 days
• Marketing Data: Retained until you unsubscribe or opt-out
• Legal Compliance Data: Retained as required by applicable law`
    },
    {
      id: "your-rights",
      title: "8. Your Privacy Rights",
      icon: Shield,
      content: `Depending on your location, you may have the following rights regarding your personal data:

• Right to Access: Request copies of your personal data
• Right to Rectification: Request correction of inaccurate or incomplete data
• Right to Erasure: Request deletion of your personal data
• Right to Restrict Processing: Request limitation of processing your personal data
• Right to Data Portability: Request transfer of your data to another service
• Right to Object: Object to processing of your personal data
• Right to Withdraw Consent: Withdraw consent at any time

To exercise these rights, please contact us using the information provided at the end of this policy.`
    },
    {
      id: "third-party",
      title: "9. Third-Party Services",
      icon: Database,
      content: `Our Service may contain links to third-party websites or integrate with third-party services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

Third-party services we may use:
• Analytics providers (e.g., Google Analytics)
• Content delivery networks (CDNs)
• Payment processors
• Social media platforms
• Email service providers

We strongly advise you to review the Privacy Policy of every site you visit and service you use.`
    },
    {
      id: "children",
      title: "10. Children's Privacy",
      icon: Shield,
      content: `Our Service is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.`
    },
    {
      id: "international",
      title: "11. International Data Transfers",
      icon: Database,
      content: `Your information, including personal data, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.

We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your personal data will take place to an organization or a country unless there are adequate controls in place including the security of your data.`
    },
    {
      id: "changes",
      title: "12. Changes to This Privacy Policy",
      icon: AlertCircle,
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy on this page
• Updating the "Last Updated" date at the top of this Privacy Policy
• Sending you an email notification (for material changes)

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.`
    },
    {
      id: "contact",
      title: "13. Contact Us",
      icon: Mail,
      content: `If you have any questions about this Privacy Policy, your privacy rights, or how we handle your personal data, please contact us:

Email: privacy@anistream.com
Data Protection Officer: dpo@anistream.com

We will respond to your inquiry within 30 days of receipt.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your Privacy Matters</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Privacy Policy
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Learn how we collect, use, and protect your personal information
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last Updated: November 27, 2025</span>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-strong rounded-2xl p-6 border border-border/50">
              <Lock className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-2">Data Protection</h3>
              <p className="text-sm text-muted-foreground">
                We use industry-standard encryption to protect your personal information
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 border border-border/50">
              <Eye className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-2">Transparency</h3>
              <p className="text-sm text-muted-foreground">
                We're clear about what data we collect and how we use it
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 border border-border/50">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-2">Your Control</h3>
              <p className="text-sm text-muted-foreground">
                You have the right to access, modify, or delete your personal data
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-3xl p-8 md:p-12 border border-border/50">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
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

            {/* Summary */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Our Commitment to You</h3>
                  <p className="text-sm text-muted-foreground">
                    At AniStream, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    We will never sell your data to third parties, and we only collect information necessary to provide you with the best possible service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Pages */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Link href="/terms" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">Read our terms and conditions for using AniStream</p>
            </Link>
            
            <Link href="/disclaimer" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <AlertCircle className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Disclaimer</h3>
              <p className="text-sm text-muted-foreground">Important information about content and service limitations</p>
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-2xl border border-border/50">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Privacy questions? Contact us at</span>
              <a href="mailto:privacy@anistream.com" className="text-sm font-semibold text-primary hover:underline">
                privacy@anistream.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
