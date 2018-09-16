const TIME = 2000; //optymalny czas

function main(phonesResponse) {
	function parseDate(str) {
		let returnData = {
			day: '',
			start: {
				hour: '',
				minuts: ''
			},
			end: {
				hour: '',
				minuts: ''
			}
		};

		let i=0;
		for (i in str) {
			if(str[i] == ':') break;
			else returnData.day += str[i];
		}
		++i;
		for (i;str[i]!=='.';++i) {
			returnData.start.hour += str[i];
		}
		++i;
		for (i;str[i]!=='-';++i) {
			returnData.start.minuts += str[i];
		}
		++i;
		for (i;str[i]!=='.';++i) {
			returnData.end.hour += str[i];
		}
		++i;
		for (i;i<str.length;++i) {
			returnData.end.minuts += str[i];
		}
		return returnData;
	}
	
	let whenActive = '["' + phonesResponse.data.date + '"]',
		canBeActive = false;
	whenActive = JSON.parse(whenActive.replace(/\n/gm, '", "'));
	whenActive.forEach((el, i) => {
		if (!(/^\S{2}\:[0-9]{1,2}\.[0-9]{1,2}\-[0-9]{2}\.[0-9]{2}$/.test(el))) {
			alert('Invalid value for the "Active Times" field in extensions options, Error in ' + i+1 + ' line');
			return; // there should be a "continue" instruction but, this place isn't in the real loop
		}
		let days = ["nd", "pn", "wt", "śr", "czw", "pt", "s"],
			now = new Date();
		el = parseDate(el);

		if(days.indexOf(el.day) != -1) {
			if (el.day == days[now.getDay()] &&
				now.getHours() >= el.start.hour*1 &&
				now.getMinutes() >= el.start.minuts*1) canBeActive = true;
		}
	});
	if (!canBeActive) {
		console.log('It shouldn\'t do anything, not now');
		return;
	}
	console.log('It should do everthing what must');
	let inter;

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
			phoneBook = [["Miłosz Wiśniewski", "720755490"]];
		if (typeof(phonesResponse.data) !== "undefined" && /\S/.test(phonesResponse.data.phones)) {
			let newPhones = phonesResponse.data.phones;
			newPhones.match(/[0-9]{9}/gm).forEach(el => {
				newPhones  = newPhones.replace(el, '", "' + el);
			});
			newPhones = newPhones.replace(/\n/, "\"], [\"");
			newPhones = "[[\"" + newPhones + "\"]]";
			phoneBook = JSON.parse(newPhones);
		}

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
					content += `<tr><td> ${contact[0]} </td> <td><input class="invisible" style="visibility: hidden;" type="checkbox"></td> </tr>`;
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
				}
			}
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
		} else {
			console.log(reuest);
		}
	});

	document.querySelector('head').innerHTML += "<title>Konferencja Ipfon</title>";
}
chrome.storage.local.get(['data'], main);