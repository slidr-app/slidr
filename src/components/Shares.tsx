import {useEffect, useState} from 'react';
import {type PresentationDoc} from '../../functions/src/presentation';

export default function Shares({
  presentation,
  slideIndex,
}: {
  presentation?: PresentationDoc;
  slideIndex: number;
}) {
  // TODO: should this parse window.location for the host?
  const shareUrl = `https://slidr.app/v/${presentation?.id ?? ''}?slide=${
    slideIndex + 1
  }`;

  const tweetText = `${presentation?.title ?? 'preentation'}${
    presentation?.username === undefined ? '' : ' by ' + presentation.username
  } ${shareUrl}`;

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) {
      return;
    }

    let handle: NodeJS.Timeout | undefined;
    handle = setTimeout(() => {
      handle = undefined;
      setCopied(false);
    }, 2000);

    return () => {
      if (handle !== undefined) {
        clearTimeout(handle);
      }
    };
  }, [copied]);

  return (
    <div className="flex flex-row justify-center gap-4 relative flex-wrap">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetText,
        )}`}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center"
      >
        <button
          type="button"
          className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
          title="Tweet this slide"
        >
          <div className="i-tabler-brand-twitter w-[2rem] h-[2rem]" />
        </button>
        <div className="text-sm">tweet</div>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl,
        )}`}
        target="_blank"
        className="flex flex-col items-center"
        rel="noreferrer"
      >
        <button
          type="button"
          className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
          title="Post slide to LinkedIn"
        >
          <div className="i-tabler-brand-linkedin w-[2rem] h-[2rem]" />
        </button>
        <div className="text-sm">share</div>
      </a>
      <a
        href={shareUrl}
        className="flex flex-col items-center"
        onClick={(event) => {
          event.preventDefault();
          void window.navigator.clipboard.writeText(shareUrl);
          setCopied(true);
        }}
      >
        <button
          type="button"
          className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
          title="Copy link to slide"
        >
          <div className="i-tabler-link w-[2rem] h-[2rem]" />
        </button>
        <div className="text-sm">{copied ? 'copied!' : 'copy'}</div>
      </a>
    </div>
  );
}
