const boardLength = 20
let w;
let h;
let grid = new Array(boardLength);
let toVisit = [];
let visited = [];
let start;
let end
let path = [];
let foods = [];
function Node(x, y) {
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = null;
	this.wall = false;

	if (Math.random(1) < 0.3 && this.x > 0 && this.y > 0) {
        this.wall = true;
    }

    this.show = (color) => {
        fill(color);
		if(this.wall){
			fill(0);
		}
        noStroke();
        rect(this.x * w, this.y * h, w - 1, h - 1);
    };

    this.addNeighbors = (grid) => {
        if (this.x < boardLength - 1) {
            this.neighbors.push(grid[this.x + 1][this.y]);
        }

        if (this.x > 0) {
            this.neighbors.push(grid[this.x - 1][this.y]);
        }

        if (this.y < boardLength - 1) {
            this.neighbors.push(grid[this.x][this.y + 1]);
        }

        if (this.y > 0) {
            this.neighbors.push(grid[this.x][this.y - 1]);
        }

        if (this.x > 0 && this.y > 0) {
            this.neighbors.push(grid[this.x - 1][this.y - 1]);
        }

        if (this.x < boardLength - 1 && this.y > 0) {
            this.neighbors.push(grid[this.x + 1][this.y - 1]);
        }

        if (this.x > 0 && this.y < boardLength - 1) {
            this.neighbors.push(grid[this.x - 1][this.y + 1]);
        }

        if (this.x < boardLength - 1 && this.y < boardLength - 1) {
            this.neighbors.push(grid[this.x + 1][this.y + 1]);
        }
    }
}

function getLowestF(toVisit) {
    let lowest = 0;
    for (let i = 0; i < toVisit.length; i++) {
        if (toVisit[i].f < toVisit[lowest].f) {
            lowest = i;
        }
    }

    return lowest;
}

function removeElement(arr, element) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == element) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    //return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function showPath(current) {
	if(current.previous == undefined || current.previous == null){
		return [];
	}
    path = [];
    let aux = current;
    path.push(aux);
    while (aux.previous) {
        path.push(aux.previous);
        aux = aux.previous;
    }

    return path;
}

function getCloserDot(current, foods) {
    if (foods.length == 0) {
        return current;
    }

    let near = foods[0];
    foods.forEach(food => {
        if (heuristic(current, food) < heuristic(current, near)) {
            near = food;
        }
    });

    return near;
}

function generateFoods(grid, nFoods) {
    let foods = [];
    while (foods.length < Math.floor(nFoods)) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid.length; j++) {
                if (Math.random(1) < 0.001 && grid[i][j].x > 0 && grid[i][j].y > 0 && foods.length < nFoods) {
                    foods.push(grid[i][j]);
                }
            }
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            if (foods.includes(grid[i][j])) {
                grid[i][j].wall = false;
            }
        }
    }
    return foods;
}

function setup() {
    createCanvas(800, 800);
    background(0);
    frameRate(10);
    w = width / boardLength;
    h = height / boardLength;

    for (let i = 0; i < boardLength; i++) {
        grid[i] = new Array(boardLength);
    }

    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            grid[i][j] = new Node(i, j);

        }
    }

    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    start = grid[0][0];
	foods = generateFoods(grid, boardLength/2);
    end = getCloserDot(start, foods);
    toVisit.push(start);
}

function draw() {
    if (foods.length == 0) {
        noLoop();
    }

    if (foods.length > 0) {
        let lowest = getLowestF(toVisit);
        var current = toVisit[lowest];
        end = getCloserDot(end, foods);

        if(current == end){
            removeElement(foods, current);
        }

        removeElement(toVisit, current);
        visited.push(current);

        current.neighbors.forEach(neighbor => {
            if (!visited.includes(neighbor) && !neighbor.wall) {
                let g = current.g + 1;
                let newPath = false;

                if (!toVisit.includes(neighbor) && g > neighbor.g) {
                    neighbor.g = g;
                    toVisit.push(neighbor);
                    newPath = true;
                }

                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }
        });

    } else {
		console.log('sem caminho');
		noLoop();
		return;
	}

    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            grid[i][j].show(color(255));
        }
    }

    foods.forEach(food => {
        food.show(color(37, 204, 247));
    });

	visited.forEach(v => {
		v.show(color(254, 164, 127));
	});

    
	toVisit.forEach(v => {
		v.show(color(109, 33, 79));
	});    

    path = showPath(current);

    path.forEach(v => {
		v.show(color(59, 59, 152));
	});
}