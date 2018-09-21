//controller
var actived = true;

document.getElementById('settings').addEventListener('click', () => {
	chrome.tabs.create({
		url: chrome.runtime.getURL("settings.html")
	});
});

document.querySelector('.switch-button').addEventListener('click', function (ev) {
	this.classList.toggle('switch-button--actived');
	actived = !actived;
	if (actived) {
		localStorage.setItem('active', true);
		send("start");
	} else {
		localStorage.setItem('active', false);
		send("stop");
	}
});

function send(msg) {
	chrome.tabs.query({
		title: 'Konferencja Ipfon'
	}, tabs => {
		if (typeof (tabs[0]) !== "undefined") {
			chrome.tabs.sendMessage(tabs[0].id, msg);
		}
	});
}

if (localStorage.getItem('active') == "false") {
	document.getElementById('on-btn').click();
}