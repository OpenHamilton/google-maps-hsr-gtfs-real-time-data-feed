Javascript app to plot onto google maps hsr live data feed
optimized for desktops, tables and phones.
View the bus in their current gps position updated live every two mins.
View the bus routes currently available
Server side code not included.
Requires json data feed in the form of:

buses[]
an array of buses

each bus contains
RouteId, RouteName, RouteCode, LatLng, Bearing and a array of ShapeCoords[]
So this program takes latlng for each entry provided and plot a bus for it on the mape.
Arrows are drawn using the Bearing, and routes are plotted using the ShapeCoords array.


