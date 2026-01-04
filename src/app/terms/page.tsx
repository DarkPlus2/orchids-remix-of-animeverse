"use client";

import { Navigation } from "@/components/Navigation";
import { Shield, FileText, AlertTriangle, Scale, Clock, Mail } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing and using AniStream ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use our Service.`
    },
    {
      id: "description",
      title: "2. Description of Service",
      content: `AniStream provides users with access to a collection of anime content, including but not limited to streaming videos, community features, and related services. The Service is provided "as is" and we reserve the right to modify or discontinue the Service at any time without notice.`
    },
    {
      id: "user-obligations",
      title: "3. User Obligations",
      content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
      
• Use the Service in any way that violates any applicable federal, state, local, or international law or regulation
• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service
• Attempt to gain unauthorized access to any portion of the Service
• Upload, transmit, or distribute any viruses, malware, or other malicious code
• Use any automated system, including "robots," "spiders," or "scrapers" to access the Service
• Impersonate or attempt to impersonate AniStream, an employee, another user, or any other person or entity`
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property Rights",
      content: `The Service and its original content, features, and functionality are owned by AniStream and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. All anime content displayed on the Service is the property of their respective copyright holders.`
    },
    {
      id: "user-content",
      title: "5. User-Generated Content",
      content: `Our Service may allow you to post, submit, or share content including comments, reviews, and community posts. You retain all rights to your User Content, but by posting, you grant AniStream a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
      
You represent and warrant that:
• You own or have the necessary rights to your User Content
• Your User Content does not violate any third-party rights
• Your User Content complies with these Terms of Service`
    },
    {
      id: "prohibited-content",
      title: "6. Prohibited Content",
      content: `You may not post User Content that:
      
• Is unlawful, defamatory, obscene, pornographic, or offensive
• Infringes any intellectual property or other proprietary rights
• Contains software viruses or any malicious code
• Promotes discrimination, bigotry, racism, hatred, or harassment
• Violates the privacy or publicity rights of any third party
• Contains false or misleading information`
    },
    {
      id: "account-termination",
      title: "7. Account Termination",
      content: `We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms. Upon termination, your right to use the Service will cease immediately.`
    },
    {
      id: "disclaimers",
      title: "8. Disclaimers and Limitations",
      content: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. ANISTREAM MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, REGARDING THE SERVICE'S OPERATION OR THE INFORMATION, CONTENT, OR MATERIALS INCLUDED.
      
TO THE FULLEST EXTENT PERMITTED BY LAW, ANISTREAM DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`
    },
    {
      id: "limitation-liability",
      title: "9. Limitation of Liability",
      content: `IN NO EVENT SHALL ANISTREAM, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF THE SERVICE.`
    },
    {
      id: "indemnification",
      title: "10. Indemnification",
      content: `You agree to defend, indemnify, and hold harmless AniStream and its licensors from any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising from your violation of these Terms or your use of the Service.`
    },
    {
      id: "third-party-links",
      title: "11. Third-Party Links and Content",
      content: `The Service may contain links to third-party websites or services that are not owned or controlled by AniStream. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.`
    },
    {
      id: "dmca",
      title: "12. Copyright and DMCA Policy",
      content: `AniStream respects the intellectual property rights of others. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please provide our designated agent with the following information:
      
• A physical or electronic signature of the copyright owner
• Identification of the copyrighted work claimed to have been infringed
• Identification of the material that is claimed to be infringing
• Your contact information
• A statement that you have a good faith belief that use of the material is not authorized
• A statement that the information in the notification is accurate`
    },
    {
      id: "changes",
      title: "13. Changes to Terms",
      content: `We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.`
    },
    {
      id: "governing-law",
      title: "14. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AniStream operates, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in that jurisdiction.`
    },
    {
      id: "severability",
      title: "15. Severability",
      content: `If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.`
    },
    {
      id: "contact",
      title: "16. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at:
      
Email: legal@anistream.com
Address: AniStream Legal Department`
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
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Legal Document</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Terms of Service
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Please read these terms carefully before using AniStream
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last Updated: November 27, 2025</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-strong rounded-2xl p-6 mb-8 border border-border/50">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quick Navigation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {sections.slice(0, 9).map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-3xl p-8 md:p-12 border border-border/50">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    {section.title.replace(/^\d+\.\s/, "")}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </section>
              ))}
            </div>

            {/* Important Notice */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    By using AniStream, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, you must discontinue use of the service immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Pages */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Link href="/privacy" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">Learn how we collect, use, and protect your personal information</p>
            </Link>
            
            <Link href="/disclaimer" className="group glass-strong rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all">
              <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Disclaimer</h3>
              <p className="text-sm text-muted-foreground">Important information about content and service limitations</p>
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-2xl border border-border/50">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Questions? Contact us at</span>
              <a href="mailto:legal@anistream.com" className="text-sm font-semibold text-primary hover:underline">
                legal@anistream.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
