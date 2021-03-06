﻿const TIME = 2000; //optymalny czas w milisecundach (1sek = 1000 milisek)

function main(phonesResponse) {
	let inter;
	const whatWasEarlier = (p, q) => ((p[0] < q[0]) || (p[0] == q[0] && p[1] < q[1])) ? true : false;

	function isInBook(phone, phoneBook) {
		let ret = false;
		phoneBook.forEach((el, i) => {
			if (el[1] == phone) {
				ret = i;
			}
		});
		return ret;
	}

	function parseDate(str) {
		return {
			day: /^(\S+)\:/.exec(str)[1],
			start: {
				hour: /:([0-9]{2})/.exec(str)[1] * 1,
				minuts: /\.([0-9]{2})/g.exec(str)[1] * 1
			},
			end: {
				hour: /\-([0-9]{2})/.exec(str)[1] * 1,
				minuts: /\-.*\.([0-9]{2})/.exec(str)[1] * 1
			}
		};
	}

	function NodeListToList(nodeList) {
		let returns = [];
		nodeList.forEach(i => {
			returns.push(i);
		});
		return returns;
	}

	function getAdmins() {
		let ch = document.querySelectorAll('input[type=checkbox]:not(.invisible)'),
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
			phoneBook = [
				["Administracja", "525524910"]
			];
		if (typeof (phonesResponse.data) !== "undefined" && /\S/.test(phonesResponse.data.phones)) {
			let newPhones = phonesResponse.data.phones;
			newPhones.match(/\s[0-9]{9}/gm).forEach(el => {
				el = el.replace(/\s/, '');
				newPhones = newPhones.replace(el, '", "' + el);
			});
			while (/\n/.test(newPhones)) {
				newPhones = newPhones.replace(/\n/, "\"], [\"");
			}
			newPhones = "[[\"" + newPhones + "\"]]";
			phoneBook = JSON.parse(newPhones);
		}

		document.querySelectorAll('#returnDiv tr').forEach((el, i) => {
			if (i != 0) phones.push(el);
		});
		phones.pop();
		phones.pop();

		let content = '<br> <tr><th> Imie i nazwisko </th></tr>';
		phones.forEach((el) => {
			let doc = new DOMParser().parseFromString("<table>" + el.innerHTML + "</table>", "text/html"),
				phone = doc.querySelector('td:nth-child(2)').innerHTML;
			if (isInBook(phone, phoneBook) !== false) {
				let currentPhone = phoneBook[isInBook(phone, phoneBook)][0];
				content += `<tr><td> ${currentPhone} </td> <td><input class="invisible" style="visibility: hidden;" type="checkbox"></td> </tr>`;
			} else {
				content += `<tr><td><a target="blank" href="${chrome.runtime.getURL("settings.html")}">Nieznany</a></td> <td><input class="invisible" style="visibility: hidden;" type="checkbox"></td> </tr>`;
			}
		});

		if (document.getElementById('users') != null) {
			document.getElementById('users').innerHTML = content;
		}
	}

	function interval() {
		console.log('extension');
		if (typeof (phonesResponse.data) == "undefined") phonesResponse.data = {
			date: ''
		}
		if (!(phonesResponse.data.date.toLowerCase() === "all" || !/\S/.test(phonesResponse.data.date))) {
			let whenActive = '["' + phonesResponse.data.date + '"]',
				canBeActive = false;
			whenActive = JSON.parse(whenActive.replace(/\n/gm, '", "'));
			whenActive.forEach((el, i) => {
				if (!/^\S{2}\:([0-9]{1,2}\.[0-9]{2}.?){2}$/.test(el)) {
					alert('Invalid value for the "Active Times" field in extensions options, Error in ' + i + 1 + ' line');
					clearInterval(inter);
					return; // there should be a "continue" instruction but, this place isn't in the real loop
				}
				let days = ["nd", "pn", "wt", "śr", "czw", "pt", "sb"],
					now = new Date();
				el = parseDate(el);

				if (days.indexOf(el.day) != -1) {
					if (el.day == days[now.getDay()] &&
						whatWasEarlier([el.start.hour, el.start.minuts], [now.getHours(), now.getMinutes()]) &&
						!whatWasEarlier([el.end.hour, el.end.minuts], [now.getHours(), now.getMinutes()])
					) canBeActive = true;
				}
			});

			if (!canBeActive) {
				console.log('Nie ma działać');
				return;
			}
		}
		// console.log("Ma działać");

		document.querySelector('a[onclick^=ajaxGetList]').click();

		let toMute = NodeListToList(document.querySelectorAll('a[onclick*=mute]'));

		getAdmins().forEach(i => {
			toMute[i] = null;
		});

		toMute.pop();

		toMute.forEach(i => {
			if (i && i.innerHTML == 'Wycisz') i.click();
		});
		newUsers();
	}

	document.getElementById('returnDiv').outerHTML = `<div id="results"><table border="0" id="users"></table>${document.getElementById('returnDiv').outerHTML}</div>`;
	document.querySelector('table').setAttribute('width', "");

	if (localStorage.getItem('active') != "false") {
		inter = setInterval(interval, TIME);
	}

	chrome.runtime.onMessage.addListener((request) => {
		console.log(request);
		if (request == "start") {
			inter = setInterval(interval, TIME);
			localStorage.setItem('active', true);
		} else if (request == "stop") {
			clearInterval(inter);
			localStorage.setItem('active', false);
		}
	});
}

document.querySelector('head').innerHTML += "<title>Konferencja Ipfon</title>";
chrome.storage.local.get(['data'], main);
