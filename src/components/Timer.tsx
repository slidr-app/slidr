import {useEffect, useState} from 'react';
import Button from './toolbar/Button';

export default function Timer() {
  const [startTime, setStartTime] = useState<number>(Date.now());

  const [elapsedTime, setElapsedTime] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
  }>({seconds: 0, minutes: 0, hours: 0});

  function reset() {
    setStartTime(Date.now());
    setElapsedTime({seconds: 0, minutes: 0, hours: 0});
  }

  useEffect(() => {
    function updateElapsedTime() {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor((elapsed / 1000) % 60);
      const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
      const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);

      setElapsedTime({seconds, minutes, hours});
    }

    const intervalHandle = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => {
      clearInterval(intervalHandle);
    };
  }, [startTime]);

  return (
    <div className="font-mono flex flex-row items-center gap-4">
      <div>
        {String(elapsedTime.hours).padStart(2, '0')}:
        {String(elapsedTime.minutes).padStart(2, '0')}:
        {String(elapsedTime.seconds).padStart(2, '0')}
      </div>
      <div className="">
        <Button
          isBorderEnabled
          title="Reset timer"
          icon="i-tabler-rotate"
          label="reset"
          className="important-flex-row important-p1 important-shadow-md gap-1"
          onClick={() => {
            reset();
          }}
        />
      </div>
    </div>
  );
}
