# Dumb A* Algorithm

### Description and Use

This is an implementation (pretty stupid) of A* algorithm. It works on a grid where each tile has one distance unit between the its (eight) adjacent.

The functioning is very simple. I use an HTML Canvas to draw a grid of W x H tiles, where W is the width and H is the height of the grid.

With mouse you click a tile inside the grid so you place a wall. The walls is illustrated with a red tile. 
The start tile is illustrated with an orange color, the blue one indicates the goal tile.

You can click 'Find Path!' button to evaluates the best path inside the grid.

### Functionalities
* You can save the walls pattern you created by clicking 'Save Wall Pattern' button.
* You can load saved walls from local storage.
* You can remove saved walls from local storage.
* You can select three heuristic function: Manatthan, Euclide, Dijikstra.

### Dependencies
I use [Fast Priority Queue](https://www.npmjs.com/package/fastpriorityqueue) and [bulma toasts](https://www.npmjs.com/package/bulma-toast)