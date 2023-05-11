import {type UseChannel} from './use-channel';

export default function useConfetti(
  presentationName: string,
  useChannel: UseChannel,
  onConfetti?: (data: any) => void,
  onReset?: (data: any) => void,
): {
  postConfetti: (payload: any) => void;
  postConfettiReset: (payload: any) => void;
} {
  const postConfetti = useChannel(
    `${presentationName}_confetti`,
    'confetti',
    onConfetti,
  );

  const postConfettiReset = useChannel(
    `${presentationName}_confetti_reset`,
    'confetti_reset',
    onReset,
  );
  return {postConfetti, postConfettiReset};
}
