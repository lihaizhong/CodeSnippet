async function entry(fn, options) {
	try {
		return await fn();
	} catch (ex) {
		options?.eachError?.(ex);
		return entry(fn, options);
	}
}
