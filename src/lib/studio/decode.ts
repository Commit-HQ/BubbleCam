// Decoding a film's pictures for drawing, on the page or in a worker.

/** A picture of a film, decoded for drawing, or null if it can't be read. */
export async function decode(
	load: (frameId: string) => Promise<Blob | undefined>,
	frameId: string
) {
	try {
		const blob = await load(frameId);
		return blob ? await createImageBitmap(blob) : null;
	} catch {
		return null;
	}
}
