let events = [];

window.onload = async function() {
	await fetch(`/api/get-team-meetings?id=${new URLSearchParams(window.location.search).get('id')}`, {
		method: 'GET'
	})
	.then(response => response.json())
	.then(data => {
		events = data
		// Call the showCalendar function initially to display the calendar
		showCalendar(currentMonth, currentYear);
	})
}

let eventDateInput =
	document.getElementById("eventDate");
let eventTitleInput =
	document.getElementById("eventTitle");
let eventDescriptionInput =
	document.getElementById("eventDescription");
let reminderList =
	document.getElementById("reminderList");

let eventIdCounter = 1;

function addEvent() {
	let date = eventDateInput.value;
	let title = eventTitleInput.value;
	let description = eventDescriptionInput.value;

	if (date && title) {
		// Create a unique event ID
		let eventId = eventIdCounter++;

		events.push(
			{
				MeetingDate: date,
				Title: title,
				Description: description
			}
		);
		fetch('/api/add-team-meeting', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title: title, description: description, date: date, channelID: new URLSearchParams(window.location.search).get('id') })
		}).then(response => {
			if (response.status == 200) {
				window.location.href=`/teamcalendar?id=${new URLSearchParams(window.location.search).get('id')}`
			}
		})

		showCalendar(currentMonth, currentYear);
		eventDateInput.value = "";
		eventTitleInput.value = "";
		eventDescriptionInput.value = "";
		displayReminders();
	}
}

// Function to delete an event by ID
function deleteEvent(eventId) {
	// Find the index of the event with the given ID
	let eventIndex =
		events.findIndex((event) =>
			event.id === eventId);

	if (eventIndex !== -1) {
		// Remove the event from the events array
		events.splice(eventIndex, 1);
		showCalendar(currentMonth, currentYear);
		displayReminders();
	}
	console.log(eventId)
	fetch('/api/remove-team-meeting', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ meetingID: eventId, channelID: new URLSearchParams(window.location.search).get('id') })
	}).then(response => {
		if (response.status == 200) {
			window.location.href=`/teamcalendar?id=${new URLSearchParams(window.location.search).get('id')}`
		}
	})
}

// Function to display reminders
function displayReminders() {
	reminderList.innerHTML = "";
	for (let i = 0; i < events.length; i++) {
		let event = events[i];
		let eventDate = new Date(event.MeetingDate);
		if (eventDate.getMonth() ===
			currentMonth &&
			eventDate.getFullYear() ===
			currentYear) {
			let listItem = document.createElement("li");
			listItem.innerHTML =
				`<strong>${event.Title}</strong> -
			${event.Description} on
			${eventDate.toLocaleString()}`;

			// Add a delete button for each reminder item
			let deleteButton =
				document.createElement("button");
			deleteButton.className = "delete-event";
			deleteButton.textContent = "Delete";
			deleteButton.onclick = function () {
				deleteEvent(event.MeetingID);
			};

			listItem.appendChild(deleteButton);
			reminderList.appendChild(listItem);
		}
	}
}

// Function to generate a range of
// years for the year select input
function generate_year_range(start, end) {
	let years = "";
	for (let year = start; year <= end; year++) {
		years += "<option value='" +
			year + "'>" + year + "</option>";
	}
	return years;
}

// Initialize date-related letiables
today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
selectYear = document.getElementById("year");
selectMonth = document.getElementById("month");

createYear = generate_year_range(1970, 2050);

document.getElementById("year").innerHTML = createYear;

let calendar = document.getElementById("calendar");

let months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
let days = [
	"Sun", "Mon", "Tue", "Wed",
	"Thu", "Fri", "Sat"];

$dataHead = "<tr>";
for (dhead in days) {
	$dataHead += "<th data-days='" +
		days[dhead] + "'>" +
		days[dhead] + "</th>";
}
$dataHead += "</tr>";

document.getElementById("thead-month").innerHTML = $dataHead;

monthAndYear =
	document.getElementById("monthAndYear");
//showCalendar(currentMonth, currentYear);

// Function to navigate to the next month
function next() {
	currentYear = currentMonth === 11 ?
		currentYear + 1 : currentYear;
	currentMonth = (currentMonth + 1) % 12;
	showCalendar(currentMonth, currentYear);
}

// Function to navigate to the previous month
function previous() {
	currentYear = currentMonth === 0 ?
		currentYear - 1 : currentYear;
	currentMonth = currentMonth === 0 ?
		11 : currentMonth - 1;
	showCalendar(currentMonth, currentYear);
}

// Function to jump to a specific month and year
function jump() {
	currentYear = parseInt(selectYear.value);
	currentMonth = parseInt(selectMonth.value);
	showCalendar(currentMonth, currentYear);
}

// Function to display the calendar
function showCalendar(month, year) {
	console.log(events)
	let firstDay = new Date(year, month, 1).getDay();
	tbl = document.getElementById("calendar-body");
	tbl.innerHTML = "";
	monthAndYear.innerHTML = months[month] + " " + year;
	selectYear.value = year;
	selectMonth.value = month;

	let date = 1;
	for (let i = 0; i < 6; i++) {
		let row = document.createElement("tr");
		for (let j = 0; j < 7; j++) {
			if (i === 0 && j < firstDay) {
				cell = document.createElement("td");
				cellText = document.createTextNode("");
				cell.appendChild(cellText);
				row.appendChild(cell);
			} else if (date > daysInMonth(month, year)) {
				break;
			} else {
				cell = document.createElement("td");
				cell.setAttribute("data-date", date);
				cell.setAttribute("data-month", month + 1);
				cell.setAttribute("data-year", year);
				cell.setAttribute("data-month_name", months[month]);
				cell.className = "date-picker";
				cell.innerHTML = "<span>" + date + "</span";

				if (
					date === today.getDate() &&
					year === today.getFullYear() &&
					month === today.getMonth()
				) {
					cell.className = "date-picker selected";
				}

				// Check if there are events on this date
				if (hasEventOnDate(date, month, year)) {
					cell.classList.add("event-marker");
					cell.appendChild(
						createEventTooltip(date, month, year)
				);
				}

				row.appendChild(cell);
				date++;
			}
		}
		tbl.appendChild(row);
	}

	displayReminders();
}

// Function to create an event tooltip
function createEventTooltip(date, month, year) {
	let tooltip = document.createElement("div");
	tooltip.className = "event-tooltip";
	let eventsOnDate = getEventsOnDate(date, month, year);
	for (let i = 0; i < eventsOnDate.length; i++) {
		let event = eventsOnDate[i];
		let eventDate = new Date(event.MeetingDate);
		let eventText = `<strong>${event.Title}</strong> -
			${event.Description} on
			${eventDate.toLocaleString()}`;
		let eventElement = document.createElement("p");
		eventElement.innerHTML = eventText;
		tooltip.appendChild(eventElement);
	}
	return tooltip;
}

// Function to get events on a specific date
function getEventsOnDate(date, month, year) {
	return events.filter(function (event) {
		let eventDate = new Date(event.MeetingDate);
		return (
			eventDate.getDate() === date &&
			eventDate.getMonth() === month &&
			eventDate.getFullYear() === year
		);
	});
}

// Function to check if there are events on a specific date
function hasEventOnDate(date, month, year) {
	return getEventsOnDate(date, month, year).length > 0;
}

// Function to get the number of days in a month
function daysInMonth(iMonth, iYear) {
	return 32 - new Date(iYear, iMonth, 32).getDate();
}
