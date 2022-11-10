/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { getData } from '../scripts/getData';
import { ChatCircle, Clock, LinkSimple, Trash, Robot } from 'phosphor-react';
import ThreadModal from './ThreadModal';
import { useCache } from '../scripts/localCache';

const ThreadCard = ({
	threadId,
	deleteStateFn,
	lastUpdateStateFn
}: {
	threadId: string;
	deleteStateFn: CallableFunction;
	lastUpdateStateFn?: CallableFunction;
}) => {
	const cache = useCache();
	const [hasUpdate, setHasUpdate] = useState(false);
	const [currentLastPost, setCurrentLastPost] = useState<string | null>(null);
	const [previousLastPost, setPreviousLastPost] = useState<string | null>(null);
	const [isReading, setIsReading] = useState(false);
	const [updateDate, setUpdateDate] = useState<string | null>(null);
	const [updateTime, setUpdateTime] = useState<string | null>(null);
	const [postsData, setPostsData] = useState<any | null>(null);
	const [title, setTitle] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState<string | null>(null);

	const setDeleteThread = deleteStateFn;
	const setLastUpdateArray = lastUpdateStateFn;

	const threadUrl = 'doujin/' + threadId;

	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);
	const stateFns = [setLoading, setData, setError];

	const [loadState, setLoadState] = useState('loading');

	//Fetch thread data
	useEffect(() => {
		getData(stateFns, threadId);
	}, []);

	useEffect(() => {
		if (loading) {
			setLoadState('loaded');
		}
	}, [loading]);

	//If successfully retreived data, set states for thread card generation
	useEffect(() => {
		if (data) {
			setTitle(data.title);
			if (lastUpdateStateFn && setLastUpdateArray) {
				const noLastUpdate = data.lastUpdate === undefined;
				let lastUpdateObject: object;

				noLastUpdate
					? (lastUpdateObject = { id: threadId, lastUpdate: null })
					: (lastUpdateObject = { id: threadId, lastUpdate: data.lastUpdate });

				setLastUpdateArray((prevState: object[]) => [
					...prevState,
					lastUpdateObject
				]);
			}
			setTotalCount(data.totalCount);
			setPostsData(data.posts);
		}
	}, [data]);

	//If error occured, set state for thread card generation
	useEffect(() => {
		if (error) {
			if (lastUpdateStateFn && setLastUpdateArray) {
				setLastUpdateArray((prevState: object[]) => [
					...prevState,
					{ id: threadId, lastUpdate: null }
				]);
			}
		}
	}, [error]);

	//Set states for update notif and last update date and time
	useEffect(() => {
		if (postsData) {
			//Setting last update date and time to show on card
			const lastCommentDate = postsData[postsData.length - 1].date;
			const lastCommentTime = postsData[postsData.length - 1].time;
			setUpdateDate(lastCommentDate);
			setUpdateTime(lastCommentTime);

			//Setting last post states for update notif
			let lastPostId = postsData[postsData.length - 1].postId;
			if (!lastPostId) {
				lastPostId = 0;
			}
			setCurrentLastPost(lastPostId);
			setPreviousLastPost(cache.getSavedState(threadId, lastPostId));
		}
	}, [postsData]);

	//Show update notif if there are new posts from last visit
	useEffect(() => {
		if (previousLastPost) {
			if (previousLastPost !== currentLastPost) {
				setHasUpdate(true);
			}
		}
	}, [previousLastPost]);

	const clickHandle = () => {
		//Allow user to read cached threads and freshly fetched threads
		if (
			(!isReading && postsData && error) ||
			(!isReading && postsData && !error)
		) {
			setIsReading(true);

			//Update last post state for update notif
			if (previousLastPost && currentLastPost && hasUpdate) {
				//Save current last post as the new previous last post
				cache.set(threadId, currentLastPost);
				//Remove update notif
				setHasUpdate(false);
			}
		}
	};

	const deleteHandle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();
		setDeleteThread(threadId);
	};

	return (
		<div key={loadState}>
			<div className="thread-card" onClick={clickHandle}>
				<div className={hasUpdate ? 'update-bubble' : 'hidden'}></div>
				<h3
					className={error ? 'error hflex icon-gap vertical-center' : 'hidden'}
				>
					<Robot size={32} weight="duotone" />
					{error}
				</h3>
				<h1>{title}</h1>
				<div className="hflex space-btwn baseline thread-info wrap">
					<p className="hflex icon-gap vertical-center">
						<ChatCircle size={20} />
						<span className="post-count">{totalCount}</span>レス
					</p>
					<p className="hflex icon-gap vertical-center">
						<Clock size={20} /> <span>更新日時:</span>
						{updateDate} {updateTime}
					</p>
					<p className="hflex icon-gap vertical-center">
						<LinkSimple size={20} /> {threadUrl}
					</p>
					<button className="delete flex-center" onClick={deleteHandle}>
						<Trash size={20} />
					</button>
				</div>
			</div>
			<ThreadModal
				title={title!}
				threadUrl={threadUrl}
				threadId={threadId}
				postsData={postsData}
				isReading={isReading}
				setIsReading={setIsReading}
			/>
		</div>
	);
};

export default ThreadCard;
