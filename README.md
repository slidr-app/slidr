# present

*Crazy interactive presentation framework*

## Quickstart

Place 16x9 pdf presentations in `src/presentations`.
The filenames will be translated to routes in the applications.
Use short filenames without spaces so that they are url friendly.

For example `src/presentations/mypres.pdf`, will add the following routes:

- `/mypres` presentation view (navigate with arrow keys, `S` key to open speaker view)
- `/mypres/speaker` speaker view
- `/mypres/view` interactive audience view (can throw confetti on to the presentation)

### Install

```bash
pnpm run install
```

### Build

```bash
pnpm run build
```

### Debug

```
pnpm run dev
```

## Techstack

Uses supabase to broadcast messages from the client view to the presentation view.

In order to build, the following env vars must be set:

- `VITE_SUPABASE_URL` supabase url
- `VITE_SUPABASE_KEY` supabase key
