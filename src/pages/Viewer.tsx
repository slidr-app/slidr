import {useEffect} from 'react';
import clsx from 'clsx';
import DefaultLayout from '../layouts/DefaultLayout';
import usePresentation from '../components/slides/use-presentation';
import Slideshow from '../components/slides/Slideshow';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import {useSlideIndex} from '../components/slides/use-slide-index';
import {auth} from '../firebase';
import ProgressBar from '../components/ProgressBar';
import Shares from '../components/Shares';
import NavButtons from '../components/toolbar/NavButtons';
import LinkButton from '../components/toolbar/LinkButton';

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

  const isOwner = presentation?.uid === auth.currentUser?.uid;

  return (
    <DefaultLayout title={presentation?.title ?? ''}>
      <div className="flex flex-col items-center pb-6">
        <div className="flex flex-col gap-4 items-stretch w-full max-w-screen-lg lt-lg:px-4">
          <div className="flex flex-col w-full rounded-lg overflow-hidden border-primary">
            <div className="flex" onClick={navNext}>
              <Slideshow
                pageIndex={slideIndex}
                pages={presentation?.pages ?? []}
                forward={forward}
              />
            </div>
            <div className="flex flex-row flex-wrap w-full justify-between shadow-lg gap-0.5 bg-black items-stretch relative pt-1">
              <div className="h-1 content-empty w-full absolute top-0 left-0">
                <ProgressBar
                  absolute
                  slideCount={presentation?.pages?.length ?? 0}
                  slideIndex={slideIndex}
                />
              </div>
              <div className="grid grid-cols-4 gap-0.5 flex-grow">
                <NavButtons
                  onPrevious={navPrevious}
                  onNext={navNext}
                  onStart={() => {
                    setSlideIndex(0);
                  }}
                  onEnd={() => {
                    setSlideIndex((presentation?.pages?.length ?? 1) - 1);
                  }}
                />
              </div>
              <div
                className={clsx(
                  'grid gap-0.5 flex-grow',
                  isOwner ? 'grid-cols-3' : 'grid-cols-2',
                )}
              >
                {isOwner && (
                  <LinkButton
                    clientRoute
                    icon="i-tabler-pencil"
                    label="edit"
                    title="Edit presentation"
                    to={presentation ? `/e/${presentation.id}` : '/'}
                  />
                )}
                <LinkButton
                  clientRoute
                  icon="i-tabler-presentation"
                  label="present"
                  title="Present from current slide"
                  to={
                    presentation
                      ? `/p/${presentation.id}${document.location.search}`
                      : '/'
                  }
                />
                <LinkButton
                  clientRoute
                  icon="i-tabler-rotate rotate-180"
                  label="present start"
                  title="Present from start"
                  to={
                    presentation
                      ? `/p/${
                          presentation.id
                        }?${presentFromStartSearchParameters.toString()}`
                      : '/'
                  }
                />
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
