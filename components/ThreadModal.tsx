import { X, LinkSimple, Robot } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { getData } from '../scripts/getData';
import { useRouter } from 'next/router';

const ThreadModal = ({
	title,
	threadUrl,
	threadId,
	postsData,
	isReading,
	setIsReading
}: {
	title: string;
	threadUrl: string;
	threadId: string;
	postsData: any;
	isReading: boolean;
	setIsReading: CallableFunction;
}) => {
	const router = useRouter();
	const [getAll, setGetAll] = useState(false);
	const [getNew, setGetNew] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<JSX.Element[] | []>([]);
	const [freshThreadData, setFreshThreadData] = useState<any | null>(null);
	const [lastPostAnchor, setLastPostAnchor] = useState('');
	const [posts, setPosts] = useState<JSX.Element[] | []>([]);

	useEffect(() => {
		if (isReading) {
			window.scrollTo({ top: 0 });
		}
	}, [isReading, freshThreadData, errorMessage]);

	//Create posts
	useEffect(() => {
		if (postsData) {
			const lastPostId = postsData[postsData.length - 1].postId;
			const lastPostAnchorString = '#' + threadUrl + '/' + lastPostId;
			setLastPostAnchor(lastPostAnchorString);
			const postsArray = postsData.map((post, index) => {
				return (
					<div
						className="post hflex"
						key={index}
						id={threadUrl + '/' + post.postId}
					>
						<div className="post-id hflex">
							<p>{post.postId}</p>
						</div>
						<div className="post-info">
							<div className="hflex post-header">
								<p>{post.name}</p>
								<p>{post.date}</p>
								<p>{post.time}</p>
								<p>{post.userId}</p>
							</div>
							<p className="message">{post.message}</p>
						</div>
					</div>
				);
			});
			setPosts(postsArray);
		}
	}, [postsData]);

	const closeClickHandle = () => {
		router.push('/');
		//Close modal
		if (isReading) {
			setIsReading(false);
		}
	};

	const modalClickHandle = e => {
		//Clicking on modal will not close the modal - modal only closes if close button or background clicked
		e.stopPropagation();
	};

	const getAllPosts = () => {
		setGetAll(true);
	};

	const getNewPosts = () => {
		setGetNew(true);
	};

	useEffect(() => {
		const stateFns = [setLoading, setFreshThreadData, setError];
		if (getAll) {
			getData(stateFns, threadId, true);

			//Reset so that user can attempt to get new data again on button click
			setGetAll(false);
		}

		if (getNew) {
			let lastPostId;
			if (!freshThreadData) {
				lastPostId = postsData[postsData.length - 1].postId;
			} else {
				const freshPostsData = freshThreadData.posts;
				lastPostId = freshPostsData[freshPostsData.length - 1].postId;
			}

			getData(stateFns, threadId, false, true, lastPostId);

			//Reset so that user can attempt to get new data again on button click
			setGetNew(false);
		}
	}, [getAll, getNew]);

	useEffect(() => {
		if (error) {
			//Generate error div
			const errorDiv = (
				<h3
					className={error ? 'error hflex icon-gap vertical-center' : 'hidden'}
				>
					<Robot size={32} weight="duotone" />
					{error}
				</h3>
			);
			setErrorMessage([errorDiv]);
		}
	}, [error]);

	useEffect(() => {
		if (freshThreadData) {
			//Clear out any previous error
			setError(null);

			//Create post divs
			const freshPostsData = freshThreadData.posts;
			const lastPostId = freshPostsData[freshPostsData.length - 1].postId;
			const lastPostAnchorString = '#' + threadUrl + '/' + lastPostId;
			setLastPostAnchor(lastPostAnchorString);
			const freshPostsArray = freshPostsData.map((post, index) => {
				return (
					<div
						className="post hflex"
						key={index}
						id={threadUrl + '/' + post.postId}
					>
						<div className="post-id hflex">
							<p>{post.postId}</p>
						</div>
						<div className="post-info">
							<div className="hflex post-header">
								<p>{post.name}</p>
								<p>{post.date}</p>
								<p>{post.time}</p>
								<p>{post.userId}</p>
							</div>
							<p className="message">{post.message}</p>
						</div>
					</div>
				);
			});
			setPosts(freshPostsArray);
		}
	}, [freshThreadData]);

	return (
		<div
			className={isReading ? 'modal-background' : 'hidden'}
			onClick={closeClickHandle}
		>
			<div className="modal" onClick={modalClickHandle}>
				<header className="">
					<div className="header-cont">
						<div className="hflex space-btwn vertical-center title-cont">
							<h2>{title}</h2>
							<button
								className="close hflex vertical-center"
								onClick={closeClickHandle}
							>
								<X size={20} />
							</button>
						</div>
						<div className="hflex space-btwn vertical-center wrap-rev page-control-cont">
							<div className="page-controls hflex">
								<button onClick={getAllPosts}>全部</button>
								<a href={lastPostAnchor}>
									<button>最後のレスへ飛ぶ</button>
								</a>
								<button onClick={getNewPosts}>新着</button>
							</div>
							<p className="hflex icon-gap vertical-center">
								<LinkSimple size={20} /> {threadUrl}
							</p>
						</div>
					</div>
				</header>
				<main className="thread-cont">
					<section className="posts">{error ? errorMessage : posts}</section>
				</main>
			</div>
		</div>
	);
};

export default ThreadModal;
