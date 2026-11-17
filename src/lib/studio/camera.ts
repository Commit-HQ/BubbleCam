// The device's camera, for the studio. Browser-only.

import { longSide } from './geometry.ts';

export type Facing = 'user' | 'environment';

/** Why the camera can't be used: not allowed, not there, in use by another app, or not in this browser. */
export type CameraProblem = 'denied' | 'missing' | 'busy' | 'unsupported';

export class CameraError extends Error {
	constructor(readonly problem: CameraProblem) {
		super(`Camera ${problem}`);
	}
}

/**
 * Opens the camera that faces the given way, or the only one there is. It asks for a picture `long` pixels
 * long, 720p unless a grown-up chose otherwise, which is all a film keeps (geometry.ts), so phones don't spend
 * battery on a bigger picture.
 *
 * When the browser is about to ask whether the camera is allowed, the microphone is asked for with it, so
 * recording a voice later doesn't stop to ask again. The microphone is let go at once: it's only on while a
 * voice is recorded (voice.ts). Without a microphone, or where both are refused, the camera is asked for alone.
 */
export async function openCamera(facing: Facing, long = longSide): Promise<MediaStream> {
	if (!navigator.mediaDevices?.getUserMedia) throw new CameraError('unsupported');
	const video = {
		facingMode: { ideal: facing },
		width: { ideal: long },
		height: { ideal: (long * 9) / 16 },
		frameRate: { ideal: 30 }
	};
	try {
		if (await asksFirst()) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
				for (const track of stream.getAudioTracks()) {
					track.stop();
					stream.removeTrack(track);
				}
				return stream;
			} catch {
				// The camera alone, below.
			}
		}
		return await navigator.mediaDevices.getUserMedia({ audio: false, video });
	} catch (error) {
		throw new CameraError(problemOf(error));
	}
}

/** Whether the browser will ask the person before it opens the camera. Browsers that don't say aren't asked. */
async function asksFirst() {
	try {
		const camera = await navigator.permissions.query({ name: 'camera' as PermissionName });
		return camera.state === 'prompt';
	} catch {
		return false;
	}
}

/** Why a camera or a microphone couldn't be opened, from the browser's error. */
export function problemOf(error: unknown): CameraProblem {
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
