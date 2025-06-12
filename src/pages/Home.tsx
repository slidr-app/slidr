import {useContext, useEffect, useState} from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import {collection, orderBy, query, onSnapshot} from 'firebase/firestore';
import {auth, firestore} from '../firebase.ts';
import {
  type PresentationDocument,
  type PresentationData,
} from '../../functions/src/presentation';
import DefaultLayout from '../layouts/DefaultLayout.tsx';
import Loading from '../components/Loading.tsx';
import {UserContext} from '../components/UserProvider.tsx';

export default function Home() {
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
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
      <div className="flex flex-col items-center gap-16 max-w-screen-lg mx-auto">
        <div className="text-2xl text-center p-4">
          Slidr.app: making presentations fun!
        </div>
        <div className="self-stretch flex flex-col rounded-xl p-x-12 p-y-18 bg-gray-800 gap-y-8">
          <h2 className="text-3xl font-bold">Present better. Connect more.</h2>
          <p>
            Slidr turns your static slides into a dynamic, audience-driven
            experience. Upload your PDF, add notes, and go live with interactive
            features like:
          </p>
          <ul className="list-disc list-inside">
            <li>Real-time emoji reactions</li>
            <li>QR code audience join-in</li>
            <li>Slide-sync across devices</li>
            <li>Social sharing on the fly</li>
          </ul>
          <p className="italic">
            It’s like your favorite slide deck meets live streaming, with
            audience energy baked in.
          </p>
          <button
            type="button"
            className="btn flex flex-row gap-2 self-start text-lg font-semibold hover:bg-teal hover:bg-opacity-20 items-center"
            onClick={async () => {
              // First sign in if the user is not signed in
              if (!user) {
                navigate('/signin?redirect=/user');
                return;
              }

              // If signed-in, navigate to the user page
              await new Promise((resolve) => {
                setTimeout(resolve, 500);
              });
              navigate('/user');
            }}
          >
            <div>Upgrade to Slidr Pro</div>
            <div className="i-tabler-arrow-right w-6 h-6" />
          </button>
          <p className="text-sm text-gray-300 mt-2">
            Slidr Pro is available starting at just $5/month. Cancel anytime.
          </p>
        </div>
        <div className="self-stretch w-full flex flex-col gap-4 items-center">
          <span className="text-lg font-semibold">Compare Free and Pro</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-center text-teal">Free</span>
              <div>✅ Upload PDFs and add speaker notes</div>
              <div>✅ Live presentation mode with QR code sync</div>
              <div>✅ Real-time emoji reactions</div>
              <div>🚫 No watermark-free presentations</div>
              <div>🚫 No server-side rendering</div>
              <div>🚫 Limited file size (coming soon)</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-center text-teal">Pro</span>
              <div>✅ Everything in Free</div>
              <div>✅ Watermark-free presentations</div>
              <div>✅ Server-side rendering for higher quality</div>
              <div>✅ Increased file size and upload limits</div>
              <div>✅ Priority performance</div>
              <div>
                ✅ Support an{' '}
                <a
                  className="underline hover:text-teal"
                  href="https://github.com/slidr-app/slidr"
                >
                  Open Source project
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-base gap-2">
          <div>
            Wondering where to start? Check out the Getting Started guide.
          </div>
          <NavLink end to="/help" className="flex flex-row">
            <button
              className="btn hover:bg-teal hover:bg-opacity-20"
              type="button"
            >
              Getting Started
            </button>
          </NavLink>
        </div>
        {presentations === undefined ? (
          <div className="flex flex-col col-span-2 w-full h-40 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-screen-lg items-center gap-8">
            <div className="text-lg font-semibold">
              Browse latest presentations
            </div>
            <ol
              className="grid grid-cols-2 lt-sm:grid-cols-1 w-full mx-auto gap-8 px-4 justify-center pb-6"
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
                            <div className="text-base font-normal px-2">
                              edit
                            </div>
                          </div>
                        </button>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
