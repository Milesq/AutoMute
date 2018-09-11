function afterEvent () {
    let date = document.getElementById('dateInput').value,
        phones = document.getElementById('phonesInput').value;
    chrome.storage.local.set({data: {
        date: date,
        phones: phones
    }});
}

document.getElementById('saveData').addEventListener('click', afterEvent);
chrome.storage.local.get(['data'], response => {
    document.getElementById('phonesInput').value = response.data.phones;
    document.getElementById('dateInput').value = response.data.date
});