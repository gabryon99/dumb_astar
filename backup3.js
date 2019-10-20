class GridTile {

    /**
     * Instatiate a grid tile object
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {*} center 
     * @param {boolean} walkable 
     */
    constructor(x, y, width, height, center, walkable) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.center = center;
        this.walkable = walkable;
    }

}

class Grid {

    constructor(width, height, canvas, color, fill_color, line_width) {
        
        // set canvas context reference
        this.context = canvas.getContext("2d");

        // compute tile size
        this.tile_size = Math.floor(canvas.clientHeight / height);

        // set width and height grid
        this.width = width * this.tile_size;
        this.height = height * this.tile_size;

        this.width_count = width;
        this.height_count = height;

        // set styles
        this.color = color;
        this.fill_color = fill_color;
        this.line_width = line_width;

      
        // initialize tiles matrix
        this.tiles = [];
    }

    /**
     * Calculate tiles inside grid with the right dimensions
     * and push them inside this.tiles 
     */ 
    compute_tiles() {

        // calculate tiles starting from tile_size, width, height
        for (let i = 0; i < this.width_count; i++) {

            this.tiles[i] = [];
            
            for (let j = 0; j < this.height_count; j++) {

                // create new tile with right coordinates
                let new_tile = new GridTile(i, j, this.tile_size, this.tile_size, {
                    x: this.tile_size / 2 * (j + 1),
                    y: this.tile_size / 2 * (i + 1)
                }, true);          
                // add tile inside matrix[i, j]
                this.tiles[i].push(new_tile);            
            }
        }

    }

    /**
     * Draw grid and tiles. If the tiles are empty then don't draw them.
     */
    draw() {

        // draw grid borders
        this.context.beginPath();
        this.context.strokeStyle = this.color;
        // set grid dimension and coordinates
        this.context.rect(0, 0, this.width, this.height);
        this.context.stroke();

        // if there aren't any tiles then don't draw them
        if (this.tiles.length == 0) {
            console.info(`Grid.draw() => there aren't any tiles, do you have execute 'compute_tiles()' first?`);
            return;
        }

        this.context.beginPath();
        this.context.fillStyle = this.fill_color;
        this.context.strokeStyle = this.color;

        this.tiles.forEach((tiles, i) => {
            tiles.forEach((tile, j) => {
                // draw borders
                this.context.rect(tile.x * tile.w, tile.y * tile.h, tile.w, tile.h);
                // fill rect
                this.context.fillRect(tile.x * tile.w, tile.y * tile.h, tile.w, tile.h);
                this.context.stroke();
            });
        })

    }

    color_tile(x, y, color, border_color) {

        let tile = this.tiles[x][y];
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.strokeStyle = this.color;
        this.context.rect(tile.x * tile.w, tile.y * tile.h, tile.w, tile.h);
        this.context.fillRect(tile.x * tile.w, tile.y * tile.h, tile.w, tile.h);
        this.context.stroke();
    }

}

class PathNode {

    constructor(x, y, walkable, parent = null) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = parent;
    }

    get_name() {
        return `node${this.x}${this.y}`;
    }

    get_coordinates() {
        return [this.x, this.y];
    }
}

class PathFinder {

    /**
     * 
     * @param {Grid} grid 
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * If the heuristic function of A* is 0 then only the cost is evaluated
     * @callback heuristic     
     * @param {PathNode} n 
     * @param {PathNode} v 
     * @returns {number}
     */
    dijikstra(n, v) {
        return 0;
    }

    /**
     * Evaluate best path if the movements allowed are in 4 directions.
     * @callback heuristic     * 
     * @param {PathNode} n 
     * @param {PathNode} v 
     * @return {number} manatthan distance between n and v
     */
    manatthan_distance(n, v) {
        const dx = (v.x - n.x), dy = (v.y - n.y);
        return dx + dy;
    }

    /**
     * @callback heuristic
     * @param {PathNode} n 
     * @param {PathNode} v 
     * @returns {number}
     */
    euclidian_distance(n, v) {
        const dx = Math.pow(v.x - n.x, 2), dy = Math.pow(v. y - n.y, 2);
        return Math.sqrt(dx + dy);
    }

    /**
     * @deprecated
     * @callback heuristic
     * @param {PathNode} n 
     * @param {PathNode} v 
     * @returns {number}
     */
    euclidian_distance2(n, v) {
        // http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
        const dx = Math.pow(v.x - n.x, 2), dy = Math.pow(v. y - n.y, 2);
        return dx + dy;
    }


    /**
     * 
     * @param {PathNode[]} open_list 
     */
    poll_lowest_node(open_list) {

        let min_f = open_list[0].f;
        let returned_node = open_list[0];
        let index = 0;

        open_list.forEach((node, i) => {
            if (node.f < min_f) {
                min_f = node.f;
                returned_node = node;
                index = i;
            }
        });

        return [returned_node, index];
    }

    /**
     * 
     * @param {PathNode} u 
     * @param {number} offset_x 
     * @param {number} offset_y 
     * @param {PathNode[]} pool_nodes
     * @return {PathNode}
     */
    create_adjacent_node(u, offset_x, offset_y, pool_nodes) {

        const x = u.x + offset_x;
        const y = u.y + offset_y;

        if (x < 0 || y < 0) return null;
        if (x >= this.grid.width_count) return null;
        if (y >= this.grid.height_count) return null;

        if (!this.grid.tiles[x][y].walkable) {
            return null;
        }

        // check if nodes exists indside the pool
        // using the coordinates of node and return it
        let adj_node = new PathNode(x, y, this.grid.tiles[x][y].walkable);
  
        return adj_node;
    }


    is_in_open_list(j, open_list) {

        let open_array = [];
        let open_list_copy = Object.assign(open_list);
        
        while (open_list_copy.length) {
            open_array.push(open_list_copy.pop());
        }

        return open_array.find(e => e.x == j.x && e.y == j.y);

    }

    /**
     * Find path using A* using an heuristic function
     * @param {number[]} start 
     * @param {number[]} end 
     * @param {heuristic} h the heuristic function
     * @param {boolean} only_four only 4 axis?
     */
    find_path(start, end, h, only_four) {


        // set the open list as a priority queue
        // and use a comparsion function 
        // that evaluates the f value of a path node
        let open_list = new TinyQueue([], (u, v) => {
            return u.f - v.f;
        });
        // declare a closed list as dictonary
        let closed_list = {};

        // declare start and end node
        const start_node = new PathNode(start[0], start[1], this.grid.tiles[start[0]][start[1]].walkable);
        const end_node = new PathNode(end[0], end[1], this.grid.tiles[end[0]][end[1]].walkable);

        // create all path nodes
        const pool_nodes = [start_node, end_node];

        // Create path 
        let final_path = [];
        // Push the first node inside open list
        open_list.push(start_node);

        // while openList is
        while (open_list.length > 0) {

            // pop the lowest f node from priority queue
            const u = open_list.pop();
            const array = [];
            const copy = Object.assign(open_list);

            while (copy.length) array.push(copy.pop());
            console.log(array);
            
            closed_list[u.get_name()] = u;
            final_path.push(u);

            // do i have reached the final node?
            if (u.x == end_node.x && u.y == end_node.y) break;

            let adjacent_nodes = [
                this.create_adjacent_node(u, -1, -1, pool_nodes),
                this.create_adjacent_node(u,  0, -1, pool_nodes),
                this.create_adjacent_node(u, +1, -1, pool_nodes),
                this.create_adjacent_node(u, -1,  0, pool_nodes),
                this.create_adjacent_node(u, +1,  0, pool_nodes),
                this.create_adjacent_node(u, -1, +1, pool_nodes),
                this.create_adjacent_node(u,  0, +1, pool_nodes),
                this.create_adjacent_node(u, +1, +1, pool_nodes)
            ];

            // remove null nodes inside adjacents list
            adjacent_nodes = adjacent_nodes.filter((n) => n != null);
            
            for (let index = 0; index < adjacent_nodes.length; index++) {

                let j = adjacent_nodes[index];
                if (j.get_name() in closed_list) continue;

                j.g = u.g + 1;
                j.h = h(j, end_node);
                j.f = j.g + j.h;

                let ex_j = this.is_in_open_list(j, open_list);
                console.log(j, ex_j);

                if (ex_j != null && j.g > ex_j.g) {
                    continue;
                }

                console.log("Added!");
                open_list.push(j);  

            }
        
        }

        return final_path;
    }


}

let execute = () => {};

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById("playground");
    const context = canvas.getContext("2d");

    const width = 5;
    const height = 5;
    const tile_color = "#121212";
    const border_color = "#363636";

    document.getElementById("startPosition").value = `1, 1`;
    document.getElementById("endPosition").value = `${width}, ${height}`

    let grid = new Grid(width, height, canvas, border_color, tile_color, "2");
    grid.compute_tiles();
    grid.draw();
    
    canvas.addEventListener("click", (e) => {
        
        let offset_x = e.offsetX, offset_y = e.offsetY;
        let indicies = [];

        // find coordinates inside matrix
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (offset_x >= grid.tile_size * x && offset_x <= grid.tile_size * ( x + 1) &&
                    offset_y >= grid.tile_size * y && offset_y <= grid.tile_size * ( y + 1)) {
                    indicies = [x, y];
                    break;
                }
            }
        }

        if (indicies.length == 0) return;

        let tile = grid.tiles[indicies[0]][indicies[1]];

        if (!tile.walkable) {
            grid.color_tile(tile.x, tile.y, tile_color, border_color);
        }
        else {
            grid.color_tile(tile.x, tile.y, "red", border_color);
        }

        tile.walkable = !tile.walkable;

    }, false);

    execute = () => {

        const path_finder = new PathFinder(grid);

        const start_value = document.getElementById("startPosition").value;
        const end_value = document.getElementById("endPosition").value;

        const start = start_value.split(", ").map((splitted) => {
            return parseInt(splitted) - 1
        });

        const end = end_value.split(", ").map((splitted) => {
            return parseInt(splitted) - 1
        });

        const heuristic_name = document.getElementById("heuristic").value;
        let heuristic_chosen = () => {};

        if (heuristic_name == "euclide") {
            heuristic_chosen = path_finder.euclidian_distance;
        }
        else if (heuristic_chosen == "manatthan") {
            heuristic_chosen = path_finder.manatthan_distance;
        }
        else {
            heuristic_chosen = path_finder.dijikstra;
        }

        const four_axis = false;
        const path = path_finder.find_path(start, end, heuristic_chosen, false);
        console.log(path);

        path.forEach((node) => {
            grid.color_tile(node.x, node.y, "green", border_color);
        }); 
    };

});
