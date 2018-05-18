var modalAbout = document.getElementById('modalAboutButton');
var modalOptions = document.getElementById('modalOptionsButton');

// Get the button that opens the modal
var btnAbout = document.getElementById('aboutButton');
var btnOptions = document.getElementById('optionsButton')


// When the user clicks on the button, open the modal 
btnAbout.onclick = function(){ modalAbout.style.display = "block"; }
btnOptions.onclick = function(){ modalOptions.style.display = "block"; }


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modalAbout) {
        modalAbout.style.display = "none";
    } else if (event.target == modalOptions){
        modalOptions.style.display = "none";
    }
}

