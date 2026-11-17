// The shapes and sizes of a film's pictures. A film takes the shape of the camera's picture when its first
// picture is taken, or the shape a grown-up chose for new films; later pictures keep that shape whatever the
// camera does, such as a tablet turned on its side, by keeping the middle of the camera's picture. The
// viewfinder shows exactly the part a picture keeps, so the ghost of the last picture lines up with the camera.

export type Size = { width: number; height: number };
export type Rect = Size & { x: number; y: number };

/** Lying or standing. */
export type Orientation = 'landscape' | 'portrait';

/** The shape of a new film: the camera's, which follows how the device is held, or always lying or standing. */
export type Shape = 'auto' | Orientation;

/** The long side of a film's pictures, in pixels: 720p, sharp for a cartoon on a phone or a TV, and light to keep. */
export const longSide = 1280;

/** The height of a picture's thumbnail in the strip, in pixels: twice its height on screen, for sharp screens. */
export const thumbHeight = 144;

/** Whether a picture lies or stands. A square one lies. */
export function orientationOf({ width, height }: Size): Orientation {
	return width >= height ? 'landscape' : 'portrait';
}

/**
 * The size of a new film's pictures, from the camera's picture: the same shape, at most `long` pixels long, with
 * both sides a multiple of 16, which every video encoder takes. A film that lies while the camera's picture
 * stands, or the other way round, has the camera's shape turned on its side. Its pictures keep the middle of
 * the camera's picture, so they're no larger than that middle.
 */
export function filmSize(camera: Size, shape: Shape = 'auto', long = longSide): Size {
	const turned = shape !== 'auto' && shape !== orientationOf(camera);
	const kept = turned ? coverCrop(camera, { width: camera.height, height: camera.width }) : camera;
	const scale = Math.min(1, long / Math.max(kept.width, kept.height));
	const side = (length: number) => Math.max(16, Math.round((length * scale) / 16) * 16);
	return { width: side(kept.width), height: side(kept.height) };
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

/** The middle of `rect`, `zoom` times smaller on each side: what a picture keeps of it, zoomed in. */
export function zoomCrop(rect: Rect, zoom: number): Rect {
	const width = rect.width / zoom;
	const height = rect.height / zoom;
	return {
		x: rect.x + (rect.width - width) / 2,
		y: rect.y + (rect.height - height) / 2,
		width,
		height
	};
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
