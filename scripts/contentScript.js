const TIME = 2000; //optymalny czas
function main(phonesResponse) {
	let inter;

	function NodeListToList(nodeList) {
		let returns = [];
		nodeList.forEach(i => {
			returns.push(i);
		});
		return returns;
	}

	function getAdmins() {
		let ch = document.querySelectorAll('input[type=checkbox]'),
			j = 0,
			ret = [];
		ch = NodeListToList(ch);
		ch.forEach(i => {
			if (i.checked) {
				ret.push(j);
			}
			j++;
		});
		return ret;
	}

	function newUsers() {
		let phones = [],
			phoneBook = [["Miłosz Wiśniewski", "720755490"]];
		if (typeof(phonesResponse.data) !== "undefined" && /\S/.test(phonesResponse.data.phones)) phoneBook = JSON.parse(phonesResponse.data.phones);
		console.log(phonesResponse.data);

		document.querySelectorAll('#returnDiv tr').forEach((el, i) => {
			if (i != 0) phones.push(el);
		});
		phones.pop();
		phones.pop();
		let content = '<br> <tr><th> Imie i nazwisko </th></tr>';
		phones.forEach((el, i) => {
			let doc = new DOMParser().parseFromString("<table>" + el.innerHTML + "</table>", "text/html");
			let phone = doc.querySelector('td:nth-child(2)').innerHTML;
			phoneBook.forEach(contact => {
				if (contact[1] == phone) { //give name
					content += `<tr><td> ${contact[0]} </td> <td><input style="visibility: hidden;" type="checkbox"></td> </tr>`;
				}
			});
		});

		if (document.getElementById('users') != null) {
			document.getElementById('users').innerHTML = content;
		}
	}

	function interval() {
		document.querySelector('a[onclick^=ajaxGetList]').click();

		let toMute = document.querySelectorAll('a[onclick*=mute]');
		toMute = NodeListToList(toMute);

		getAdmins().forEach(i => {
			toMute[i] = null;
		});

		toMute.pop();

		toMute.forEach(i => {
			if (i) {
				if (i.innerHTML == 'Wycisz') {
					i.click();
					console.log('Wyciszono');
				}
			}
		});
		newUsers();
	}

	document.getElementById('returnDiv').outerHTML = `<div id="results"><table border="0" id="users"></table>${document.getElementById('returnDiv').outerHTML}</div>`;
	document.querySelector('table').setAttribute('width', "");

	if (localStorage.getItem('active') != "false") {
		inter = setInterval(interval, TIME);
		console.log("włączone");
	} else console.log("wyłączone");

	chrome.runtime.onMessage.addListener((request) => {
		console.log(request);
		if (request == "start") {
			inter = setInterval(interval, TIME);
			localStorage.setItem('active', true);
		} else if (request == "stop") {
			clearInterval(inter);
			localStorage.setItem('active', false);
		} else {
			console.log(reuest);
		}
	});

	document.querySelector('head').innerHTML += "<title>Konferencja Ipfon</title>";
}
chrome.storage.local.get(['data'], main);