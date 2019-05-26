##Javascript app to plot hsr's gtfs-rt feed onto google maps
This program takes lat,lng for a bus and plots it on the map.
Arrows are drawn using the Bearing, and routes are plotted using the ShapeCoords array.

###Vehicles.pb and Shapes.txt
The ajax call expects an array of buses from the Vehicles.pb. Each bus entry has an additional array of shapes for the particular bus by routeid from the gtfs feed's shapes.txt file.

##buses[]
###per bus entry
RouteId, RouteName, RouteCode, LatLng, Bearing and a array of ShapeCoords[]

LICENSE: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International


