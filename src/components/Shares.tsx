import {useEffect, useState} from 'react';
import {type PresentationDoc} from '../../functions/src/presentation';
import RoundButton from './toolbar/RoundButton';

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

  const tweetText =
    presentation === undefined
      ? ''
      : `${
          presentation.title.length > 0 ? presentation.title : 'presentation'
        }${
          presentation.username.length > 0 ? ' by ' + presentation.username : ''
        }${
          // TODO: make the twitter handle required in the rules and set it to an empty string on upload
          // Then remove the ?? '' below
          (presentation.twitterHandle ?? '').length > 0
            ? ' ' + presentation.twitterHandle!
            : ''
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
      <RoundButton
        newTab
        to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetText,
        )}`}
        icon="i-tabler-brand-twitter w-[2rem] h-[2rem]"
        label="tweet"
        title="Tweet this slide"
      />
      <RoundButton
        newTab
        to={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl,
        )}`}
        icon="i-tabler-brand-linkedin w-[2rem] h-[2rem]"
        label="post"
        title="Post slide to LinkedIn"
      />
      <RoundButton
        to={shareUrl}
        icon="i-tabler-link w-[2rem] h-[2rem]"
        label={copied ? 'copied!' : 'copy'}
        title="Copy link to slide"
        onClick={(event) => {
          event.preventDefault();
          void window.navigator.clipboard.writeText(shareUrl);
          setCopied(true);
        }}
      />
    </div>
  );
}
