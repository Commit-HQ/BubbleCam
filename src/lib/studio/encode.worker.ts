// Encodes a picture just taken as JPEG files, the picture and its thumbnail, away from the page, so the camera
// and the buttons never wait for it (shutter.ts). Pictures arrive as bitmaps the page hands over, and are
// encoded in the order they arrive.

type Job = { id: number; picture: ImageBitmap; thumb: { width: number; height: number } };

let full: OffscreenCanvas | undefined;
let small: OffscreenCanvas | undefined;

function canvas(current: OffscreenCanvas | undefined, width: number, height: number) {
	if (current?.width === width && current.height === height) return current;
	return new OffscreenCanvas(width, height);
}

self.onmessage = async ({ data }: MessageEvent<Job>) => {
	const { id, picture, thumb } = data;
	try {
		full = canvas(full, picture.width, picture.height);
		full.getContext('2d')!.drawImage(picture, 0, 0);
		small = canvas(small, thumb.width, thumb.height);
		const context = small.getContext('2d')!;
		context.imageSmoothingQuality = 'high';
		context.drawImage(picture, 0, 0, thumb.width, thumb.height);
		picture.close();
		// Each canvas is copied as the call is made, so the next picture may draw on it straight away.
		const [image, thumbnail] = await Promise.all([
			full.convertToBlob({ type: 'image/jpeg', quality: 0.9 }),
			small.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
		]);
		self.postMessage({ id, image, thumb: thumbnail });
	} catch (error) {
		self.postMessage({ id, error: String(error) });
	}
};
