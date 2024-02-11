# Slidr
[![CI/CD](https://github.com/slidr-app/slidr/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/slidr-app/slidr/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/slidr-app/slidr/graph/badge.svg?token=K02VRLAXYW)](https://codecov.io/gh/slidr-app/slidr)
      
## *Crazy interactive presentation framework 🎉*

Start using Slidr now:\
https://slidr.app

<br><br>

![Presentation](./example-confetti.gif)

_Main presentation view_


<br><br>

![Speaker](./speaker-view.png)

_Speaker view with notes_

<br><br>

![Audience](./audience-view.png)

_Mobile friendly audience view... go ahead, throw some confetti on the main screen 🎉!_

<br><br>

## Quickstart

1. Create an account at https://slidr.app/signin
1. Upload a 16x9 pdf presentation to https://slidr.app/upload
1. Enjoy!


## Dev
### Install

```bash
pnpm run install
```

### Build

```bash
pnpm run build
```

### Debug

Debugging in dev mode uses local emulators for the database, storage, and authentication.
This allows the development to work offline (note that the fonts may not get loaded when offline).

💡 A magic signin button will appear on the signin page when running in development mode to replace the email link signin.

```
pnpm run dev
```
### Lint

```
pnpm run lint
```

### Test

Testing uses the emulator suite to enable tests to run locally (no internet connection required) and predictably.

```
pnpm run test
```

In order to pass parameters to `vitest` other than those in the `test` script, the emulators and vitest should be started in separate terminal instances:

```
pnpm run emulators
```

```
pnpm run test:start [args for vitest]
```

#### E2E Tests

```
pnpm run test:e2e
```

Snapshots are platform dependent. To update the snapshots with docker (required when developing with mac):

```sh
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.39.0-jammy /bin/bash
# host is now at 192.168.5.2 or host.docker.internal
npm install -g pnpm
# remove @vite-pwa/assets-generator from package.json
# or apt install default-jre libvips libvips-dev build-essential
pnpm install
pnpm run test:e2e:snapshots
```

### Build

Create a production build:
```
pnpm run build
```

💡 Several environment variables are required to build a working site. See [.env.emulator](./.env.emulator) for a list of required environment variables.

## Deployment

The `main` branch is automatically deployed to the staging environment: https://staging.slidr.app

The `production` branch is automatically deployed to the production environment: https://slidr.app
