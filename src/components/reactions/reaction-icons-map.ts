// @unocss-include
import {type IconReaction} from './reaction';

const reactionsIconMap = new Map<IconReaction, {icon: string; title: string}>([
  ['love', {icon: 'i-fluent-emoji-flat-red-heart', title: 'React with love'}],
  [
    'smile',
    {
      icon: 'i-fluent-emoji-flat-smiling-face',
      title: 'React with a smile',
    },
  ],
  [
    'applause',
    {
      icon: 'i-fluent-emoji-flat-clapping-hands',
      title: 'React with applause',
    },
  ],
  [
    'explode',
    {
      icon: 'i-fluent-emoji-flat-exploding-head',
      title: 'React with a exploding brain',
    },
  ],
]);

export default reactionsIconMap;
