// Class names shared by the app's screens. The studio is a dark room with big round buttons, sized for small
// fingers; the cartoons' page has the site's light glass.

/** A round studio button holding one icon. Give it an `aria-label`; `aria-pressed` lights it up. */
export const roundButton =
	'grid size-14 shrink-0 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30 aria-pressed:bg-sky aria-pressed:text-night aria-pressed:ring-sky motion-reduce:active:scale-100';

/** A smaller round button for the studio's top bar. */
export const smallButton =
	'grid size-12 shrink-0 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30 motion-reduce:active:scale-100';

/** A pill with an icon and words, for the grown-ups' actions, such as making a video. */
export const pillButton =
	'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-white/12 px-4 font-display font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-30 motion-reduce:active:scale-100';

/** The main action on a light page: an ink pill. */
export const inkButton =
	'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-display text-lg font-semibold text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0';

/** An action that deletes something for good. */
export const dangerButton =
	'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-6 font-display text-lg font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-800';

/** A quieter action beside it. */
export const softButton =
	'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/70 px-6 font-display text-lg font-semibold text-ink ring-1 ring-ink/10 transition hover:bg-white';

/** A dialog in the middle of the screen, over the dimmed page. */
export const modal =
	'm-auto w-[calc(100%-2rem)] max-w-md rounded-4xl bg-white p-7 text-ink shadow-2xl shadow-indigo-950/30 backdrop:bg-ink/40';
