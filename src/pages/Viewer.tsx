import {Link} from 'react-router-dom';
import {useEffect} from 'react';
import DefaultLayout from '../layouts/DefaultLayout';
import usePresentation from '../components/slides/use-presentation';
import Slideshow from '../components/Slideshow';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import {useSlideIndex} from '../components/slides/use-slide-index';
import {auth} from '../firebase';
import ProgressBar from '../components/ProgressBar';
import Shares from '../components/Shares';

export default function Viewer() {
  const presentation = usePresentation();

  useEffect(() => {
    document.title = `Slidr - ${presentation?.title ?? 'Unnamed Presentation'}`;
  }, [presentation]);

  const {slideIndex, setSlideIndex, navNext, navPrevious, forward} =
    useSlideIndex({
      slideCount: presentation?.pages?.length ?? 0,
    });
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  const presentFromStartSearchParameters = new URLSearchParams(
    document.location.search,
  );
  presentFromStartSearchParameters.set('slide', '1');

  return (
    <DefaultLayout title={presentation?.title ?? ''}>
      <div className="flex flex-col items-center pb-6">
        <div className="flex flex-col gap-4 items-stretch w-full max-w-screen-lg">
          <div className="flex flex-col w-full">
            <Slideshow
              pageIndex={slideIndex}
              pages={presentation?.pages ?? []}
              forward={forward}
            />
            <div className="flex flex-row w-full items-start bg-gray-800 shadow-lg gap-4 items-stretch relative">
              <div className="h-1 content-empty w-full absolute top-0 left-0">
                <ProgressBar
                  absolute
                  slideCount={presentation?.pages?.length ?? 0}
                  slideIndex={slideIndex}
                />
              </div>
              <div className="grid grid-cols-4 children:(border-black border-x-1 px-2 py-1 flex flex-col justify-center items-center mx--0.5px bg-gray-800 text-teal) hover:children:(bg-gray-700) active:children:(text-white)">
                <button
                  className=""
                  type="button"
                  title="Previous"
                  onClick={navPrevious}
                >
                  <div className="i-tabler-arrow-big-left-filled" />
                  <div className="text-xs text-white">previous</div>
                </button>
                <button
                  className=""
                  type="button"
                  title="Next"
                  onClick={navNext}
                >
                  <div className="i-tabler-arrow-big-right-filled" />
                  <div className="text-xs text-white">next</div>
                </button>
                <button
                  className=""
                  type="button"
                  title="Start"
                  onClick={() => {
                    setSlideIndex(0);
                  }}
                >
                  <div className="i-tabler-arrow-bar-to-left" />
                  <div className="text-xs text-white">start</div>
                </button>
                <button
                  className=""
                  type="button"
                  title="End"
                  onClick={() => {
                    setSlideIndex((presentation?.pages?.length ?? 1) - 1);
                  }}
                >
                  <div className="i-tabler-arrow-bar-to-right" />
                  <div className="text-xs text-white">end</div>
                </button>
              </div>
              {/* <div className="border-l-black border-l-1 mx-1" /> */}
              <div className="flex-grow" />
              <div className="grid grid-flow-col auto-cols-fr all-[a_button]:(flex flex-col items-center justify-center) children:(border-black border-x-1 px-2 py-1 flex flex-col items-center justify-center mx--0.5px bg-gray-800 text-teal) hover:children:(bg-gray-700)">
                {presentation?.uid === auth.currentUser?.uid && (
                  <Link
                    className=""
                    to={presentation ? `/e/${presentation.id}` : '/'}
                  >
                    <button
                      className=""
                      type="button"
                      title="Edit presentation"
                    >
                      <div className="i-tabler-pencil" />
                      <div className="text-xs text-white">edit</div>
                    </button>
                  </Link>
                )}
                <Link
                  className=""
                  to={
                    presentation
                      ? `/p/${presentation.id}${document.location.search}`
                      : '/'
                  }
                >
                  <button className="" type="button" title="Present">
                    <div className="i-tabler-presentation" />
                    <div className="text-xs text-white">present</div>
                  </button>
                </Link>
                <Link
                  className=""
                  to={
                    presentation
                      ? `/p/${
                          presentation.id
                        }?${presentFromStartSearchParameters.toString()}`
                      : '/'
                  }
                >
                  <button className="" type="button" title="Present from start">
                    <div className="i-tabler-rotate rotate-180" />
                    <div className="text-xs text-white max-w-min">
                      present start
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div>{presentation?.title ?? ''}</div>
            {presentation && (
              <div className="text-base">
                by {presentation.username ?? 'Anonymous User'}
              </div>
            )}
          </div>
          <div className="flex self-start">
            <Shares presentation={presentation} slideIndex={slideIndex} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
