import clsx from 'clsx/lite';

export default function Toggle({
  isChecked,
  onCheckChange,
}: {
  readonly isChecked: boolean;
  readonly onCheckChange: () => void;
}) {
  // Inspired from https://codepen.io/lhermann/pen/EBGZRZ
  return (
    <div className="flex items-center justify-center w-full">
      <label htmlFor="toggleB" className="flex items-center cursor-pointer">
        <div className="mr-3 font-medium">
          local <div className="i-tabler-device-laptop ml-2" />
        </div>

        {/* <!-- toggle --> */}
        <div className="relative">
          {/* <!-- input --> */}
          <input
            checked={isChecked}
            type="checkbox"
            id="toggleB"
            className="sr-only"
            onChange={(event) => {
              console.log(event);
              onCheckChange();
            }}
          />
          {/* <!-- line --> */}
          <div
            className={clsx(
              'block w-14 h-8 rounded-full',
              isChecked ? 'bg-blue-700' : 'bg-green-700',
            )}
          />
          {/* <!-- dot --> */}
          <div
            className={clsx(
              'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition',
              isChecked && 'translate-x-full bg-gray-7',
            )}
          />
        </div>
        {/* <!-- label --> */}
        <div className="ml-3 font-medium">
          <div className="i-tabler-world mr-2" />
          internet
        </div>
      </label>
    </div>
  );
}
