const getData = async (
	stateFns: CallableFunction[],
	threadId: string,
	allPosts?: boolean,
	newPosts?: boolean,
	postId?: string
) => {
	const [setLoading, setData, setError] = stateFns;
	try {
		let apiUrl: string = process.env.NEXT_PUBLIC_API + threadId + '/last50';

		if (allPosts === true) {
			apiUrl = process.env.NEXT_PUBLIC_API + threadId;
		}

		if (newPosts === true) {
			apiUrl = process.env.NEXT_PUBLIC_API + threadId + '/new/' + postId;
		}

		const response = await fetch(apiUrl, { mode: 'cors' });

		//Catch any errors from server request
		if (!response.ok) {
			switch (response.status) {
				case 429:
					throw new Error(
						'429 アクセス過多。15分ほど経ったらまたアクセスしてください。'
					);
				case 404:
					throw new Error(
						'404 このスレが存在しません。削除されたかURLが間違ってます。'
					);
				case 500:
					throw new Error('500 API側に問題が発生しました。');
				default:
					throw new Error(`${response.status}`);
			}
		}

		const apiData = await response.json();

		//Catch any errors from JSON
		if (
			(apiData.status && apiData.status !== '200') ||
			Object.keys(apiData).length === 0
		) {
			//Received empty JSON response
			if (Object.keys(apiData).length === 0) {
				throw new Error(
					'404 このスレが存在しません。削除されたかURLが間違ってます'
				);
			}

			//Receieved error JSON response
			switch (apiData.status) {
				case '404':
					throw new Error(
						'404 このスレが存在しません。削除されたかURLが間違ってます'
					);
				default:
					throw new Error(apiData.message);
			}
		} else {
			//Data retrieved successfully from API
			setData(apiData);
		}
	} catch (err) {
		setError(err.message);
	} finally {
		setLoading(false);
	}
};

export { getData };
