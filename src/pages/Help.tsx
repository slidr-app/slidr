import DefaultLayout from '../layouts/DefaultLayout';
import exampleImage from '../assets/example-confetti.gif';
import cody from '../assets/cody.jpeg';
// Import navigateHome from '../assets/navigate-home.mp4';

export default function Help() {
  return (
    <DefaultLayout title="Help">
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 lt-sm:grid-cols-1 max-w-screen-lg w-full mx-auto">
          <div className="flex flex-col gap-2 self-center">
            <div className="text-5xl flex-shrink-0 font-bold">
              What is Slidr?
            </div>
            <div>
              Slidr is an interactive presentation framework that facilitates
              audiences interacting in realtime with a presenter. Slidr works
              both live and remote, always focusing on making amazing
              presentations. Best of all, it&apos;s free!
            </div>
          </div>
          {/* <div>another div</div>
          <div>another div 1</div> */}
          <img className="object-cover self-center" src={exampleImage} />
          <div className="col-span-full text-4xl font-bold text-center mt-20">
            Getting Started
          </div>
          <div className="col-span-full">
            Here&apos;s how to present your own presentation with Slidr:
          </div>
          <ol className="col-span-full flex flex-col gap-6">
            <li className="flex flex-col">
              <div className="flex flex-row items-end justify-start gap-3 text-teal">
                <div className="i-line-md-account text-4rem" />
                <div className="font-bold align-baseline text-2xl">
                  Step 1: Sign In
                </div>
              </div>
              <div className="pl-1">
                By signing in, you automatically create or reconnect to your
                existing account. Sign-in is easy: enter your email then click
                the link in your email.
              </div>
            </li>
            <li className="flex flex-col">
              <div className="flex flex-row items-end justify-start gap-3 text-teal">
                <div className="i-line-md-uploading-loop text-4rem" />
                <div className="font-bold align-baseline text-2xl">
                  Step 2: Upload
                </div>
              </div>
              <div className="pl-1">
                Once you&apos;re signed in, the upload button will appear in the
                top right menu. Click on it to upload your pdf presentation.
                Slidr let&apos;s you bring your own presentation and use
                whatever tool you already love. Whether you&apos;re using
                PowerPoint, Google Slides, Keynote, or something else, just be
                sure to export your presentation with 1 slide per page in PDF.
                Once the presentation is uploaded and processed, you can give it
                a meaningful title too.
              </div>
            </li>
            <li className="flex flex-col">
              <div className="flex flex-row items-end justify-start gap-3 text-teal">
                <div className="i-line-md-computer text-4rem" />
                <div className="font-bold align-baseline text-2xl">
                  Step 3: Present
                </div>
              </div>
              <div className="pl-1">
                Now that your presentation is uploaded, head over the homepage
                by clicking on the Slidr link at the top left of the screen. You
                should see your presentation towards the top. Click on the
                Present button underneath your presentation to start presenting.
              </div>
              {/* <div className="flex flex-row justify-center">
                <video autoPlay loop width="300">
                  <source src={navigateHome} type="video/mp4" />
                </video>
              </div> */}
            </li>
          </ol>
          <div className="col-span-full text-sm">
            P.S. Slidr is currently in beta, come back often to see what&apos;s
            new.
          </div>
          <div className="col-span-full text-4xl font-bold text-center mt-20">
            Getting Involved
          </div>
          <a
            className="col-span-full justify-self-center"
            href="https://github.com/slidr-app/slidr"
          >
            <div className="text-4rem i-line-md-github-loop text-teal" />
          </a>
          <div className="col-span-full">
            Slidr is 100% open source software! Come and help make Slidr better.
            We&apos;re building a community around Slidr and it&apos;s a great
            time to get involved. We need folks of all backgrounds and skill
            levels. Head over to the{' '}
            <a
              className="text-teal underline"
              href="https://github.com/slidr-app/slidr"
            >
              Slidr GitHub repository
            </a>{' '}
            to learn more! We&apos;d love to add your photo below!
          </div>
          <div className="col-span-full text-4xl font-bold text-center mt-20">
            Who&apos;s Behind Slidr?
          </div>
          <img
            className="col-span-full rounded-full overflow-hidden aspect-square justify-self-center max-w-90 border-teal border-3 shadow-primary"
            src={cody}
          />
          <div className="col-span-full">
            Hi!{' '}
            <div className="i-fluent-emoji-flat-waving-hand-medium-light align-baseline h-1.25rem w-1.25rem" />{' '}
            I&apos;m Cody. I started Slidr while speaking around the world. I
            love connecting with the audience when I&apos;m speaking and I was
            sure there must be a better way. That&apos;s when I decided to
            create Slidr. You cab find out how to connect with me over at my
            website:{' '}
            <a
              className="text-teal underline"
              href="https://devrel.codyfactory.eu"
            >
              devrel.codyfactory.eu
            </a>
            .
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
