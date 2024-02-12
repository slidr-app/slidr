import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {collection, orderBy, query, onSnapshot} from 'firebase/firestore';
import {auth, firestore} from '../firebase.ts';
import {
  type PresentationDocument,
  type PresentationData,
} from '../../functions/src/presentation';
import DefaultLayout from '../layouts/DefaultLayout.tsx';
import Loading from '../components/Loading.tsx';

export default function Home() {
  useEffect(() => {
    document.title = `Slidr - Home`;
  }, []);

  const [presentations, setPresentations] = useState<PresentationDocument[]>();

  useEffect(() => {
    return onSnapshot(
      query(
        collection(firestore, 'presentations'),
        orderBy('rendered', 'desc'),
      ),
      (querySnapshot) => {
        setPresentations(
          querySnapshot.docs.map((document) => {
            const presentation: PresentationDocument = {
              id: document.id,
              data: document.data() as PresentationData,
            };
            return presentation;
          }),
        );
      },
    );
  }, []);

  return (
    <DefaultLayout
      title={
        <div
          id="page-title"
          className="flex flex-row items-center justify-center"
        >
          Presentations
          <div className="text-teal i-tabler-microphone-2 ml-2" />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="p-4 flex flex-col gap-1 items-center">
          <div className="text-2xl text-center">
            Slidr.app: making presentations fun!
          </div>
          <div className="text-sm text-center">
            Slidr is currently in beta, come back often to see what&apos;s new.
          </div>
        </div>
        {presentations === undefined ? (
          <div className="flex flex-col col-span-2 w-full h-40 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <ol
            className="grid grid-cols-2 lt-sm:grid-cols-1 max-w-screen-lg w-full mx-auto gap-8 px-4 justify-center pb-6"
            aria-labelledby="page-title"
          >
            {presentations?.map((presentation) => (
              <li
                key={presentation.id}
                className="relative flex flex-col shadow-primary border-primary overflow-hidden sm:odd:last:(col-span-2 w-50% mx-auto)"
              >
                <div className="relative w-full h-full siblings:hover:opacity-100 border-b-2 border-teal">
                  <Link to={`/v/${presentation.id}`} className="">
                    <div className="absolute w-full h-full bg-black opacity-0 hover:(opacity-60) flex items-center justify-center">
                      <div className="flex flex-col items-center ">
                        <div className="i-tabler-eye w-6rem h-6rem" />
                        <div>view</div>
                      </div>
                    </div>
                    {(presentation.data.title.length > 0 ||
                      presentation.data.username.length > 0) && (
                      <div className="absolute top-0 left-0 flex flex-col items-start bg-transparent pointer-events-none">
                        {presentation.data.title.length > 0 && (
                          <div className="p-2 rounded-br-md bg-gray-900 bg-opacity-85">
                            {presentation.data.title}
                          </div>
                        )}
                        {presentation.data.username.length > 0 && (
                          <div className="px-2 pb-1 rounded-br-md bg-gray-900 bg-opacity-85 text-base">
                            by {presentation.data.username}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Hide the alt text with 0pt font, hacky! */}
                    <img
                      className="w-full aspect-video text-[0]"
                      src={
                        presentation.data.pages[
                          presentation.data.thumbIndex ?? 0
                        ]
                      }
                      alt="thumbnail"
                      role="presentation"
                    />
                  </Link>
                </div>
                <div className="flex flex-row pt-2 items-center gap-4 px-4 lt-sm:(gap-2 px-2)">
                  <Link to={`/v/${presentation.id}`} className="flex">
                    <button
                      className="hover:children:(nav-active) overflow-hidden pb-2"
                      type="button"
                      title="View presentation"
                    >
                      <div className="flex flex-col items-center border-b-2 border-black">
                        <div className="i-tabler-eye" />
                        <div className="text-base font-normal px-2">view</div>
                      </div>
                    </button>
                  </Link>
                  <Link to={`/p/${presentation.id}`} className="flex">
                    <button
                      className="hover:children:(nav-active) overflow-hidden pb-2"
                      type="button"
                      title="Start presentation"
                    >
                      <div className="flex flex-col items-center border-b-2 border-black">
                        <div className="i-tabler-presentation" />
                        <div className="text-base font-normal px-2">
                          present
                        </div>
                      </div>
                    </button>
                  </Link>
                  <div className="flex-grow flex-shrink" />
                  {presentation.data.uid === auth.currentUser?.uid && (
                    <Link className="flex" to={`/e/${presentation.id}`}>
                      <button
                        className="hover:children:(nav-active) overflow-hidden pb-2"
                        type="button"
                        title="Edit presentation"
                      >
                        <div className="flex flex-col items-center border-b-2 border-black">
                          <div className="i-tabler-pencil" />
                          <div className="text-base font-normal px-2">edit</div>
                        </div>
                      </button>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </DefaultLayout>
  );
}
