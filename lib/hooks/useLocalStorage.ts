import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(initialValue);

	useEffect(() => {
		try {
			const item = localStorage.getItem(key);
			if (item) {
				setStoredValue(JSON.parse(item));
			}
		} catch (error) {
			console.error('Error reading local storage key:', key, error);
		}
	}, [key]);

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.error('Error setting local storage key:', key, error);
		}
	};

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
