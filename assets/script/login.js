$().ready(function () {

var config = {
    apiKey: "AIzaSyCx9GQGn_22IG4QD1DXxj5zTzy8Us9vf7U",
    authDomain: "medchecker-9cdb7.firebaseapp.com",
    databaseURL: "https://medchecker-9cdb7.firebaseio.com",
    projectId: "medchecker-9cdb7",
    storageBucket: "medchecker-9cdb7.appspot.com",
    messagingSenderId: "139582095985"
  };
  firebase.initializeApp(config);
  var database = firebase.database();

// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: 'https://dogrock2.github.io/temp/checker.html',
    signInOptions: [
      
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>'
  };
///////////////////////////////////////////////////////////////////////////////////////////
  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);

  initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var providerData = user.providerData;
        user.getIdToken().then(function(accessToken) {
          document.getElementById('sign-in-status').textContent = 'Signed in';
          document.getElementById('sign-in').textContent = 'Sign out';
          document.getElementById('account-details').textContent = JSON.stringify({
            displayName: displayName,
            email: email,
            emailVerified: emailVerified,
            phoneNumber: phoneNumber,
            photoURL: photoURL,
            uid: uid,
            accessToken: accessToken,
            providerData: providerData
          }, null, '  ');
        });
      } else {
        // User is signed out.
        document.getElementById('sign-in-status').textContent = 'Signed out';
        document.getElementById('sign-in').textContent = 'Sign in';
        document.getElementById('account-details').textContent = 'null';
      }
    }, function(error) {
      console.log('Error: '+error);
    });
  };

  window.addEventListener('load', function() {
    initApp();
  });
  //////////////////////////////////////////////////////////////////////////////////////////*/


});