import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <AppLayout showNavBar={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-comfortaa">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-GB')}
            </p>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
              <p>
                Padel Community respects your privacy and is committed to protecting your personal data.
                This privacy policy explains how we collect, use and protect your data in accordance
                with the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">2. What data do we collect?</h2>
              <p>We collect the following personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account data:</strong> Email address, name, profile picture (optional)</li>
                <li><strong>Location data:</strong> Your location is only used to calculate the distance to events</li>
                <li><strong>Player data:</strong> Padel level, club, playing preferences</li>
                <li><strong>Usage data:</strong> Events you participate in, messages within the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">3. What do we use your data for?</h2>
              <p>Your data is used exclusively for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Distance calculation:</strong> To show how far events are from your location</li>
                <li><strong>Personalised display:</strong> To filter events and players based on your preferences</li>
                <li><strong>Account management:</strong> To manage your account and enable login</li>
                <li><strong>Communication:</strong> To send messages to other players within the platform</li>
              </ul>
              <p className="mt-4 font-medium">
                We NEVER share your data with third parties for commercial purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Legal basis</h2>
              <p>We process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> You give explicit consent when creating your account</li>
                <li><strong>Performance of a contract:</strong> Processing is necessary to provide our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">5. Your rights</h2>
              <p>Under the GDPR you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right of access:</strong> You can request what data we hold about you</li>
                <li><strong>Right to rectification:</strong> You can have your data corrected</li>
                <li><strong>Right to erasure:</strong> You can request deletion of all your data</li>
                <li><strong>Right to data portability:</strong> You can request your data in a readable format</li>
                <li><strong>Right to withdraw consent:</strong> You can withdraw your consent at any time</li>
              </ul>
              <p className="mt-4">
                You can exercise these rights through your profile settings or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies</h2>
              <p>We only use functional cookies that are necessary for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remembering your login session</li>
                <li>Storing your cookie preferences</li>
              </ul>
              <p className="mt-4">
                We do not use tracking cookies or cookies for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Security</h2>
              <p>
                We take appropriate technical and organisational measures to protect your data against
                unauthorised access, loss or misuse. Your data is stored on secure servers
                with encryption.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">8. Retention period</h2>
              <p>
                We retain your data as long as you have an active account. After deleting your account,
                all your personal data will be permanently removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact</h2>
              <p>
                For questions about this privacy policy or to exercise your rights, you can contact us
                through the contact details on our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes</h2>
              <p>
                We may update this privacy policy from time to time. Important changes will be
                communicated through the website or by email.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Privacy;
