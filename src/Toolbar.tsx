export default function Toolbar({
  onPrevious,
  onNext,
  onStart,
  onEnd,
}: {
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 p-8 pb-3 pl-3 opacity-0 hover:opacity-100 transition-opacity duration-400 ease-out">
      <div className="flex flex-row bg-gray-800 rounded-md px-3 py-2 gap-3 shadow-teal-800 shadow-xl">
        <button
          className="i-tabler-arrow-big-left-filled text-teal font-size-[4rem]"
          type="button"
          onClick={onPrevious}
        />
        <button
          className="i-tabler-arrow-big-right-filled text-teal font-size-[4rem]"
          type="button"
          onClick={onNext}
        />
        <button
          className="i-tabler-arrow-bar-to-left text-teal font-size-[4rem]"
          type="button"
          onClick={onStart}
        />
        <button
          className="i-tabler-arrow-bar-to-right text-teal font-size-[4rem]"
          type="button"
          onClick={onEnd}
        />
        <button
          className="i-tabler-tools-off text-teal font-size-[4rem]"
          type="button"
        />
        <button
          className="i-tabler-arrows-diagonal text-teal font-size-[4rem]"
          type="button"
          onClick={() => {
            console.log('go fullscreen');
          }}
        />
      </div>
    </div>
  );
}
