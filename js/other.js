var modalAbout = document.getElementById('modalAbout');
var modalOptions = document.getElementById('modalOptions');
var modalLeaderboard = document.getElementById('modalLeaderboard');

// Get the button that opens the modal
var btnAbout = document.getElementById('aboutButton');
var btnOptions = document.getElementById('optionsButton')
var btnLeaderboard = document.getElementById('leaderboardButton');

// When the user clicks on the button, open the modal 
btnAbout.onclick = function(){ modalAbout.style.display = 'block'; }
btnOptions.onclick = function(){ modalOptions.style.display = 'block'; }
btnLeaderboard.onclick = function() { 
    modalLeaderboard.style.display ='block';
    deleteElementById('leaderboardTable');
    createLeaderboardTableHeader();
    createLeaderboardTableContent();
}

// When the user clicks anywhere outside of the modal, close it
document.onclick = function(event) {
    if (event.target == modalAbout) {
        modalAbout.style.display = "none";
    } else if (event.target == modalOptions){
        modalOptions.style.display = "none";
    } else if (event.target == modalLeaderboard){
        modalLeaderboard.style.display = "none";
    }
}

function dispSparksCnt( val ) { document.getElementById('htmlSparksCount').innerHTML = val; }
function onSetSparksCnt() { sparksCnt = document.getElementById('sparkscnt').value; }

function dispBallSpeedGain( val ) { document.getElementById('htmlBallSpeed').innerHTML = parseFloat(val).toFixed(1); }
function onSetBallSpeedGain() { ballSpeedGain = document.getElementById("ballSpeedSlider").value; }

function dispBallSpeed( val ) { document.getElementById('ball-speed').innerHTML = parseFloat(val).toFixed(2); }

function deleteElementById(id)
{
  if (document.contains(document.getElementById(id))) 
  document.getElementById(id).remove();
}

function getCurrentDate()
{
    var date = new Date();
    date.setUTCHours(3);
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

var table;
function createLeaderboardTableHeader()
{
    var t_names = ["#", "User" , "Score", "Date"];
    table = document.createElement('table');
    table.setAttribute('id','leaderboardTable');

    var tableHeaderEntry = document.createElement('tr');
    for (var i = 0; i < t_names.length; i++)
    {
        var tableCol = document.createElement('th');
        tableCol.appendChild(document.createTextNode(t_names[i]));
        tableHeaderEntry.appendChild(tableCol);
    }
    table.appendChild(tableHeaderEntry);
   
    modalLeaderboard.appendChild(table);
}

function createLeaderboardTableContent()
{
    firebase.database().ref('/Leaderboard/').orderByChild("/Score").once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            var tableIdx = 1;
           // console.log(key + "  " + childData.Score + " " + childData.Date);
            //console.log(snapshot);
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.innerHTML = tableIdx;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = key;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = childData.Score;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = childData.Date;
            tr.appendChild(td);
            table.insertBefore(tr, table.childNodes[1]);
            tableIdx++;
          });
          for (var i = 1; i < table.childNodes.length; i++)
          {
              table.childNodes[i].childNodes[0].innerHTML = i;
          }
      });
}

function initAccount()
{
    var userphoto = document.getElementById('loginButton');
    userphoto.style.background = 'url(' + user.photoURL + ')';
    userphoto.style.backgroundSize = 'cover';

    document.getElementById('userName').innerHTML = user.displayName;

    console.log(user);
}