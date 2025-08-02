export async function wait(ms) {
	return new Promise((resolve) => {
		console.log('wait...', ms);
		setTimeout(() => {
			resolve(1);
		}, ms);
	});
}
