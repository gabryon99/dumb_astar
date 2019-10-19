/*
    const tile_size = Math.floor(canvas.clientHeight / height);

    const grid_info = {
        tile_size: tile_size,
        width: tile_size * width,
        height: tile_size * height,
        line_width: 4,
        color: "white",
        tiles: []
    };

    context.beginPath();

    // set grid color
    context.strokeStyle = grid_info.color;
    // set grid dimension and coordinates
    context.rect(0, 0, grid_info.width, grid_info.height);
    context.stroke();


    // draw tiles inside grid 
    context.beginPath();

    // draw tiles inside grid
    for (let i = 0; i < width; i++) {

        grid_info.tiles[i] = [];

        for (let j = 0; j < height; j++) {
            // set border color
            context.strokeStyle = grid_info.color;
            // set fill color
            context.fillStyle = "gray";
            // draw a tile
            context.rect(tile_size * i, tile_size * j, tile_size, tile_size);
            context.fillRect(tile_size * i, tile_size * j, tile_size, tile_size);

            let tile = {
                x: j,
                y: i,
                w: tile_size,
                h: tile_size,
                center: {
                    x: tile_size / 2 * (j + 1),
                    y: tile_size / 2 * (i + 1)
                }
            }
            grid_info.tiles[i].push(tile);
            context.stroke();
        }
    }

    
    let tile = grid_info.tiles[1][1];
    color_tile(tile, "red", context);

    console.log(tile);
*/

let tetraminoT = {
    matrix: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    x: 0,
    y: 0,
    color: "purple",
    previous: [],
    draw: () => {
        // draw tetramino
        // console.log(tetraminoT);

        for (let i = 0; i < tetraminoT.previous.length; i++) {
            // console.log(tetraminoT.previous[i].x, tetraminoT.previous[i].y);
            grid.color_tile(tetraminoT.previous[i].x, tetraminoT.previous[i].y, "#121212", "#363636");
        }

        tetraminoT.previous = [];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (tetraminoT.matrix[i][j] == 1) {
                    grid.color_tile(j + tetraminoT.x, i + tetraminoT.y, tetraminoT.color, "#363636");
                    tetraminoT.previous.push(grid.tiles[j + tetraminoT.x][i + tetraminoT.y]);
                }
            }
        }
    },
    rotate: () => {
        
    }
}

document.addEventListener("keypress", (e) => {
    if (e.key == "d" && tetraminoT.x <= 31) {
        tetraminoT.x++;
        tetraminoT.draw();
    }
    if (e.key == "a" && tetraminoT.x >= 0) {
        tetraminoT.x--;
        tetraminoT.draw();
    }
   
    
})

setInterval(() => {

    tetraminoT.draw();
    tetraminoT.y++;

}, 600);
