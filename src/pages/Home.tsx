import {useEffect, Fragment} from 'react';
import {Link} from 'react-router-dom';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {presentations, thumbs} from '../slides/presentation-urls.ts';
import {
  pdfMessageProperties,
  pageMessageProperties,
} from '../pdf/PdfMessages.tsx';
import '../pdf/pdf.css';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

const presentationSlugs = Object.keys(presentations).sort();

export default function Home() {
  useEffect(() => {
    document.title = `Present - Home`;
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full px-4">
        <div className="header self-center w-full text-3xl">
          Present!
          <div className="i-tabler-microphone-2 ml-2" />
        </div>
      </div>
      <div className="p-4 grid grid-cols-[600px_auto] lt-md:grid-cols-1 gap-y-8 lt-md:gap-y-0 even:children:lt-md:mb-8">
        {presentationSlugs.map((presentationSlug) => (
          <Fragment key={presentationSlug}>
            <div className="w-full aspect-video shadow-primary border-primary md:rounded-r-none lt-md:rounded-b-none overflow-hidden bg-black flex items-center justify-center">
              <div className="w-full h-full">
                <Link to={`/${presentationSlug}`} className="">
                  {thumbs.has(presentationSlug) ? (
                    <Document
                      className="w-full h-full object-contain relative"
                      file={thumbs.get(presentationSlug)}
                      {...pdfMessageProperties}
                    >
                      <Page
                        className="w-full h-full"
                        pageIndex={0}
                        {...pageMessageProperties}
                      />
                    </Document>
                  ) : (
                    <div>no preview</div>
                  )}
                </Link>
              </div>
            </div>

            <div className="border-2 border-primary shadow-primary md:border-l-none md:rounded-l-none lt-md:border-t-none lt-md:rounded-t-none relative p-4 flex flex-col justify-center bg-black">
              <div className="flex-grow flex items-center justify-center">
                <Link to={`/${presentationSlug}`}>
                  <button
                    className="btn border-none shadow-none p-2 flex flex-col items-center justify-center"
                    type="button"
                  >
                    <div className="text-3xl">{presentationSlug}</div>
                    <div className="text-base font-normal">
                      <div className="i-tabler-presentation mr-2" />
                      present
                    </div>
                  </button>
                </Link>
              </div>
              <div className="flex flex-row items-center justify-center flex-wrap justify-around">
                <Link to={`/${presentationSlug}/speaker`} className="flex">
                  <button
                    className="btn border-none shadow-none flex flex-col items-center p-2"
                    type="button"
                  >
                    <div className="i-tabler-speakerphone" />
                    <div className="text-base font-normal">speaker</div>
                  </button>
                </Link>
                <Link to={`/${presentationSlug}/view`} className="">
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
