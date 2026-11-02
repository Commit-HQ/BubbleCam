// The device's camera, for the studio. Browser-only.

export type Facing = 'user' | 'environment';

/** Why the camera can't be used: not allowed, not there, in use by another app, or not in this browser. */
export type CameraProblem = 'denied' | 'missing' | 'busy' | 'unsupported';

export class CameraError extends Error {
	constructor(readonly problem: CameraProblem) {
		super(`Camera ${problem}`);
	}
}

/**
 * Opens the camera that faces the given way, or the only one there is. It asks for 720p, which is all a film
 * keeps (geometry.ts), so phones don't spend battery on a bigger picture.
 */
export async function openCamera(facing: Facing): Promise<MediaStream> {
	if (!navigator.mediaDevices?.getUserMedia) throw new CameraError('unsupported');
	try {
		return await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				facingMode: { ideal: facing },
				width: { ideal: 1280 },
				height: { ideal: 720 },
				frameRate: { ideal: 30 }
			}
		});
	} catch (error) {
		throw new CameraError(problemOf(error));
	}
}

function problemOf(error: unknown): CameraProblem {
	switch (error instanceof DOMException ? error.name : '') {
		case 'NotAllowedError':
		case 'SecurityError':
			return 'denied';
		case 'NotFoundError':
		case 'OverconstrainedError':
			return 'missing';
		case 'NotReadableError':
		case 'AbortError':
			return 'busy';
		default:
			return 'unsupported';
	}
}

export function closeCamera(stream: MediaStream | undefined) {
	for (const track of stream?.getTracks() ?? []) track.stop();
}

/** How many cameras the device has. Browsers list them only once the camera has been allowed. */
export async function countCameras() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter((device) => device.kind === 'videoinput').length;
	} catch {
		return 1;
	}
}

/**
 * Whether a camera looks at the person holding the device, whose picture shows as in a mirror. A computer's
 * webcam often doesn't say which way it faces; it faces whoever uses it.
 */
export function facesUser(stream: MediaStream) {
	const facing = stream.getVideoTracks()[0]?.getSettings().facingMode;
	return facing ? facing === 'user' : true;
}
