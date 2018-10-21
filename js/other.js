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
btnLeaderboard.onclick = function() { modalLeaderboard.style.display ='block';}

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