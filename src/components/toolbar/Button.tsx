import clsx from 'clsx/lite';
import {type MouseEventHandler} from 'react';

export default function Button({
  onClick,
  icon,
  label,
  title,
  isDisabled,
  isBorderEnabled,
  className,
  isSubmit,
}: {
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly isDisabled?: boolean;
  readonly isBorderEnabled?: boolean;
  readonly className?: string;
  readonly isSubmit?: boolean;
}) {
  const optionalProperties: {onClick?: MouseEventHandler<HTMLButtonElement>} =
    {};
  if (onClick !== undefined) {
    optionalProperties.onClick = onClick;
  }

  return (
    <button
      disabled={Boolean(isDisabled)}
      type={isSubmit ? 'submit' : 'button'}
      title={title}
      className={clsx(
        'flex flex-col justify-center items-center bg-gray-800 bg-opacity-90',
        isBorderEnabled ? 'px-4 py2' : 'px-2 py-1',
        isBorderEnabled && 'border-primary shadow-primary',
        isDisabled
          ? 'text-gray-300'
          : 'text-teal hover:(bg-gray-700) active:(text-white bg-black)',
        className,
      )}
      {...optionalProperties}
    >
      <div className={clsx(icon)} />
      <div
        className={clsx(
          'text-xs lt-sm:text-xs',
          isDisabled ? 'text-gray-300' : 'text-white',
        )}
      >
        {label}
      </div>
    </button>
  );
}
