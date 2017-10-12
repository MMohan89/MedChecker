
    var map;
    var infowindow;
    var lat = '';
    var lng = '';
    var criteria = 'pharmacy';
    var ids = [];
    var locat;
    var toZoom = 4;
    var var1 = 37.1;
    var var2 = -95.7;
    var LocName = '';
    var address = '';
    var phone = '';
	var rad = 1;
	var resultCnt = 0;

    $('.form-check-input').on('click',function(){
        if($(this).val() === 'option1')
          criteria = 'pharmacy';
        if($(this).val() === 'option2')
          criteria = 'doctor';
    });

    $('#searchZipBtn').on('click',function(){
		rad = 2500;
		resultCnt = 0;
        var city = $('#cityInput').val();
        var state = $('#stateInput').val();
        var addr = $('#addrInput').val();
        if(city && state && addr){
          getLatLng(addr, city, state);
          $('#msg').html('');
        } else {
          $('#msg').html('<h4>Please complete all fields.</h4>')     
        }
    });

    $('#clearMapBtn').on('click',function(){
      $('#msg').html('');
      $('#cityInput').val('');
      $('#stateInput').val('');
      $('#addrInput').val('');
      $('#resultsMap').empty();
	  rad = 0;
      var1 = 37.1;
      var2 = -95.7;
      toZoom = 4;
      initMap();
    });

  function searchAllIds() {

      var len = ids.length;
      var cnt = 0;
      var runner = setInterval(function () {

          if (cnt < len) {
              runGetByDetails(ids[cnt])
              cnt++;
          } else {
              clearInterval(runner);
          }
      }, 700);
  } //ends setInterval

function runGetByDetails(id) {
  
  var request = {
    placeId: id
  };

  var service = new google.maps.places.PlacesService(map);

  service.getDetails(request, function(place, status) {      
    if (status == google.maps.places.PlacesServiceStatus.OK) {      
      locName = place.name;      
      address = place.formatted_address;     
      phone = place.formatted_phone_number;      
      setResultsDiv();
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
      });
    }
  });
}//ends function

function setResultsDiv(){
  resultCnt++;
  var resDiv = $('<div>'); 
  $('#resultsMap').css('overflow-y','scroll');
  $('#resultsMap').css('height','60vh');
  resDiv.addClass('p-1 rounded mb-1');
  resDiv.css('border','1px solid #dcdcdc');
  resDiv.append('<span class="font-weight-bold bg-warning text-danger px-1 mr-1">'+resultCnt+'</span>');
  resDiv.append('<span class="font-weight-bold">'+locName+'</span><br>');
  resDiv.append('<span class="font-italic">'+address+'</span><br>');
  resDiv.append('<span class="text-primary font-weight-bold">'+phone+'</span>');

  $('#resultsMap').append(resDiv);

}//ends setResult
    

    function getLatLng(addr, city, state) {        
        
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+addr+",+"+city+",+"+state+"&key=AIzaSyAcNLiSdt_NSCFphZhktPVZZHUaoMkrs-g&";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).done(function (response) {
            var snapshot = Defiant.getSnapshot(response);
            var1 = parseFloat(JSON.search(snapshot, '//geometry//location//lat').toString().split(',', 1));
            var2 = parseFloat(JSON.search(snapshot, '//geometry//location//lng').toString().split(',', 1));
            toZoom = 15;
            initMap();
        });

    }//ends function

    function initMap() {
      var locat = {lat: var1, lng: var2};

      map = new google.maps.Map(document.getElementById('map'), {
        center: locat,
        zoom: toZoom
      });

      infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: locat,
        radius: rad,
        type: [criteria]
      }, callback);
    }

    function callback(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {	          		
          ids.push(results[i].place_id);
          createMarker(results[i]);
        }
        searchAllIds();
      }
    }

    function createMarker(place) {
      var placeLoc = place.geometry.location;
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
      });
    }