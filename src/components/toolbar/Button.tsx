import clsx from 'clsx/lite';
import {type MouseEventHandler} from 'react';

export default function Button({
  onClick,
  icon,
  label,
  title,
  disabled,
  border,
  className,
  submit,
}: {
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly disabled?: boolean;
  readonly border?: boolean;
  readonly className?: string;
  readonly submit?: boolean;
}) {
  const optionalProperties: {onClick?: MouseEventHandler<HTMLButtonElement>} =
    {};
  if (onClick !== undefined) {
    optionalProperties.onClick = onClick;
  }

  return (
    <button
      disabled={Boolean(disabled)}
      type={submit ? 'submit' : 'button'}
      title={title}
      className={clsx(
        'flex flex-col justify-center items-center bg-gray-800 bg-opacity-90',
        border ? 'px-4 py2' : 'px-2 py-1',
        border && 'border-primary shadow-primary',
        disabled
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
          disabled ? 'text-gray-300' : 'text-white',
        )}
      >
        {label}
      </div>
    </button>
  );
}
