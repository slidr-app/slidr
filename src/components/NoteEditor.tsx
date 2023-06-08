import clsx from 'clsx';
import {useState} from 'react';
import {ReactMarkdown} from 'react-markdown/lib/react-markdown';
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
  pageIndices: number[];
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  onMarkdownDirty: () => void;
  handleFoldUp: () => void;
  handleFoldDown: () => void;
  pages: string[];
}) {
  const [userMarkdown, setUserMarkdown] = useState(markdown);
  const debouncedMarkdownChange = useDebouncedCallback(
    (nextMarkdown: string) => {
      onMarkdownChange(nextMarkdown);
    },
    1000,
  );

  return (
    <>
      <div className="relative not-first:mt-8">
        <div className="grid grid-cols-[repeat(auto-fill,_12rem)]">
          {pageIndices.map((pageIndex, indicesIndex) => (
            <img
              key={pageIndex}
              className={clsx(
                'aspect-video',
                indicesIndex === 0
                  ? 'grid-col-span-2 grid-row-span-2 w-24rem'
                  : 'w-12rem',
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
      {/* <img src={page} className="w-full aspect-video" /> */}
      <div className="grid grid-cols-2 gap-x-2">
        <div className="w-full h-full">
          <textarea
            className="input font-mono text-white bg-gray-900 w-full h-full min-h-[200px] mt-[2px]"
            value={userMarkdown}
            onChange={(event) => {
              setUserMarkdown(event.target.value);
              debouncedMarkdownChange(event.target.value);
              onMarkdownDirty();
            }}
          />
        </div>
        <div className="prose max-w-full font-inter">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
