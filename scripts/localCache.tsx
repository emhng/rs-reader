const useCache = () => {
	//Adds or updates a key to cache
	const set = function (key: string, value: any) {
		localStorage.setItem(key, JSON.stringify(value));
	};

	//Gets saved data from cache
	const get = function (key: string) {
		const item = localStorage.getItem(key);
		if (item === null) {
			return null;
		} else {
			const parsedItem = JSON.parse(item);
			return parsedItem;
		}
	};

	//Checks cache for previous saved state, if none found it sets an initial state
	const getSavedState = function (key: string, initialState: any) {
		if (typeof window !== 'undefined') {
			const savedItem = get(key);
			if (savedItem === null) {
				set(key, initialState);
				return initialState;
			} else {
				return savedItem;
			}
		}
	};

	//Deletes a key from cache
	const remove = function (key: string) {
		localStorage.removeItem(key);
	};

	return { set, get, getSavedState, remove };
};

export { useCache };
