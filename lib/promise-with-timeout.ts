export function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number) {
	const timeout = new Promise((_, reject) =>
		setTimeout(() => reject(new Error('Timeout exceeded')), timeoutMs)
	);

	return Promise.race<T>([promise, timeout] as any);
}