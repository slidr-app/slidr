import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {useSearchParams} from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import {useSlideIndex} from './use-slide-index';

const markdown = `# Start here

- Just a link: https://reactjs.com.
- some other stuff
- and even more

This is how **it works**.
`;

export default function Speaker() {
  // Const [searchParameters, setSearchParameters] = useSearchParams();
  // const [firstMount, setFirstMount] = useState(true);
  // const [slideIndex, setSlideIndex] = useState<number>();
  // const [postSlideIndex, setPostSlideIndex] =
  //   useState<(index: number) => void>();

  // useEffect(() => {
  //   const currentSlideChannel = new BroadcastChannel('current_slide');
  //   const currentSlideHandler = (event: MessageEvent) => {
  //     console.log(event);
  //     setSearchParameters(
  //       {slide: String(event.data as number)},
  //       {replace: true},
  //     );
  //     setSlideIndex(event.data as number);
  //   };

  //   currentSlideChannel.addEventListener('message', currentSlideHandler);
  //   setPostSlideIndex(() => (index: number) => {
  //     console.log('posting', index);
  //     currentSlideChannel.postMessage(index);
  //   });

  //   return () => {
  //     currentSlideChannel.removeEventListener('message', currentSlideHandler);
  //     currentSlideChannel.close();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (postSlideIndex) {
  //     setFirstMount(false);
  //   }
  // }, [postSlideIndex]);

  // const updateIndex = (index: number) => {
  //   setSlideIndex(index);
  //   postSlideIndex!(index);
  // };

  // useEffect(() => {
  //   if (!postSlideIndex) {
  //     return;
  //   }

  //   const nextIndex = searchParameters.get('slide');
  //   if (nextIndex === null) {
  //     setSearchParameters({slide: '0'}, {replace: true});
  //     updateIndex(0);
  //     return;
  //   }

  //   if (firstMount) {
  //     console.log('first mount');
  //     updateIndex(Number.parseInt(nextIndex, 10));
  //   }
  // }, [searchParameters.get('slide'), firstMount, postSlideIndex]);

  const {slideIndex, setSlideIndex, nextSlideIndex, prevSlideIndex} =
    useSlideIndex(40);

  console.log({slideIndex});

  return (
    <div className="m-2 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-2 h-screen">
      <div className="col-span-2 p-2">Current Slide: {slideIndex}</div>
      <div className="flex flex-col items-center p-2 gap-2">
        <button
          onClick={() => {
            setSlideIndex(nextSlideIndex);
          }}
        >
          Next
        </button>
        <button
          onClick={() => {
            setSlideIndex(prevSlideIndex);
          }}
        >
          Prev
        </button>
        <button>Start</button>
        <button>End</button>
      </div>
      <div className="p-2">
        <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
      </div>
    </div>
  );
}
