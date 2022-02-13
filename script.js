let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let data;
let bestName;
let bestNN;
let bestScore = 0;
let generations = 0;
let learningRate = .2;

function setLearningRate(rate) {
  learningRate = rate;
}

function printNN() {
  console.log(JSON.stringify(bestNN));
}

//console.log(data.layers[2][0].bias);

let brain;

function Character(x,y,width,height,velocity,score,name) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.velocity = velocity;
  this.score = score;
  this.name = name;

  if (bestNN == undefined) {
    this.net = new NeuralNetwork(4,3,1);
  } else {
    let child = bestNN.copy();
    child.mutate(learningRate);
    this.net = child;
  }

  this.draw = function() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x,this.y,width,height);
  }
}

function Pipe(x,y,width,height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.draw = function() {
    ctx.fillRect(this.x,this.y,width,height);
  }
}


let characters = [];
let pipes = [];

let deadCharacters = [];

function createPipe() {
  let gap = Math.random();
  let pipe = new Pipe(canvas.width,0,50,gap * (canvas.height / 1.3));
  let pipe2 = new Pipe(canvas.width,canvas.height-((1-gap)*(canvas.height/2)),50,(1-gap)*(canvas.height / 1.3));
  pipes.push([pipe,pipe2]);
}

function start() {
  generations += 1;
  createPipe();
  for (i = 0; i < 500; i++) {
    let character = new Character(canvas.width/6,canvas.height-(canvas.width/15),canvas.width/25,canvas.width/25,0,0,"bot"+i); // size was 50
    characters.push(character);
  }
}
start();
function isCollide(a, b) {
  return !(
    ((a.y + (a.height)) < (b.y)) ||
    (a.y > (b.y + b.height)) ||
    ((a.x + (a.width)) < b.x) ||
    (a.x > (b.x + b.width))
  );
}

setInterval(function() {
  for (i = 0; i < characters.length; i++) {
    let char = characters[i]
    if (char) {
      let output = char.net.predict([char.y,pipes[0][0].x,pipes[0][0].height,pipes[0][1].height]);
      if (output > .5) {
        char.velocity = -5;
      }
    }
  }
},50);

let speed = 4;

setInterval(function() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.font = `40px Verdana`;
  ctx.fillStyle = "black";
  ctx.fillText("Generation: " + generations,canvas.width/2-125,50);
  if (characters.length == 0) {
    for (i = 0; i < 500; i++) {
    if (deadCharacters[i].score > bestScore) {
      bestNN = deadCharacters[i].net;
      bestScore = deadCharacters[i].score;
      bestName = deadCharacters[i].name;
    }
    }
    console.log(bestName);
    console.log("The best score is: " + bestScore);
    deadCharacters.splice(0,deadCharacters.length);
    pipes.splice(0,pipes.length);
    
    start();
  }
  for (i = 0; i < characters.length; i++) {
    if ( isCollide(characters[i],pipes[0][0]) || isCollide(characters[i],pipes[0][1]) ) {
      deadCharacters.push(characters[i]);
      characters.splice(i,1);
    }
    let char = characters[i]
    if (char) {
      /*
      let output = char.net.predict([char.y,pipes[0][0].x,pipes[0][0].height,pipes[0][1].height]);
      if (output > .5) {
        char.velocity -= 1.5;
      }
      */
      char.velocity += .2;
      if (characters[i].y <= 1) {
        char.velocity = 0;
        char.y += 1;
      } else if (characters[i].y >= canvas.height-(canvas.width/25)) {
        char.velocity = 0;
        char.y -= 1;
      } else {
        char.y += char.velocity;
      }
      char.draw();
      char.score += speed/2;
    }
  }

  ctx.fillStyle = 'black';
  for (i = 0; i < pipes.length; i++) {
    pipes[i][0].draw();
    pipes[i][1].draw();
    
    pipes[i][0].x -= speed;
    pipes[i][1].x -= speed;
    
    if (speed < 10) {
      //speed += .001;
    }
    if (pipes[i][0].x < -65) {
      pipes[i][0].x = canvas.width + 100;
      pipes[i][1].x = canvas.width + 100;
      pipes.splice(i, 1);
      createPipe();
    }
  }
},10)
