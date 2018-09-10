document.getElementById('settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});

document.querySelector('.switch-button').addEventListener('click', function (ev) {
  this.classList.toggle('switch-button--actived');
});