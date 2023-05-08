import { useState, useEffect } from 'react'
// import './App.css'
import { Document, Page } from 'react-pdf'
import * as pdfjs from 'pdfjs-dist'
// import type { DocumentProps } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import clsx from 'clsx'
import './pdf.css'

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url)
pdfjs.GlobalWorkerOptions.workerSrc = src.toString()

function App() {
  const [page, setPage] = useState(0)
  const [numPages, setNumPages] = useState(0)
  const [forward, setForward] = useState(true);

  function nextPage(pageNum: number) {
    return Math.min(pageNum + 1, numPages - 1)
  }

  function prevPage(pageNum: number) {
    return Math.max(pageNum - 1, 0)
  }

  const prevPageNum = prevPage(page);
  const nextPageNum = nextPage(page);



  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      console.log({event, numPages});
      if (event.code === 'ArrowRight') {
        setPage(nextPage)
        setForward(true);
      }
      if (event.code === 'ArrowLeft') {
        setPage(prevPage)
        setForward(false)
      }
    }
  

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [numPages]);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy) {
    // console.log({nextNumPages})
    setNumPages(nextNumPages);
  }

  // console.log({numPages, page})

  console.log({ numPages, page, prevPageNum, nextPageNum, forward})

  const pageUnder =  <Page key={`page-${forward ? prevPageNum : nextPageNum}`} pageIndex={forward ? prevPageNum : nextPageNum} className={clsx('w-full h-full important-position-absolute top-0 left-0 opacity-100')}                 width={Math.min(window.innerWidth, window.innerHeight * (16/9))}
  />
  const pageOver = <Page key={`page-${forward ? nextPageNum : prevPageNum}`} pageIndex={forward ? nextPageNum : prevPageNum} className={clsx('w-full h-full important-position-absolute top-0 left-0 opacity-0')}                 width={Math.min(window.innerWidth, window.innerHeight * (16/9))}
  />

  // return (
  //   <div className='w-screen h-screen bg-black flex flex-col items-center justify-center'>
  //     <div className='w-full aspect-video bg-yellow' style={{maxWidth: 'calc(100vh * (16/9))'}}>
  //       <div className='bg-red'>hello</div>
  //     </div>
  //   </div>
  // )

  const Message = ({children}) => <div className='position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center'><div>{children}</div></div>

  return (
    <div className='text-white font-sans text-xl'>
      <div className='pdf-container w-screen h-screen flex flex-col items-center justify-center overflow-hidden'>
        <Document
          file={'/zen-oss.pdf'} onLoadSuccess={onDocumentLoadSuccess}
          className='w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]'
          loading={<Message>Loading...</Message>}
          error={<Message>Loading failed.</Message>}
          noData={<Message>No PDF file found.</Message>}
        >
        {/* <div className='bg-yellow position-absolute top-0 w-full h-full' />
        <div className='bg-blue position-absolute top-0 w-full h-full' /> */}
           
            {/* <div className='position-relative top-0 bg-yellow w-full h-full'> */}
              {/* Preload the previous page (if there is one) */}
              {((forward && page > 0) || (!forward && page < numPages - 1)) && pageUnder}
              {/* Render the current page with a CSS transition */}
              <Page
                key={`page-${page}`}
                pageIndex={page}
                width={Math.min(window.innerWidth, window.innerHeight * (16/9))}
                className='transition transition-opacity duration-500 ease-linear opacity-100 w-full h-full important-position-absolute top-0 left-0'
              />
              {/* Preload the next page (if there is one) */}
              {((forward && page < numPages - 1) || (!forward && page > 0)) && pageOver}
            {/* </div> */}

        </Document>
      </div>
    </div>
  )
}

export default App
