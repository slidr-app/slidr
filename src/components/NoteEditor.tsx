import clsx from 'clsx/lite';
import {useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {useDebouncedCallback} from 'use-debounce';

export default function NoteEditor({
  pageIndices,
  markdown,
  onMarkdownChange,
  onMarkdownDirty,
  handleFoldUp,
  handleFoldDown,
  pages,
}: {
  readonly pageIndices: number[];
  readonly markdown: string;
  readonly onMarkdownChange: (markdown: string) => void;
  readonly onMarkdownDirty: () => void;
  readonly handleFoldUp: () => void;
  readonly handleFoldDown: () => void;
  readonly pages: string[];
}) {
  const [userMarkdown, setUserMarkdown] = useState(markdown);
  const debouncedMarkdownChange = useDebouncedCallback(
    (nextMarkdown: string) => {
      onMarkdownChange(nextMarkdown);
    },
    500,
  );

  return (
    <>
      <div className="relative not-first:mt-8">
        <div className="grid grid-cols-4 lt-sm:grid-cols-2">
          {pageIndices.map((pageIndex, indicesIndex) => (
            <img
              key={pages[pageIndex]}
              className={clsx(
                'aspect-video w-full',
                indicesIndex === 0 && 'grid-col-span-2 grid-row-span-2',
              )}
              src={pages[pageIndex]}
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 bg-black bg-opacity-80 p-1 rounded-br-lg pr-2">
          {pageIndices[0] > 0 && pageIndices.length === 1 && (
            <button
              className="inline-block text-xl mr-2"
              type="button"
              title="Copy previous"
              onClick={() => {
                handleFoldUp();
              }}
            >
              <div className="inline-block i-tabler-arrow-autofit-up bg-amber" />
            </button>
          )}
          {pageIndices.length > 1 && (
            <button
              className="inline-block text-xl mr-2"
              type="button"
              title="Un-copy"
              onClick={() => {
                handleFoldDown();
              }}
            >
              <div className="inline-block i-tabler-arrow-autofit-down bg-teal" />
            </button>
          )}
          {pageIndices.length === 1
            ? `page ${pageIndices[0] + 1}`
            : `pages ${pageIndices[0] + 1} - ${pageIndices.at(-1)! + 1}`}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 lt-sm:grid-cols-1">
        <div className="w-full">
          <textarea
            className="input font-mono text-white bg-gray-900 w-full mt-[2px] min-h-[200px] col-span-2"
            value={userMarkdown}
            onChange={(event) => {
              setUserMarkdown(event.target.value);
              debouncedMarkdownChange(event.target.value);
              onMarkdownDirty();
            }}
          />
        </div>
        <div className="prose max-w-full font-inter">
          <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
        </div>
      </div>
    </>
  );
}
