import { useCallback, useState } from 'react';

export function useLoading() {
	const [count, setCount] = useState(0);

	const enterLoading = useCallback(() => {
		setCount((x) => x + 1);
	}, []);

	const leaveLoading = useCallback(() => {
		setCount((x) => x - 1);
	}, []);

	return {
		isLoading: count > 0,
		enterLoading,
		leaveLoading,
	};
}
