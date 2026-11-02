// The shapes and sizes of a film's pictures. A film takes the shape of the camera's picture when its first
// picture is taken; later pictures keep that shape whatever the camera does, such as a tablet turned on its
// side, by keeping the middle of the camera's picture. The viewfinder shows exactly the part a picture keeps,
// so the ghost of the last picture lines up with the camera.

export type Size = { width: number; height: number };
export type Rect = Size & { x: number; y: number };

/** The long side of a film's pictures, in pixels: 720p, sharp for a cartoon on a phone or a TV, and light to keep. */
export const longSide = 1280;

/** The height of a picture's thumbnail in the strip, in pixels: twice its height on screen, for sharp screens. */
export const thumbHeight = 144;

/**
 * The size of a new film's pictures, from the camera's picture: the same shape, at most `longSide` pixels long,
 * with both sides a multiple of 16, which every video encoder takes.
 */
export function filmSize(camera: Size): Size {
	const scale = Math.min(1, longSide / Math.max(camera.width, camera.height));
	const side = (length: number) => Math.max(16, Math.round((length * scale) / 16) * 16);
	return { width: side(camera.width), height: side(camera.height) };
}

/** The middle of a picture of `source`'s size that has `target`'s shape: what the viewfinder shows and a picture keeps. */
export function coverCrop(source: Size, target: Size): Rect {
	const sourceShape = source.width / source.height;
	const targetShape = target.width / target.height;
	if (sourceShape > targetShape) {
		const width = source.height * targetShape;
		return { x: (source.width - width) / 2, y: 0, width, height: source.height };
	}
	const height = source.width / targetShape;
	return { x: 0, y: (source.height - height) / 2, width: source.width, height };
}

/** The largest box of `shape`'s shape that fits in `space`, such as the viewfinder on the screen. */
export function fit(space: Size, shape: Size): Size {
	const scale = Math.min(space.width / shape.width, space.height / shape.height);
	return { width: shape.width * scale, height: shape.height * scale };
}

/** A thumbnail's size for pictures of `film`'s size. */
export function thumbSize(film: Size): Size {
	return { width: Math.round((film.width * thumbHeight) / film.height), height: thumbHeight };
}
