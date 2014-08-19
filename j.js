
window.onload = function(){
   gmapApp.init();
};

var gmapApp = {
   
   init: function(){
      this.loadGoogleMap();
      this.reqfeed();
   },
   map: {},

   loadGoogleMap: function(mapDiv){
      var w = window.innerWidth;
      var h = window.innerHeight;
      var mapDiv = document.getElementById("map");
      mapDiv.style.width = w + "px";
      mapDiv.style.height = h + "px";

      var options = {
	 center: new google.maps.LatLng(43.25, -79.87), //Hamilton
	 zoom: 13,
	 myTypeId: google.maps.MapTypeId.ROADMAP,
	 disableDefaultUI:true
      };
      this.map = new google.maps.Map(mapDiv, options);
   },

   nwlocobj: function(lat,lng){
      return new 
	 google.maps.LatLng(lat,lng);
   },

   nwmarkobj: function(locobj, title){
      return new 
	 google.maps.Marker({ 
	    position: locobj, title: title, 
	 icon: "bus.png", map: this.map });
   },

   nwinfwindowobj: function(title){
      return new 
	 google.maps.InfoWindow({ 
	    content:title });
   },

   nwpolylnobj: function(path){
      var aHead = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
      return new
	 google.maps.Polyline({ path: path, map: this.map,
	    icons: [{ icon: aHead, offset: '100%' }],
	    strokeWeight: 0.5 });
   },


   markers: [],
   addMarker: function(i, pos, title) {
      var marker = this.nwmarkobj(pos, title);
      this.markers[i] = marker;
    
      var that = this;
      var infowindow = this.nwinfwindowobj(title);
      google.maps.event.addListener(
	    marker, 
	    'click', 
	    function() {
	       infowindow.open(that.map, marker);
	    });
   },

   removeMarker: function(i){
      this.markers[i].setMap(null);
      //this.marker.splice(i, 1);
   },

   removeArrow: function(i){
      this.arrows[i].setMap(null);
   },

  
   b: [],  
   reqfeed: function(){
      var that = this;
      var req = new XMLHttpRequest();
      req.onreadystatechange = function(){
	 if ( req.readyState == 4 
	       && req.status == 200 ){
	    var resp = JSON.parse( req.responseText );
	    that.b = resp.Vehpos.VehPosArr;
	    console.log(that.b[0]);

	    that.clearmarkers();
	    that.loadbuslocations();
	    that.mvbuses();

	 }
      }
      req.open("GET", "/ajax", true);
      req.send();
   },

   clearmarkers: function(){
      var markersL = this.markers.length;
      for ( var i = 0; i < markersL; i++ ){
	 this.removeMarker(i);
      }
      this.markers = [];
   },

   cleararrows: function(){
      var arrowsL = this.arrows.length;
      for ( var i = 0; i < arrowsL; i++ ){
	 this.removeArrow(i);
      }
      this.arrows = [];
   },

   loadbuslocations: function(){
      var that = this;
      var busesL = this.b.length;
      var arrowsL = this.arrows.length;
      if ( arrowsL > 100 ) {
	 this.cleararrows();
      }
      console.log("bus count: " + busesL);
      for ( var i = 0; i < busesL; i++ ){
	 this.addbusmarker(i);
	 this.drawArrow(i);
	 this.addroute(i);
      }
      this.fillRoutesSelectEl();
   },

   mvbuses: function(){
      var that = this, markersL = this.markers.length, j = 0;
      (function loop(){
	 setTimeout(function(){
	    j++;
	    for( var i = 0; i < markersL; i++ ){ 
	       that.nxbusloc(i);
	    }
	    if (j < 25 ){ 
	       loop(i);
	    } else {
	       //do full reload now
	       that.feedreload();
	    }
	 }, 5000);
      })()
   },

   feedreload: function(){
      console.log("do full reload");
      this.reqfeed();
   },  

   addbusmarker: function(i){
      var loc = this.nwlocobj( 
	    this.b[i].Latitude, this.b[i].Longitude );
      var title = this.b[i].RouteCode 
	 + " " + this.b[i].RouteName;
      this.addMarker(i, loc, title);
   },
  
   arrows: [],
   
   drawArrow: function(i){
      var nwpos = ComputeLatLng(
	    this.b[i].Latitude,
	    this.b[i].Longitude,
	    this.b[i].Bearing,
	    0.3);
      var dArrowPts = [ this.nwlocobj( 
	    this.b[i].Latitude, this.b[i].Longitude),
	 this.nwlocobj( nwpos[0], nwpos[1]) ];

      this.arrows.push(this.nwpolylnobj(dArrowPts));

   },

   nxbusloc: function (i){
      var tmpmarker = this.markers[i];
      var nxloc = ComputeLatLng( 
	    this.b[i].Latitude,
	    this.b[i].Longitude,
	    this.b[i].Bearing,
	    0.01);
      this.b[i].Latitude = nxloc[0];
      this.b[i].Longitude = nxloc[1];
      //this.removeMarker(i);
      this.addbusmarker(i);
      tmpmarker.setMap(null);
   },

   routes : {},

   addroute: function(i){
      //console.log(i, " ", this.b[i].RouteName, " ", this.b[i].RouteId);
      this.routes[ this.b[i].RouteId ] = this.b[i].RouteCode 
	 + " " + this.b[i].RouteName;
   },

   selectEl : document.getElementById("selectRoute"),
   selecthtml : "", 

   fillRoutesSelectEl: function(){
      //console.log(this.routes);
      this.selecthtml = "<option value='route' disabled selected>select route</option>";

      for (var routeid in this.routes){
	 this.selecthtml += "<option id='" + routeid + "' value='" + routeid + "' >" + this.routes[routeid] + "</option>";
      }

      this.selecthtml += "</select>";
      this.selectEl.innerHTML = this.selecthtml;

      var that = this;
      this.selectEl.addEventListener("change", function(){
	 var routeid = this.value;
	 console.log("selected route: " + routeid);
	 var i = that.findShapes(routeid);
	 //console.log(i, " ", that.b[i].RouteName, " ", that.b[i].RouteId);
	 //console.log(that.b[i].ShapeCoords);
	 that.plotln( that.b[i].ShapeCoords );

      }, false );
   },

   findShapes: function(routeid){
      var busesL = this.b.length;
      for ( var i = 0; i < busesL; i++ ){
	 if ( this.b[i].RouteId == routeid ){
	    return i;
	 }
      }
   },

   routelncoords: [], routeln: new google.maps.Polyline(),

   plotln: function(shapecoords){
      this.routelncoords = [];
      this.routeln.setMap(null);
      for ( var idx in shapecoords){
	 this.routelncoords.push(
	       new google.maps.LatLng(
		  shapecoords[idx].ShapeLat,
		  shapecoords[idx].ShapeLon ) );
      }
      this.routeln = new google.maps.Polyline({
	 path: this.routelncoords, strokeWeight: 1,
	 strokeColor:"#FF0000", map: this.map });

      this.zoomtorouteln(this.routeln);

   },

   zoomtorouteln: function(routeln){
      var bounds = new google.maps.LatLngBounds();
      var points = routeln.getPath().getArray();
      var pointsL = points.length;
      for (var i = 0; i < pointsL; i++){
	 bounds.extend( points[i] );
      }
      this.map.fitBounds(bounds);
   }
   
};





function ComputeLatLng(vLatitude, vLongitude, vAngle, vDistance) {
   var vNewLatLng = [];
   vDistance = vDistance / 6371;
   vAngle = ToRad(vAngle);

   var vLat1 = ToRad(vLatitude);
   var vLng1 = ToRad(vLongitude);

   var vNewLat = Math.asin(Math.sin(vLat1) * Math.cos(vDistance) +
	 Math.cos(vLat1) * Math.sin(vDistance) * Math.cos(vAngle));

   var vNewLng = vLng1 + Math.atan2(Math.sin(vAngle) * Math.sin(vDistance) * Math.cos(vLat1),
	 Math.cos(vDistance) - Math.sin(vLat1) * Math.sin(vNewLat));

   if (isNaN(vNewLat) || isNaN(vNewLng)) {
      return null;
   }

   vNewLatLng[0] = ToDeg(vNewLat);
   vNewLatLng[1] = ToDeg(vNewLng);

   return vNewLatLng;
}

function ToRad(vInput) {
   return vInput * Math.PI / 180;
}


function ToDeg(vInput) {
   return vInput * 180 / Math.PI;
}

