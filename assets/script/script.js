$().ready(function () {

    var searchItem;
    var name;
    var info;
    var interactions;
    var medIds = [];
    var combos = [];
    var loggedId = '';
    var medsPersonalList = [];

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

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            $('#logInOut').text('Logout');
            setVarList();
            setAddMeds();
        } else {
            $('#logInOut').text('Login');
            $('#medsAddDiv').empty();
        }
    });

    function setVarList() {

        database.ref('users').child(firebase.auth().currentUser.uid).on('child_added', function (snapshot) {
            var medsResult = JSON.stringify(snapshot);
            var mod2 = medsResult.split(':', 2);
            var medsResultMod = mod2[1].slice(1, mod2[1].length - 2);

            $('#resultsMedsList').append('<div class="addMedsOuput mb-1">' + medsResultMod.toUpperCase() + '</div>');
            medsPersonalList.push(medsResultMod);
        })

        database.ref('users').child(firebase.auth().currentUser.uid).on('child_removed', function (snap) {
            var medsResult = JSON.stringify(snap);
            var mod2 = medsResult.split(':', 2);
            var medsResultMod = mod2[1].slice(1, mod2[1].length - 2).toUpperCase();

            $('#resultsMedsList').children().each(function () {                
                if(medsResultMod === $(this).text()) 
                   this.remove();
            });
            
        });
    } //ends function


    var setAddMeds = function () {

        var adderCont = $('<div>');
        var adderInp = $('<input id="addMedsInput" placeholder="Add your Meds">');
        adderInp.addClass('form-control mt-3 ml-3');
        var adderBtn = $('<button id="addMedsBtn">');
        adderBtn.addClass('btn btn-primary mt-3 ml-3');
        adderBtn.text('Add');
        var delBtn = $('<button id="delMedsBtn">');
        delBtn.addClass('btn btn-primary mt-3 ml-3');
        delBtn.text('Delete');

        adderCont.append(adderInp);
        adderCont.append(adderBtn);
        adderCont.append(delBtn);

        $('#medsAddDiv').append(adderCont);
    };

    $('#medsAddDiv').on('click', '#addMedsBtn', function () {

        var medsIn = $('#addMedsInput').val().trim().toUpperCase();
        if (medsIn) {
            var currentUser = firebase.auth().currentUser;
            var ref = database.ref('users').child(currentUser.uid);
            ref.push({
                meds: medsIn
            });
            $('#addMedsInput').val('');
        } //ends if    
    });


    $('#medsAddDiv').on('click', '#delMedsBtn', function () { //delelete button
        
        var medsIn = $('#addMedsInput').val();
        var currentUser = firebase.auth().currentUser;

        database.ref("/users/").child(currentUser.uid).orderByChild('meds')
            .equalTo(medsIn).once('value', function (snap) {

                var str = JSON.stringify(snap.val());
                var str2 = str.split(':', 1);
                var selectedParent = str2[0].slice(2, str2[0].length - 1);
                
                database.ref("/users/" + currentUser.uid + "/" + selectedParent).update({
                    meds: null
                });
            });

    }); //ends click delete btn

    $('#resultsMedsList').on('click', '.addMedsOuput', function () {
        $('#addMedsInput').val($(this).text());
    });

    $('#logInOut').on('click', function () {
        if ($(this).text() === 'Logout')
            firebase.auth().signOut();
    });

    $('#searchBtn').on('click', function () {
        setPersonalListID();
        searchItem = $('#searchTerm').val().trim();
        $('#searchTerm').val('');
        $('#resultsDiv').empty();
    });

    $('#clrBtn').on('click', function () {
        $('#resultsMedsList').empty();
        $('#resultsDiv').empty();
    });

    function setPersonalListID() {
        var cnt = 0;
        var len = medsPersonalList.length;
        var runner = setInterval(function () {

            if (cnt < len) {
                getPersonalListID(medsPersonalList[cnt]);
                cnt++;
            } else {
                clearInterval(runner);
                getRxID(searchItem);
            }
        }, 500);

    } //ends setPers Function

    function getPersonalListID(medName) {

        var rxCUI = "https://rxnav.nlm.nih.gov/REST/rxcui?name=" + medName;

        $.ajax({
            url: rxCUI,
            method: "GET",
            success: function (response) {
                idRx = $(response).find('rxnormId').text();
                if (idRx) {
                    medIds.push(idRx);
                } //ends if
            } //ends success
        }); //ends ajax

    } //ends function

    function getRxID(medName) {

        var rxCUI = "https://rxnav.nlm.nih.gov/REST/rxcui?name=" + medName;

        $.ajax({
            url: rxCUI,
            method: "GET",
            success: function (response) {
                idRx = $(response).find('rxnormId').text();
                if (idRx) {
                    $('#resultsMedsList').append('<div>' + medName.toUpperCase() + '</div>');
                    medIds.push(idRx);
                    combos = [];
                    if (medIds.length === 1)
                        getInteractions(idRx);
                    else {
                        for (var x = 0; x < medIds.length; x++)
                            for (var y = x + 1; y < medIds.length; y++)
                                combos.push([medIds[y], medIds[x]]);
                        setInteractions();
                    }
                } else
                    $('#resultsDiv').prepend('<h3>No results</h3>');
            } //ends success
        });
    } //ends getRxID

    function setInteractions() {
        $('#resultsDiv').empty();
        var cnt = 0;
        var len = combos.length;

        var runner = setInterval(function () {

            if (cnt < len) {
                getInteractions(combos[cnt][0] + '+' + combos[cnt][1]);
                cnt++;
            } else {
                clearInterval(runner);
            }
        }, 1000);
    } //ends setInterval

    function getInteractions(medId) {

        var queryURL = "https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=" + medId;

        $.ajax({
            url: queryURL,
            method: "GET",
        }).done(function (response) {
            if (response.fullInteractionTypeGroup) {

                var snapshot = Defiant.getSnapshot(response);
                var theName = JSON.search(snapshot, '//name');

                info = JSON.search(snapshot, '//comment');
                interactions = JSON.search(snapshot, '//description');
                name = theName.toString().split(',', 2);
                displayResult();

            } else {
                interactions = '';
                info = '';
                name = searchItem;                
            }
        }); //ends done
    }

    function displayResult() {

        var contDiv = $('<div>');

        contDiv.css('border', '1px solid #dcdcdc');
        contDiv.addClass('m-2 p-2 rounded');
        contDiv.append('<h2>' + name + '</h2>');

        if (info)
            contDiv.append('<span class="text-warning">' + info + '</span><br>');
        if (interactions) {
            contDiv.append('<span class="text-danger">' + interactions + '</span>');
        } else {
            contDiv.append('<span class="text-primary">No interactions found.</span>');
        }
        $('#resultsDiv').prepend(contDiv);

    } //ends display Result
}); //ends ready