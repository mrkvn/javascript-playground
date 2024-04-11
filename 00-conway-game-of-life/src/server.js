const express = require("express");
const app = express();
const server = app.listen(3002, function () {
    console.log("server is listening on port: 3002");
});
const io = require("socket.io")(server);

app.use(express.static("public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

let state = [];
function initState() {
    // console.log("initstate");
    const colNum = 120;
    const rowNum = 39; // 39
    for (let i = 0; i < rowNum; i++) {
        let row = [];
        for (let j = 0; j < colNum; j++) {
            let randNum = Math.floor(Math.random() * 100);
            let isLive = randNum <= 10 ? true : false;
            isLive ? row.push("x") : row.push("");
        }
        state.push(row);
    }
    // console.log("initState", state);
    // state = [
    //     ["", "", ""],
    //     ["x", "x", "x"],
    //     ["", "", ""],
    // ];
}
function neighborCount(prevRow, currRow, nextRow, index) {
    let count = 0;
    // upper left
    count += prevRow && prevRow[index - 1]?.length > 0 ? 1 : 0;

    // top
    count += prevRow && prevRow[index].length > 0 ? 1 : 0;

    // upper right
    count += prevRow && prevRow[index + 1]?.length > 0 ? 1 : 0;

    // left
    count += currRow[index - 1]?.length > 0 ? 1 : 0;

    // right
    count += currRow[index + 1]?.length > 0 ? 1 : 0;

    // lower left
    count += nextRow && nextRow[index - 1]?.length > 0 ? 1 : 0;

    // bottom
    count += nextRow && nextRow[index].length > 0 ? 1 : 0;

    // lower right
    count += nextRow && nextRow[index + 1]?.length > 0 ? 1 : 0;
    // console.log(count);
    return count;
}
function updateState() {
    if (state.length === 0) {
        initState();
        return state;
    }
    let prevState = state;
    let newState = [];
    for (let i = 0; i < prevState.length; i++) {
        let row = [];
        for (let j = 0; j < prevState[i].length; j++) {
            let prevRow = prevState[i - 1];
            let currRow = prevState[i];
            let nextRow = prevState[i + 1];
            let isLive = prevState[i][j].length > 0;
            // conway's game of life
            let count = neighborCount(prevRow, currRow, nextRow, j);
            // console.log(count)
            // Any live cell with fewer than two live neighbors dies, as if by underpopulation.
            if (isLive && count < 2) {
                row.push("");
            }
            // Any live cell with two or three live neighbors lives on to the next generation.
            else if (isLive && (count === 2 || count === 3)) {
                row.push("x");
            }
            // Any live cell with more than three live neighbors dies, as if by overpopulation.
            else if (isLive && count > 3) {
                row.push("");
            }
            // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
            else if (!isLive && count === 3) {
                row.push("x");
            } else {
                row.push("");
            }
        }
        newState.push(row);
        state = newState;
    }
    return state;
}

io.on("connection", function (socket) {
    state = [];
    console.log("connected");
    const tickTime = 300;
    setInterval(() => {
        let s = updateState();
        // console.log(s);
        socket.emit("update", { state: s });
    }, tickTime);
    socket.on("disconnect", function () {
        console.log("disconnected");
        state = [];
    });
});

app.get("/", function (req, res) {
    res.render("index");
});
