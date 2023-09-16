(() => {
	const globalThisProxy = {};

	function proxyGlobalThis(target) {
		Object.defineProperty(target, "globalThis", {
			get(key) {
				if (typeof globalThisProxy[key] !== "undefined") {
					return globalThisProxy[key];
				}

				return target[key];
			},
			set(key, value) {
				globalThisProxy[key] = value;
			},
		});
	}

	if (typeof window !== "undefined") {
		proxyGlobalThis(window);
	} else if (typeof global !== "undefined") {
		proxyGlobalThis(global);
	} else if (typeof self !== "undefined") {
		proxyGlobalThis(self);
	} else {
		throw new Error("unable to locate global object");
	}
})();
