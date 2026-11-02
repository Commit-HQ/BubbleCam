// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}

	// The version and commit, which Vite puts in at build time (vite.config.ts).
	const __VERSION__: string;
	const __COMMIT__: string;
}

export {};
