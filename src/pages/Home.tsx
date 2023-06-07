import {useEffect, Fragment, useState} from 'react';
import {Link} from 'react-router-dom';
import {getDocs, collection} from 'firebase/firestore/lite';
import {auth, firestore} from '../firebase.ts';
import {type PresentationDoc, type PresentationData} from '../presentation';

export default function Home() {
  useEffect(() => {
    document.title = `Present - Home`;
  }, []);

  const [presentations, setPresentations] = useState<PresentationDoc[]>([]);

  useEffect(() => {
    async function getPresentations() {
      const querySnapshot = await getDocs(
        collection(firestore, 'presentations'),
      );

      setPresentations(
        querySnapshot.docs.map((doc) => {
          const presentation: PresentationDoc = {
            id: doc.id,
            ...(doc.data() as PresentationData),
          };
          return presentation;
        }),
      );
    }

    void getPresentations();
  }, []);

  return (
    <div className="flex flex-col items-center max-w-screen-sm mx-auto">
      <div className="p-4 grid grid-cols-[600px_auto] lt-md:grid-cols-1 gap-y-8 lt-md:gap-y-0 even:children:lt-md:mb-8">
        {presentations.map((presentation) => (
          <Fragment key={presentation.id}>
            <div className="relative w-full aspect-video shadow-primary border-primary md:rounded-r-none lt-md:rounded-b-none overflow-hidden bg-black flex items-center justify-center">
              <div className="w-full h-full sibling:hover:opacity-100">
                <Link to={`/${presentation.id}`} className="">
                  <img src={presentation.pages[0]} />
                </Link>
              </div>
              {presentation.uid === auth.currentUser?.uid && (
                <div className="absolute right-0 bottom-0 bg-gray-900 bg-opacity-85 opacity-0 hover:(opacity-100) p-6 rounded-tl-lg transition-opacity duration-400 ease-out z-1">
                  <Link
                    className="flex flex-row gap-2 items-center text-teal text-lg"
                    to={presentation ? `/${presentation.id}/notes` : '/'}
                  >
                    <button
                      className="i-tabler-pencil font-size-[4rem]"
                      type="button"
                      title="Edit presentation"
                    />
                    <div>edit</div>
                  </Link>
                </div>
              )}
            </div>

            <div className="border-2 border-primary shadow-primary md:border-l-none md:rounded-l-none lt-md:border-t-none lt-md:rounded-t-none relative p-4 flex flex-col justify-center bg-black">
              <div className="flex-grow flex items-center justify-center">
                <Link to={`/${presentation.id}`}>
                  <button
                    className="btn border-none shadow-none p-2 flex flex-col items-center justify-center"
                    type="button"
                  >
                    <div className="text-3xl break-words">
                      {presentation.title ?? 'unname presentation'}
                    </div>
                    <div className="text-base font-normal flex flex-row items-center gap-x-2 flex-wrap justify-center">
                      <div className="i-tabler-presentation" />
                      <div>present</div>
                    </div>
                  </button>
                </Link>
              </div>
              <div className="flex flex-row items-center justify-center flex-wrap justify-around">
                <Link to={`/${presentation.id}/speaker`} className="flex">
                  <button
                    className="btn border-none shadow-none flex flex-col items-center p-2"
                    type="button"
                  >
                    <div className="i-tabler-speakerphone" />
                    <div className="text-base font-normal">speaker</div>
                  </button>
                </Link>
                <Link to={`/${presentation.id}/view`} className="">
                  <button
                    className="btn border-none shadow-none flex flex-col items-center p-2"
                    type="button"
                  >
                    <div className="i-tabler-eyeglass" />
                    <div className="text-base font-normal">audience</div>
                  </button>
                </Link>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
