import DefaultLayout from '../layouts/DefaultLayout.tsx';

export default function Privacy() {
  return (
    <DefaultLayout title="Privacy Policy">
      <div className="prose max-w-screen-md mx-auto px-4 py-6">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Effective date:</strong> June 9, 2025
        </p>

        <p>
          This Privacy Policy explains how Slidr collects, uses, and protects
          your information. By using the site, you consent to this policy.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li>Email address (for login and communication)</li>
          <li>Uploaded files (PDFs for presentation purposes)</li>
          <li>Anonymous usage data (to improve the app)</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Enable login and personalization features</li>
          <li>Host and render your presentations</li>
          <li>Analyze feature usage and improve performance</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>We use third-party services to help provide and improve Slidr:</p>
        <ul>
          <li>Firebase (authentication, storage, and hosting)</li>
          <li>Lemon Squeezy (subscription management)</li>
        </ul>
        <p>
          These services may collect additional data in accordance with their
          own privacy policies.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          Uploaded content is retained for as long as your account is active or
          as needed to provide services.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You may request deletion of your data by contacting us at{' '}
          <a href="mailto:hello@slidr.app">hello@slidr.app</a>.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of
          Slidr indicates acceptance of any changes.
        </p>

        <h2>7. Contact</h2>
        <p>
          If you have questions or concerns, contact us at{' '}
          <a href="mailto:hello@slidr.app">hello@slidr.app</a>.
        </p>
      </div>
    </DefaultLayout>
  );
}
