chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({
		name: 'Jack',
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
		chrome.scripting
			.executeScript({
				target: { tabId: tabId },
				files: ['./socketioclient.js'],
			})
			.then(() => {
				console.log('INJECTED THE FOREGROUND SCRIPT.');
			})
			.catch((err) => console.log(Err));
	}
});
