import {type PropsWithChildren} from 'react';

export default function Message({children}: PropsWithChildren) {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      {children}
    </div>
  );
}
