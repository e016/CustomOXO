"use strict";

var game;

function isNil(x) {
  return x == null || typeof x == "undefined";
}

function Bridge() {
  this.width = document.getElementById("width");
  this.height = document.getElementById("height");
  this.times = document.getElementById("times");
  this.points = document.getElementById("points");
  this.c4 = document.getElementById("c4style");

  this.td = document.getElementById("td");
  this.rTurn = document.getElementById("rTurn");
  this.wild = document.getElementById("wild");

  this.noNokato = document.getElementById("noNokato");
  this.nokato = document.getElementById("nokato");
  this.pointC = document.getElementById("pointC");
  this.win = document.getElementById("win");
  this.turn = document.getElementById("turn");
  this.board = document.getElementById("board");
  this.attachControls();
}
Bridge.prototype.attachControls = function () {
  document.getElementById("makegame").onclick = () => this.game.init(true);
  document.getElementById("arrow").onclick = () => this.game.bridge.toggleOptions();
  [
    this.width,
    this.height,
    this.times,
    this.c4,
    this.points,
    this.td,
    this.wild,
    this.rTurn,
  ].forEach((elem) => elem.onchange = () => this.game.init());
  document.getElementById("preset").onchange = () => this.setPreset();
  document.getElementById("mode").onchange = () => this.setExtraMode();
  document.getElementById("import").onclick = () => this.game.importBoard(prompt('Board Code:'));
  document.getElementById("export").onclick = () => this.game.exportBoard();
}
Bridge.prototype.getSquare = function (x, y) {
  // accepts either xy coordinates or one parameter for an id
  if (y == null) { 
    return document.getElementById(x).innerHTML.trim();
  }
  return document.getElementById(`${x}_${y}`).innerHTML.trim();
};
Bridge.prototype.getSquareElement = function (id) {
    return document.getElementById(id);
};
Bridge.prototype.highlightSquare = function (id, color) {
  document.getElementById(id).style.color = "white";
  document.getElementById(id).style.backgroundColor = color;
  document.getElementById(id).style.borderColor = "white";
};
Bridge.prototype.setNokato = function (on) {
  this.nokato.checked = on;
  this.noNokato.style.display = on ? "none" : "";
  if (on) {
    this.td.checked = true;
  }
  this.game.setNokato(on);
};
Bridge.prototype.refreshDisplay = function () {
  this.win.innerHTML = ``;
  this.turn.style.display = "";
  this.turn.innerHTML = `turn: ${this.game.characters[this.game.turn]}</br>`;
  this.pointC.style.display = this.game.points ? "initial" : "none";

  if (this.game.isTie()) {
    if (this.game.points) {
      var sorted = this.game.playerPoints.slice().toSorted().toReversed();
      this.turn.style.display = "none";
      if (
        JSON.stringify(this.game.playerPoints.toSorted().toReversed()) ==
        JSON.stringify(sorted)
      ) {
        this.win.innerHTML = `Tie!`;
      }
      this.win.innerHTML = `${
        this.game.characters[this.game.playerPoints.indexOf(sorted[0])]
      } won! <br/>`;
    } else {
      if (this.game.win) {
        this.win.innerHTML = `${
          this.game.characters[this.game.turn]
        } won! <br/>`;
      } else {
        this.win.innerHTML = `Tie! <br/>`;
      }
    }
  } else {
    if (this.game.win && !this.game.points) {
      this.win.innerHTML = `${this.game.characters[this.game.turn]} won! <br/>`;
    }
  }
  if (this.game.points) {
    this.pointC.innerHTML = "";
    for (var p = 0; p < this.game.players; p++) {
      this.pointC.innerHTML += `
        ${this.game.characters[p]}: ${this.game.playerPoints[p]}<br/>
        
        `;
    }
  }
};
Bridge.prototype.setTileColors = function (blank) {
  document
    .getElementById("bParent")
    .style.setProperty(
      "--press-color",
      blank
        ? "rgb(200, 200, 200)"
        : this.shrinkColor(this.game.playerColors[this.game.turn], 200 / 255),
    );
  document
    .getElementById("bParent")
    .style.setProperty(
      "--hover-color",
      blank
        ? "rgb(220, 220, 220)"
        : this.shrinkColor(this.game.playerColors[this.game.turn], 220 / 255),
    );
  if ((!this.game.points && this.game.win) || !this.game.canMove) {
    Array.from(document.querySelectorAll(".tile.active")).forEach(
      (tile) => tile.className.includes("active") && (tile.className = "tile"),
    );
  } else {
    Array.from(document.querySelectorAll(".tile")).forEach(
      (tile) =>
        !tile.className.includes("blank") &&
        tile.innerHTML.trim() === "" &&
        (tile.className = "tile active"),
    );
  }
};
Bridge.prototype.shrinkColor = function (color, by) {
  var parts = color.split("rgb(")[1].split(",");
  parts[2] = parts[2].slice(0, parts[2].length - 1);
  parts[0] *= by;
  parts[1] *= by;
  parts[2] *= by;
  return `rgb(${parts[0] + 255 * by}, ${parts[1] + 255 * by}, ${parts[2] + 255 * by})`;
};
Bridge.prototype.place = function (box) {
  if (this.game.editEmpties) {
    this.game.blanks.push(box.id);
    this.game.init();
    return;
  }
  if (!this.game.points && this.game.win) return;

  if (box.innerHTML.trim() != "") return;
  this.game.place(box);
};

Bridge.prototype.toggleOptions = function () {
  if (document.getElementById("options").style.display == "none") {
    document.getElementById("options").style.display = "initial";
    document.getElementById("arrow").innerHTML = `<span>&rarr;</span>`;
    document.getElementById("app").style.setProperty("--tile-scale", "50px");
  } else {
    document.getElementById("options").style.display = "none";
    document.getElementById("arrow").innerHTML = `<span>&larr;</span>`;
    this.height < 9 &&
      document.getElementById("app").style.setProperty("--tile-scale", "70px");
  }
};
Bridge.prototype.setExtraMode = function (setMode) {
  if (setMode) {
    document.getElementById("mode").value = setMode;
  }
  var mode = document.getElementById("mode").value;
  this.game.SOS = false;
  switch (mode) {
    case "quixo":
      document.getElementById("width").value = 5;
      document.getElementById("height").value = 5;
      this.game.init();
    case "sos":
      document.getElementById("wild").checked = true;
      this.game.wild = true;
      this.game.SOS = true;
      this.game.players = 2;
      document.getElementById("p2").checked = true;
  }
  document.getElementById("p").style.display =
    mode == "sos" ? "none" : "initial";
};
Bridge.prototype.toggleEmpties = function (button) {
  this.game.editEmpties = !this.game.editEmpties;
  if (this.game.editEmpties) {
    this.setTileColors(true);
    document.getElementById("empties").innerText = "Done";
  } else {
    this.setTileColors(false);
    document.getElementById("empties").innerText = "Set Empties";
  }
};
Bridge.prototype.setPreset = function () {
  var preset = document.getElementById("preset").value;
  switch (preset) {
    case "o":
      this.game.setBoard(3, 3, 3, false, false, "d", 2, []);
      break;
    case "four":
      this.game.setBoard(4, 4, 4, false, false, "d", 2, []);
      break;
    case "five":
      this.game.setBoard(5, 5, 4, false, false, "d", 2, []);
      break;
    case "tr":
      this.game.setBoard(10, 1, 3, false, false, "d", 2, []);
      break;
    case "n":
      this.game.setBoard(3, 3, 3, false, false, "d", 2, [], "", true);
      break;
    case "c4":
      this.game.setBoard(7, 6, 4, true, false, "d", 2, []);
      break;
    case "ttf":
      this.game.setBoard(6, 6, 3, false, true, "d", 3, []);
      break;
    case "allSmiles":
      this.game.setBoard(11, 11, 3, false, true, "d", 2, [
        "0_1",
        "0_0",
        "1_0",
        "9_10",
        "10_10",
        "10_9",
        "7_0",
        "9_0",
        "10_2",
        "9_3",
        "8_3",
        "7_3",
        "6_2",
        "0_10",
        "1_9",
        "2_9",
        "3_9",
        "4_10",
        "1_7",
        "3_7",
        "4_4",
        "5_5",
        "6_6",
      ]);
      break;
    case "pyra":
      this.game.setBoard(5, 3, 3, false, false, "d", 2, [
        "0_1",
        "0_0",
        "1_0",
        "3_0",
        "4_0",
        "4_1",
      ]);
      break;
    case "battle":
      this.game.setBoard(10, 10, 3, false, true, "w", 2, [
        "5_0",
        "4_1",
        "5_2",
        "4_3",
        "5_4",
        "4_5",
        "5_6",
        "4_7",
        "5_8",
        "4_9",
      ]);
  }
  setTimeout(function () {
    document.getElementById("preset").value = "";
  }, 1000);
};

function Game(bridge) {
  this.bridge = bridge;
  this.bridge.game = this;
  this.currentPlayer = "X";
  this.turn = 0;
  this.width = 3;
  this.height = 3;
  this.times = 3;
  this.win = false;
  this.canMove = false;
  this.rTurn = false;
  this.points = false;
  this.wild = false;
  this.SOS = false;
  this.editEmpties = false;
  this.blanks = [];
  this.characters = ["X", "O", "△", "□", "¶"];
  this.playerColors = [
    "rgb(0, 0, 255)",
    "rgb(255, 0, 0)",
    "rgb(0, 167, 0)",
    "rgb(255, 215, 0)",
    "rgb(255, 0, 255)",
  ];
  this.playerPoints = [0, 0, 0, 0, 0];
  this.players = 2;
  this.nokato = false;
  this.calculatedIDs = [];
}

Game.prototype.setNokato = function (on) {
  this.nokato = on;
  if (on) {
    this.wild = false;
    this.rTurn = false;
  }
};
Game.prototype.getSquare = function (x, y) {
  return this.bridge.getSquare(x, y);
};
Game.prototype.isTie = function () {
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.getSquare(x, y) == "" && this.blanks.indexOf(`${x}_${y}`) < 0) {
        return false;
      }
    }
  }
  return true;
};

Game.prototype.init = function (resetEmpties) {
  this.calculatedIDs = [];
  this.board = this.bridge.board;
  this.board.innerHTML = "";
  this.bridge.setTileColors();
  this.win = false;
  this.turn = 0;
  this.width = this.bridge.width.value;
  this.height = this.bridge.height.value;
  this.c4 = this.bridge.c4.checked;
  this.playerPoints = [0, 0, 0, 0, 0];
  this.points = this.bridge.points.checked;
  this.rTurn = this.bridge.rTurn.checked;
  this.wild = this.bridge.wild.checked;
  this.canMove = true;
  this.wins = 0;

  if (this.rTurn) {
    this.currentPlayer =
      this.characters[Math.round(Math.random()) * (this.players - 1)];
  }
  this.board.style.gridTemplateColumns =
    "repeat(" + this.width + ", var(--tile-scale))";
  this.board.style.gridTemplateRows =
    "repeat(" + this.height + ", var(--tile-scale))";
  this.times = this.bridge.times.value;
  this.currentPlayer = "X";
  this.turn = 0;
  for (var y = 0; y < this.height; y++) {
    var id;
    for (var x = 0; x < this.width; x++) {
      id = x + "_" + y;
      var tag;
      if (this.blanks.indexOf(id) < 0) {
        tag =
          `<div class="tile active" onclick="game.bridge.place(this)" id="` +
          id +
          `" ></div>`;
      } else {
        tag =
          `<div class="tile blank" onclick="game.noEmpties(this)" id="` +
          id +
          `" ></div>`;
      }

      this.board.innerHTML += tag;
    }
  }
  resetEmpties && this.editEmpties && this.bridge.toggleEmpties();
  this.refreshDisplay();
};

Game.prototype.changePlayers = function (count) {
  this.players = count;
};
Game.prototype.refreshDisplay = function () {
  return this.bridge.refreshDisplay();
};
Game.prototype.nextTurn = function () {
  // if (this.wild) {
  //   return;
  // }

  var next_idx = this.turn + 1;
  if (next_idx < this.players) {
    this.turn = next_idx;
  } else {
    this.turn = 0;
  }
  this.currentPlayer = this.characters[this.turn];
  if (this.nokato) {
    this.currentPlayer = this.characters[0];
  }
  if (this.rTurn) {
    this.currentPlayer =
      this.characters[Math.round(Math.random()) * (this.players - 1)];
  }

  this.refreshDisplay();
};
Game.prototype.isPerfect = function (a) {
  if (a[0] == "") {
    return;
  }
  if (this.SOS) {
    return a[0] == a[2] && a[1] == "X" && a[0] == "O";
  }
  return a.every((b) => b === a[0]);
};
Game.prototype.whoWon = function (IDs) {
  this.win = true;
  this.refreshDisplay();
  this.playerPoints[this.characters.indexOf(this.getSquare(IDs[0]))] += 1;
  console.warn(this.playerPoints);
  if (
    this.calculatedIDs.some((e) => JSON.stringify(e) === JSON.stringify(IDs))
  ) {
    return;
  }
  this.calculatedIDs.push(IDs);
  var color = this.characters.indexOf(this.getSquare(IDs[0]));
  // highlight winner cells
  IDs.forEach((id) => {
    this.bridge.highlightSquare(id, this.playerColors[color]);
  });
};
Game.prototype.checkH = function (o) {
  var line = [];
  var line2 = [];
  for (var y = 0; y < this.height; y++) {
    var id;
    ((line = []), (line2 = []));
    for (var x = 0; x < this.times; x++) {
      id = `${x + o}_${y}`;
      line.push(this.getSquare(x + o, y));
      line2.push(id);
    }
    if (this.isPerfect(line)) {
      this.whoWon(line2);
    }
  }
};
Game.prototype.checkV = function (o) {
  var line = [];
  var line2 = [];
  for (var x = 0; x < this.width; x++) {
    ((line = []), (line2 = []));
    var id;
    for (var y = 0; y < this.times; y++) {
      id = `${x}_${y + o}`;
      line.push(this.getSquare(x, y + o));
      line2.push(id);
    }
    if (this.isPerfect(line)) {
      this.whoWon(line2);
    }
  }
};
Game.prototype.checkDL = function (ox, oy) {
  var line = [],
    line2 = [],
    id;
  for (var x = this.times; !(x < 1); x--) {
    id = `${x - 1 + ox}_${(x - this.times / 2) * -1 + this.times / 2 - 0 + oy}`; // I don't even know
    line2.push(id);
    line.push(
      this.getSquare(
        x - 1 + ox,
        (x - this.times / 2) * -1 + this.times / 2 - 0 + oy,
      ),
    );
  }
  if (this.isPerfect(line)) {
    this.whoWon(line2);
  }
};
Game.prototype.checkDR = function (ox, oy) {
  var line = [],
    line2 = [],
    id;
  for (var x = 0; x < this.times; x++) {
    id = `${x + ox}_${x + oy}`;
    line2.push(id);
    line.push(this.getSquare(x + ox, x + oy));
  }
  if (this.isPerfect(line)) {
    this.whoWon(line2);
  }
};

Game.prototype.placeBox = function (box) {
  if (!this.canMove) {
    return;
  }
  box.innerHTML = this.currentPlayer;
  box.className = "tile";
  box.style.color = this.playerColors[this.turn];

  this.playerPoints = [0, 0, 0, 0, 0];
  this.win = false;
  for (var ox = 0; ox <= this.width - this.times; ox++) {
    this.checkH(ox);
    for (var oy = 0; !(oy > this.height - this.times); oy++) {
      this.checkV(oy);
      this.checkDR(ox, oy);
      this.checkDL(ox, oy);
    }
  }

  this.refreshDisplay();
  if (this.points || !this.win) {
    this.nextTurn();
  }
  this.bridge.setTileColors();
};

Game.prototype.removeWildOptions = function () {
  if (document.getElementById("wildContainer")) {
    document.getElementById("wildContainer").remove();
  }
};
Game.prototype.showWildOptions = function (box) {
  this.removeWildOptions();
  var elem = document.createElement("span"),
    myself = this;
  this.selectedBox = box;
  for (var i = 0; i < this.players; i++) {
    var elem2 = document.createElement("button");
    elem2.className = "wildOption";
    elem2.style.backgroundColor = this.playerColors[i];
    elem2.onclick = function () {
      myself.removeWildOptions();
      myself.placeWildBox(this.innerHTML, box);
    };
    elem2.innerHTML = this.characters[i];
    elem.appendChild(elem2);
  }
  elem.id = "wildContainer";
  box.appendChild(elem);
  this.bridge.setTileColors();
};
Game.prototype.placeWildBox = function (choice, box) {
  var player = this.currentPlayer;
  this.currentPlayer = choice;
  this.selectedBox.innerHTML = "";
  this.canMove = true;
  this.bridge.setTileColors();
  if (this.c4) {
    box.className = "tile";
    setTimeout(this.removeWildOptions, 10);
    this.moveDown(box);
  } else {
    this.canMove = true;
    this.placeBox(box);
  }
  this.currentPlayer = player;
  this.refreshDisplay();
};
Game.prototype.noEmpties = function (box) {
  if (this.editEmpties) {
    this.blanks.splice(this.blanks.indexOf(box.id), 1);
    this.init();
  }
};

Game.prototype.place = function (box) {
  if (this.wild) {
    this.canMove = false;
    this.showWildOptions(box);
  } else {
    if (this.canMove) {
      if (this.c4) {
        this.moveDown(box);
      } else {
        this.canMove = true;
        this.placeBox(box);
      }
    }
  }
};
Game.prototype.moveDown = function (box) {
  var id = box.id;
  var x = Number(id.slice(0, id.indexOf("_")));
  var y = Number(id.slice(-(id.length - id.indexOf("_")) + 1));
  var newId = `${x}_${y + 1}`;
  var newBox = this.bridge.getSquareElement(newId);
  if (!newBox) {
    this.canMove = true;
    this.placeBox(box);
    return;
  }
  if (y + 1 >= this.height || this.blanks.includes(newId)) {
    this.canMove = true;
    this.placeBox(box);
    return;
  } else {
    if (newBox.innerHTML.trim() != "" || this.blanks.includes(newId)) {
      this.canMove = true;
      this.placeBox(box);
      return;
    } else {
      this.moveDown(newBox); // setTimeout(this.moveDown, 500, newBox); nope
    }
  }
};

// HTML stuff down here:

Game.prototype.importBoard = function (board) {
  this.setBoard(...JSON.parse(board));
};
Game.prototype.exportBoard = function () {
  var board = [
    this.width,
    this.height,
    this.times,
    this.c4,
    this.points,
    this.rTurn ? "r" : this.wild ? "w" : "d",
    this.players,
    this.blanks,
    this.SOS ? "sos" : "",
    this.nokato || false
  ];

  window.navigator.clipboard.writeText(JSON.stringify(board));
  window.alert("Board Code copied to clipboard!");
};
Game.prototype.setBoard = function (
  width,
  height,
  times,
  c4,
  points,
  turn,
  players,
  empties,
  style,
  nokato
) {
  this.bridge.setNokato(nokato);
  this.bridge.setExtraMode(style);
  this.bridge.win.innerText = "";
  this.bridge.width.value = Number(width);
  this.bridge.height.value = +height;
  this.bridge.times.value = +times || 3;
  this.playerPoints = [0, 0, 0, 0, 0];
  this.players = players;
  for (let i = 2; i < 5; i++) {
    document.getElementById(`p${i}`).checked = i === players
  }
  this.bridge.points.checked = points || false;
  this.bridge.c4.checked = c4 || false;
  this.bridge.rTurn.checked = false;
  this.bridge.wild.checked = false;
  switch (turn) {
    case "r":
      this.bridge.rTurn.checked = true;
      break;
    case "w":
      this.bridge.wild.checked = true;
      break;
    default:
      this.bridge.td.checked = true;
      break;
  }
  this.canMove = true;
  this.wins = 0;
  this.blanks = empties || [];
  this.times = Number(times) || 3;
  this.currentPlayer = "X";
  this.turn = 0;
  this.editEmpties && this.bridge.toggleEmpties();
  this.init();
};

function init() {
  game = new Game(new Bridge());
  game.init();
}
