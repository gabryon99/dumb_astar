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

    clear_path() {
        
        for (let x = 0; x < this.width_count; x++) {
            for (let y = 0; y < this.height_count; y++) {
                if (this.tiles[x][y].walkable) {
                    this.color_tile(x, y, this.fill_color, this.color);
                }
            }
        }
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
        return open_list.find(e => e.x == j.x && e.y == j.y);
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
        let open_list = new PriorityQueue({
            comparator: (u, v) => u.f - v.f         
        })
        // declare a closed list as dictonary
        let closed_list = {};
        let copy_list = [];

        // declare start and end node
        const start_node = new PathNode(start[0], start[1], this.grid.tiles[start[0]][start[1]].walkable);
        const end_node = new PathNode(end[0], end[1], this.grid.tiles[end[0]][end[1]].walkable);

        // create all path nodes
        const pool_nodes = [start_node, end_node];

        // Create path 
        let final_path = [];
        // Push the first node inside open list
        open_list.queue(start_node);

        // while openList is
        while (open_list.length > 0) {

            // pop the lowest f node from priority queue
            const u = open_list.dequeue();
            copy_list = copy_list.filter((e) => e.x != u.x && e.y == u.y);

            closed_list[u.get_name()] = u;
            final_path.push(u);

            // do i have reached the final node?
            if (u.x == end_node.x && u.y == end_node.y) break;

            let adjacent_nodes = [];
            if (only_four) {
                adjacent_nodes = [
                    this.create_adjacent_node(u,  0, -1, pool_nodes),
                    this.create_adjacent_node(u, -1,  0, pool_nodes),
                    this.create_adjacent_node(u, +1,  0, pool_nodes),
                    this.create_adjacent_node(u,  0, +1, pool_nodes)
                ];
            }
            else {

                adjacent_nodes = [
                    this.create_adjacent_node(u, -1, -1, pool_nodes),
                    this.create_adjacent_node(u,  0, -1, pool_nodes),
                    this.create_adjacent_node(u, +1, -1, pool_nodes),
                    this.create_adjacent_node(u, -1,  0, pool_nodes),
                    this.create_adjacent_node(u, +1,  0, pool_nodes),
                    this.create_adjacent_node(u, -1, +1, pool_nodes),
                    this.create_adjacent_node(u,  0, +1, pool_nodes),
                    this.create_adjacent_node(u, +1, +1, pool_nodes)
                ];
            }
            // remove null nodes inside adjacents list
            adjacent_nodes = adjacent_nodes.filter((n) => n != null);
            
            for (let index = 0; index < adjacent_nodes.length; index++) {

                let j = adjacent_nodes[index];
                if (j.get_name() in closed_list) continue;

                j.g = u.g + 1;
                j.h = h(j, end_node);
                j.f = j.g + j.h;

                let ex_j = this.is_in_open_list(j, copy_list);
                if (ex_j != null && j.g > ex_j.g) continue;

                j.parent = u;

                open_list.queue(j);  
                copy_list.push(j);

            }
        
        }

        // check if end node is inside of path
        if (!(end_node.get_name() in closed_list)) return [];

        let pi_node = final_path[final_path.length - 1];
        let real_path = [];

        while (pi_node != null) {
            real_path.push(pi_node);
            pi_node = pi_node.parent;
        }

        return real_path.reverse();
    }


}

let execute = () => {};
let save_walls = () => {};
let load_walls = () => {};
let remove_walls = () => {};


document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById("playground");
    const context = canvas.getContext("2d");

    const width = 8;
    const height = 8;
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
            grid.color_tile(tile.x, tile.y, "#e53935", border_color);
        }

        tile.walkable = !tile.walkable;

    }, false);

    execute = () => {

        // clear path
        grid.clear_path();

        const path_finder = new PathFinder(grid);
        const four_axis = document.getElementById("four_axis").checked;

        const start_value = document.getElementById("startPosition").value;
        const end_value = document.getElementById("endPosition").value;

        const start = start_value.split(", ").map((splitted) => {
            return parseInt(splitted) - 1
        });

        const end = end_value.split(", ").map((splitted) => {
            return parseInt(splitted) - 1
        });

        console.log(`From ${start} to ${end}`);

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
        
        const path = path_finder.find_path(start, end, heuristic_chosen, four_axis);
        console.log(path);

        if (path.length == 0) {
            bulmaToast.toast({ 
                message: "No paths were found!",
                type: "is-danger",
                closeOnClick: true,
                pauseOnHover: true,
                animate: { in: "fadeIn", out: "fadeOut" }
             });
            return;
        }

        path.forEach((node) => grid.color_tile(node.x, node.y, "#43A047", border_color));
    
        // color start and end
        grid.color_tile(start[0], start[1], "#FB8C00", border_color);
        grid.color_tile(end[0], end[1], "#1E88E5", border_color);

    };

    remove_walls = () => {
        if (localStorage.getItem('wall_pattern') == undefined) {
            bulmaToast.toast({ 
                message: "There aren't walls saved into storage!",
                type: "is-danger",
                closeOnClick: true,
                pauseOnHover: true,
             });
            return;
        }
        localStorage.removeItem('wall_pattern');
    };

    save_walls = () => {

        // load tiles and coordinates
        const coordinates = grid.tiles.map((row) => row.filter((tile) => !tile.walkable)).filter(e => e.length > 0).flat().map((e) => [e.x, e.y]);
        const cookie = { walls: coordinates }

        // save walls in web storage
        localStorage.setItem('wall_pattern', JSON.stringify(cookie));

        bulmaToast.toast({ 
            message: "Walls pattern saved into storage!",
            type: "is-warning",
            closeOnClick: true,
            pauseOnHover: true,
         });

    };

    load_walls = () => {

        // load walls form web storage
        // {walls: [[x0, y0], [x1, y1], ..., [xn, yn]]}
        const walls = JSON.parse(localStorage.getItem('wall_pattern')).walls;

        // restore saved walls
        walls.forEach((coord) => {
            let tile = grid.tiles[coord[0]][coord[1]];
            // color tile and set walkable
            grid.color_tile(tile.x, tile.y, "#e53935", border_color);
            tile.walkable = false;
        });

        bulmaToast.toast({ 
            message: "Walls loaded from storage!",
            type: "is-primary",
            closeOnClick: true,
            pauseOnHover: true,
         });

    };

});
