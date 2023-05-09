import {type UseChannel} from './use-channel';

export default function useConfetti(
  presentationName: string,
  useChannel: UseChannel,
  onConfetti?: (data: any) => void,
) {
  const postConfetti = useChannel(
    `${presentationName}_confetti`,
    'confetti',
    onConfetti,
  );
  return postConfetti;
}
