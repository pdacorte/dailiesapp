# Audio assets

Place the focus noise loop file here.

## Expected files

The Focus Noise button (Time Tracker section) loads the file referenced by
`FOCUS_NOISE_URL` in `app.js`. By default it expects:

- `audio/focus-loop.ogg` (preferred)

A fallback can be added by listing more URLs in `FOCUS_NOISE_SOURCES` in `app.js`,
e.g. `audio/focus-loop.mp3` for browsers without OGG support.

## Loop guidance

- The file is looped gaplessly via the Web Audio API (`AudioBufferSourceNode.loop`).
- For a seamless loop, edit the clip so both ends sit at a zero-crossing and the
  length is an exact multiple of the dominant wave period.
- Mono + normalized to a comfortable level is recommended; ambient noise files
  are small (a 30s mono OGG is typically ~150-400 KB).
