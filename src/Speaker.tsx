import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {useSearchParams} from 'react-router-dom';
import remarkGfm from 'remark-gfm';

const markdown = `# Start here

- Just a link: https://reactjs.com.
- some other stuff
- and even more

This is how **it works**.
`;

export default function Speaker() {
  const [searchParameters, setSearchParameters] = useSearchParams();

  const [slideIndex, setSlideIndex] = useState<number>();
  useEffect(() => {
    const nextIndex = searchParameters.get('slide');
    if (nextIndex === null) {
      setSearchParameters({slide: '0'}, {replace: true});
      return;
    }

    setSlideIndex(Number.parseInt(nextIndex, 10));
  }, [searchParameters.get('slide')]);

  // If (!searchParameters.has('slide')) {
  //   console.log('setting');
  //   setSearchParameters({slide: '0'});
  // }

  // const index = searchParameters.get('slide');
  console.log({slideIndex});
  // Const currentSlideChannel = useMemo(
  //   () => new BroadcastChannel('current_slide'),
  //   [],
  // );
  // UseEffect(() => {
  //   return () => {
  //     currentSlideChannel.close();
  //   };
  // }, [currentSlideChannel]);

  useEffect(() => {
    const currentSlideChannel = new BroadcastChannel('current_slide');

    const currentSlideHandler = (event: MessageEvent) => {
      console.log(event);
      setSearchParameters(
        {slide: String(event.data as number)},
        {replace: true},
      );
    };

    currentSlideChannel.addEventListener('message', currentSlideHandler);

    return () => {
      currentSlideChannel.removeEventListener('message', currentSlideHandler);
      currentSlideChannel.close();
    };
  }, []);

  return (
    <div className="m-2 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-2 h-screen">
      <div className="col-span-2 p-2">Current Slide: {slideIndex}</div>
      <div className="flex flex-col items-center p-2 gap-2">
        <button>Next</button>
        <button>Prev</button>
        <button>Start</button>
        <button>End</button>
      </div>
      <div className="p-2">
        <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
      </div>
    </div>
  );
}
