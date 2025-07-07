export function ProComparison() {
  return (
    <div className="self-stretch w-full flex flex-col gap-4 items-center">
      <span className="text-lg font-semibold">Compare Free and Pro</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-center text-teal">Free</span>
          <div>✅ Upload PDFs and add speaker notes</div>
          <div>✅ Live presentation mode with QR code sync</div>
          <div>✅ Real-time emoji reactions</div>
          <div>🚫 No watermark-free presentations</div>
          <div>🚫 No server-side rendering</div>
          <div>🚫 Limited file size (coming soon)</div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-center text-teal">Pro</span>
          <div>✅ Everything in Free</div>
          <div>✅ Watermark-free presentations</div>
          <div>✅ Server-side rendering for higher quality</div>
          <div>✅ Increased file size and upload limits</div>
          <div>✅ Priority performance</div>
          <div>
            ✅ Support an{' '}
            <a
              className="underline hover:text-teal"
              href="https://github.com/slidr-app/slidr"
            >
              Open Source project
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
