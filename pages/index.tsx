import Head from 'next/head';
import Link from 'next/link';

import ThreadCard from '../components/ThreadCard';

import { WarningCircle } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { useCache } from '../scripts/localCache';

export default function Home () {
	const cache = useCache();

	const [threadIdArray, setThreadIdArray] = useState(
		cache.getSavedState(
			'threadIdArray',
			process.env.NEXT_PUBLIC_STARTER_THREADS?.split(', ')
		)
	);
	const [threadList, setThreadList] = useState<JSX.Element[] | []>([]);
	const [deleteThread, setDeleteThread] = useState<string | null>(null);
	const [newThreadId, setNewThreadId] = useState<string | null>(null);
	const [isNoInput, setIsNoInput] = useState(true);
	const [addError, setAddError] = useState<string | null>(null);
	const [isReload, setIsReload] = useState(false);
	const [reloadCount, setReloadCount] = useState(0);
	const [emptyState, setEmptyState] = useState<JSX.Element[] | []>([]);

	const threadLimit = 6;
	const [isThreadLimit, setIsThreadLimit] = useState(false);

	const [lastUpdateArray, setLastUpdateArray] = useState<any[] | []>([]);

	//Get threads on first load
	useEffect(() => {
		if (threadIdArray !== null && threadList.length === 0) {
			if (threadIdArray.length !== 0) {
				const cardArray = threadIdArray.map(id => {
					return (
						<ThreadCard
							threadId={id}
							deleteStateFn={setDeleteThread}
							lastUpdateStateFn={setLastUpdateArray}
							key={id}
						/>
					);
				});
				setThreadList(cardArray);
			}
		}
	}, []);

	useEffect(() => {
		if (threadIdArray.length === 0) {
			const emptyDiv = (
				<div className="empty-state flex-center" key={0}>
					<h1>スレを追加しましょう</h1>
				</div>
			);
			setEmptyState([emptyDiv]);
		} else {
			setEmptyState([]);
		}

		if (!isThreadLimit && threadIdArray.length === threadLimit) {
			setIsThreadLimit(true);
		}
		if (isThreadLimit && threadIdArray.length < threadLimit) {
			setIsThreadLimit(false);
		}
	}, [threadIdArray, isThreadLimit]);

	//Sort each thread by last update, with newest being at top and oldest at bottom
	useEffect(() => {
		if (lastUpdateArray.length === threadIdArray.length) {
			//Sort the thread IDs by when they were last updated
			const unsortedLastUpdateArray = [...lastUpdateArray];
			const sortedLastUpdateArray = unsortedLastUpdateArray
				.sort((a, b) => {
					let date1 = new Date(a.lastUpdate);
					let date2 = new Date(b.lastUpdate);

					if (date1 < date2) {
						return -1;
					}
					if (date1 > date2) {
						return 1;
					}
					if (date1 === date2) {
						return 0;
					}
				})
				.reverse();

			//Create the thread cards with most recent at beginning of array
			const sortedCardArray = sortedLastUpdateArray.map(data => {
				return (
					<ThreadCard
						threadId={data.id}
						deleteStateFn={setDeleteThread}
						lastUpdateStateFn={setLastUpdateArray}
						key={data.id}
					/>
				);
			});

			setThreadList(sortedCardArray);
		}
	}, [lastUpdateArray]);

	//Refresh to get updated thread data
	useEffect(() => {
		if (isReload && threadIdArray !== null) {
			if (threadIdArray.length !== 0) {
				//Reset state that is in charge of sorting thread order
				setLastUpdateArray([]);

				//Generate first load cards again
				const cardArray = threadIdArray.map((id: string) => {
					return (
						<ThreadCard
							threadId={id}
							deleteStateFn={setDeleteThread}
							lastUpdateStateFn={setLastUpdateArray}
							key={id}
						/>
					);
				});
				setThreadList(cardArray);

				//Reset reload state and update reload count
				setIsReload(false);
				setReloadCount(prevState => prevState + 1);
			}
		}
	}, [isReload]);

	//Delete thread
	useEffect(() => {
		if (deleteThread) {
			//Remove previous last post data for this ID from cache
			cache.remove(deleteThread);

			//Remove thread ID card
			const newThreadIdArray = threadIdArray.filter(id => {
				if (id !== deleteThread) {
					return id;
				}
			});
			setThreadIdArray(newThreadIdArray);
			cache.set('threadIdArray', newThreadIdArray);

			//Remove title card component
			const newThreadList = threadList.filter(card => {
				if (card.props.threadId !== deleteThread) {
					return card;
				}
			});
			setThreadList(newThreadList);
		}
	}, [deleteThread]);

	const addThread = e => {
		e.preventDefault();
		const notDuplicateId = threadIdArray.indexOf(newThreadId) === -1;
		if (notDuplicateId && threadIdArray.length < threadLimit && newThreadId) {
			//Add thread ID
			setThreadIdArray([newThreadId, ...threadIdArray]);
			cache.set('threadIdArray', [newThreadId, ...threadIdArray]);

			//Create thread card component
			const newThreadCard = (
				<ThreadCard
					threadId={newThreadId}
					deleteStateFn={setDeleteThread}
					key={newThreadId}
				/>
			);

			//Add new card to list
			setThreadList([newThreadCard, ...threadList]);
			window.scrollTo({ top: 0 });

			//Reset error message if there was one previously
			if (addError) {
				setAddError(null);
			}
		} else if (threadIdArray.length === threadLimit) {
			setAddError(`スレ数は最大${threadLimit}スレ`);
		} else if (!newThreadId) {
			setAddError('スレIDが必要');
		} else {
			setAddError('doujin/' + newThreadId + 'はすでに登録済み');
		}

		//reset input and button disable
		setNewThreadId(null);
		setIsNoInput(true);
	};

	const inputChangeHandle = e => {
		if (isNoInput && e.target.value !== ' ') {
			setIsNoInput(false);
		}
		//Prevent spaces from being added to threadId input
		const input = e.target.value.trim();
		setNewThreadId(input);
	};

	const reloadCards = e => {
		e.preventDefault();
		setIsReload(true);
	};

	const addThreadDiv = (
		<div className="hflex vertical-center wrap add-thread-cont">
			<div
				className={addError ? 'error icon-gap hflex vertical-center' : 'hidden'}
			>
				<WarningCircle size={20} />
				{addError}
			</div>
			<form className="hflex vertical-center" onSubmit={addThread}>
				{isThreadLimit ? (
					<div className="hflex vertical-center limit-msg">
						スレ数は最大{threadLimit}スレ
					</div>
				) : (
					<div className="label-input-cont">
						<label className="hflex vertical-center" htmlFor="new-thread">
							<p>doujin/</p>
							<input
								onChange={inputChangeHandle}
								name="new-thread"
								id="new-thread"
								type="text"
								maxLength={10}
								placeholder="1663333702"
								value={newThreadId || ''}
							/>
						</label>
					</div>
				)}

				<button
					className="add hflex icon-gap vertical-center"
					disabled={isNoInput}
				>
					スレを追加
				</button>
			</form>
		</div>
	);

	return (
		<div>
			<Head>
				<title>rs-reader</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<nav className="hflex space-btwn vertical-center">
				<a href="/" onClick={reloadCards}>
					<h1>rs-reader</h1>
				</a>
				{addThreadDiv}
			</nav>
			<main className="flex-center list" key={reloadCount}>
				{emptyState}
				{threadList}
			</main>
		</div>
	);
}
