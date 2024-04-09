$ = function(id) {
  return document.getElementById(id);
}

var show = function(id) {
	$(id).style.display ='block';
}
var hide = function(id) {
	$(id).style.display ='none';
}

let dates = [];

function addDate() {
	let date = document.getElementById('addDate').value;
	dates.push(date);
	document.getElementById('addDate').value = "";
	displayDates();
}

function displayDates() {
    let list = document.querySelector('.showDates');
    for (i=0; i<dates.length; i++){
        let li = document.createElement('li');
        li.innerText = dates[i];
        list.appendChild(li);
    }
}