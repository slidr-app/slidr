import DefaultLayout from '../layouts/DefaultLayout.tsx';

export default function Terms() {
  return (
    <DefaultLayout title="Terms of Service">
      <div className="prose max-w-screen-md mx-auto px-4 py-6">
        <h1>Terms of Service</h1>
        <p>
          <strong>Effective date:</strong> June 9, 2025
        </p>

        <p>
          By using Slidr.app, you agree to the following terms. Please read them
          carefully. If you do not agree, please do not use the service.
        </p>

        <h2>1. What is Slidr?</h2>
        <p>
          Slidr is a web-based application that allows you to upload a PDF and
          present it interactively. You can add speaker notes, generate a QR
          code to share with an audience, and enable real-time emoji reactions
          and slide syncing across devices. It’s designed for live or remote
          presentations.
        </p>

        <h2>2. Free vs Pro</h2>
        <p>
          Slidr offers both a free community version and a paid Pro plan. Pro
          users receive additional features including:
        </p>
        <ul>
          <li>Watermark-free exports</li>
          <li>Server-side slide rendering</li>
          <li>Larger file support (coming soon)</li>
          <li>Priority rendering</li>
        </ul>
        <p>
          Pricing and terms of Pro plans are available on the{' '}
          <a href="/">homepage</a> and are subject to change.
        </p>

        <h2>3. User Content</h2>
        <p>When you upload a presentation:</p>
        <ul>
          <li>You retain all rights to your content</li>
          <li>You confirm you have the right to use the material</li>
          <li>
            You grant Slidr permission to temporarily process and display your
            content
          </li>
        </ul>
        <p>We do not share or sell your uploaded materials.</p>

        <h2>4. Payment and Refunds</h2>
        <p>
          Pro plan payments are handled by{' '}
          <a
            href="https://www.lemonsqueezy.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lemon Squeezy
          </a>
          . By purchasing a Pro subscription, you agree to their{' '}
          <a
            href="https://www.lemonsqueezy.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            terms
          </a>{' '}
          and{' '}
          <a
            href="https://www.lemonsqueezy.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy policy
          </a>
          .
        </p>
        <p>
          Subscriptions renew automatically unless cancelled. Cancel any time
          through the customer portal. Refunds are handled on a case-by-case
          basis.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>Please do not:</p>
        <ul>
          <li>Upload unlawful, offensive, or harmful content</li>
          <li>Abuse the real-time features to disrupt others</li>
          <li>Attempt to reverse-engineer or exploit the platform</li>
        </ul>
        <p>Violations may result in removal of content or access.</p>

        <h2>6. Availability and Changes</h2>
        <p>
          We do our best to keep Slidr online and functional, but we don’t
          guarantee 100% uptime. Features may change without notice. These terms
          may be updated, and continued use means you agree to the new terms.
        </p>

        <h2>7. Liability</h2>
        <p>
          Slidr is provided “as is.” We are not liable for any data loss,
          downtime, or damages resulting from use.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have questions, contact us at{' '}
          <a href="mailto:hello@slidr.app">hello@slidr.app</a>.
        </p>
      </div>
    </DefaultLayout>
  );
}
