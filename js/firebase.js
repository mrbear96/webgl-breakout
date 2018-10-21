var config = {
    apiKey: "AIzaSyDBTIa-gnm_tm_o9goIJiPx7KN3E4k6m_Q",
    authDomain: "breakoutdb.firebaseapp.com",
    databaseURL: "https://breakoutdb.firebaseio.com",
    projectId: "breakoutdb",
    storageBucket: "breakoutdb.appspot.com",
    messagingSenderId: "706112964936"
};

firebase.initializeApp(config);

function writeUserData(userId, score, date) {
    firebase.database().ref('Leaderboard/' + userId).set({
      Score : score,
      Date : date
    });
  } 

var provider = new firebase.auth.GoogleAuthProvider();
var user;
var token;

function login() {

if (!user){
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    token = result.credential.accessToken;
    // The signed-in user info.
    user = result.user;
    console.log(user);
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
}