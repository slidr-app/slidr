import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getDocs, collection, orderBy, query} from 'firebase/firestore/lite';
import {auth, firestore} from '../firebase.ts';
import {
  type PresentationDoc,
  type PresentationData,
} from '../../functions/src/presentation';
import DefaultLayout from '../layouts/DefaultLayout.tsx';
import Loading from '../components/Loading.tsx';

export default function Home() {
  useEffect(() => {
    document.title = `Slidr - Home`;
  }, []);

  const [presentations, setPresentations] = useState<PresentationDoc[]>();

  useEffect(() => {
    async function getPresentations() {
      const querySnapshot = await getDocs(
        query(
          collection(firestore, 'presentations'),
          orderBy('rendered', 'desc'),
        ),
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
    <DefaultLayout
      title={
        <>
          Presentations
          <div className="text-teal i-tabler-microphone-2 ml-2" />
        </>
      }
    >
      <div className="grid grid-cols-2 lt-sm:grid-cols-1 max-w-screen-lg w-full mx-auto gap-8 px-4 justify-center pb-6">
        {presentations?.map((presentation) => (
          <div
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
                {(presentation.title.length > 0 ||
                  presentation.username.length > 0) && (
                  <div className="absolute top-0 left-0 flex flex-col items-start bg-transparent pointer-events-none">
                    {presentation.title.length > 0 && (
                      <div className="p-2 rounded-br-md bg-gray-900 bg-opacity-85">
                        {presentation.title}
                      </div>
                    )}
                    {presentation.username.length > 0 && (
                      <div className="px-2 pb-1 rounded-br-md bg-gray-900 bg-opacity-85 text-base">
                        by {presentation.username}
                      </div>
                    )}
                  </div>
                )}
                <img
                  className="w-full aspect-video"
                  src={presentation.pages[presentation.thumbIndex ?? 0]}
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
                    <div className="text-base font-normal px-2">present</div>
                  </div>
                </button>
              </Link>
              <div className="flex-grow flex-shrink" />
              {presentation.uid === auth.currentUser?.uid && (
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
          </div>
        )) ?? (
          <div className="absolute top-50% left-50%">
            <Loading />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
