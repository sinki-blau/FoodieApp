$Google_Key= "AIzaSyDBRx0crV33B-rLPoQr7SkYl4_ZrUOZzig";
$f2_ClientId = "4XKA2PLILWD4ULNRJ1NZJPLVEKSML4K3WXJ1GOU3VZYEK1ZY";
$f2_ClientSecret = "1VTUYCJABW34GPVJMKYQDAFRCKWOBEDAPNYJPFJ4UN2HTKCD";
$service_url="https://api.foursquare.com/v2/venues/search";

var thisRest ;
var restaurants;
var lat;
var lon;
var map;

//Event to Locate User
$(document).on("click","#locate",function() {
    //Prevent the usual navigation behaviour
    event.preventDefault();
    //Get User Location
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key="+$Google_Key,function(result){
        //console.log('1:'+result.location.lat + result.location.lng);
        lat = result.location.lat
        lon = result.location.lng 
        //console.log('2:'+lat,lon);
        PopulateList(lat,lon);
    });
});

//Events to Navigate to details
$(document).on("pagebeforeshow","#home",function() {
    $(document).on("click","#to_details",function(e) {
        //Stop more events
        e.preventDefault();
        e.stopImmediatePropagation();
       console.log(e);
        //Store the current item in the list
        thisRest = restaurants[e.target.children[0].id];
        
        //console.log(thisRest);
        //Change to the new page
        $.mobile.changePage("#details");

    });
});

//Event to Populate UI of Details
$(document).on("pagebeforeshow","#details",function(e) {
    e.preventDefault();  
    var rest = thisRest
    //Get Icon
    console.log(rest.categories[0].icon.prefix);
    $('#restIcon').attr('src',rest.categories[0].icon.prefix+'bg_32.png');
    //Rest of data
    $('#restName').text(rest.name);
    $('#restCatName').text('Type: '+rest.categories[0].name);
    $('#restDist').text('Distance: '+rest.location.distance+'m');
    $('#restAdd').text('Address: '+rest.location.formattedAddress);
        
});

//Event to Navigate to Map
$(document).on("click","#btn-map",function() {
    //Prevent the usual navigation behaviour
    event.preventDefault();
    //Change to the new page
    $.mobile.changePage("#map");
});

//Event to Populate UI of Map
$(document).on("pagebeforeshow","#map",function() {
    AddMap(lat,lon);

})

//Event to add points
$(document).on("click","#btn-loc",function() {
    AddCurrentLocation(lat,lon,map);
    AddPoints(restaurants,map);
});

//Event to remove Map
$(document).on("click","#btn-back",function() {
    map.remove();    
    //Change to the new page
    $.mobile.changePage("#home");

});

//Populate the data from service to the UI
function PopulateList(lat, lon) {
    $.getJSON($service_url+"?ll="+lat+","+lon+"&client_id="+$f2_ClientId+"&client_secret="+$f2_ClientSecret+"&radius=5000"+"&categoryId=4d4b7105d754a06374d81259"+"&v=20180108",function(data){
        // console.log(data);
        // console.log(data.response.venues);
        restaurants = data.response.venues;

        //sort distance
        restaurants.sort(function(a, b){
            return a.location.distance-b.location.distance
        })
                
        //Remove Previous ones
        $('#food_list li').remove();
        //Add new restaurants to the listview
        $.each(restaurants, function (index, restaurant) {
            $('#food_list').append('<li><a id="to_details" href="#">'+restaurant.name+'<span id="'+index+'" class="ui-li-count">'+restaurant.location.distance+'m</span></a></li>');
        });

        //Refresh list
        $('#food_list').listview('refresh');
        
       return restaurants;
    });
};

//Add blank map
function AddMap(lat,lon) {
      
    map = L.map('mapId').fitWorld();
    //map = L.map('mapId').setView([lat, lon], 13);;
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 22,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic2lua2ljb2RlIiwiYSI6ImNqb3ljbHVzbTF0MWIzcXMzbm5tOG1sd2EifQ._fD67a8bK7Xfw7w6lgc18g'
    }).addTo(map);
    
    window.setTimeout(function() { 
        map.invalidateSize();
    }, 1000);    
    

    
};

//add current Location
function AddCurrentLocation(lat,lon,map) {
    L.marker([lat,lon]).addTo(map).bindPopup("<b>You are here!</b>").openPopup();
    map.setView([lat,lon], 13)
};

//Add Points
function AddPoints(restaurants,map){
    for (i=0; i<restaurants.length; i++){
            L.marker([restaurants[i].location.labeledLatLngs[0].lat, restaurants[i].location.labeledLatLngs[0].lng],{opacity:0.8}).addTo(map);
        }

};