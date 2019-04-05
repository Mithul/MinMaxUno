function randomWorld(size){
  var world = Array(size)
  for (var i = 0; i < size; i++) {
    world[i] = new Array(size);
    for(var j = 0; j < size ; j++){
      world[i][j] = ''
    }
  }
  x_inc = [0, 1 , 0 , -1]
  y_inc = [1, 0 , -1 , 0]

  var row, col;

  var npits = 1 + Math.floor(Math.random() * size/2);
  for (var i = 0; i < npits; i++) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    world[row][col] += 'P'
    for (var j = 0; j < x_inc.length ; j++){
      if(row + x_inc[j] < size && row + x_inc[j] >=0 ){
        if(col + y_inc[j] < size && col + y_inc[j] >=0 ){
          world[row+x_inc[j]][col + y_inc[j]] += 'B'
        }
      }
    }
  }

  while(isPit(world[row][col])){
    row = Math.floor(Math.random() * size);
    col = Math.floor(Math.random() * size);
    console.log("PIT")
  }
  world[row][col] += 'W'
  for (var j = 0; j < x_inc.length ; j++){
    if(row + x_inc[j] < size && row + x_inc[j] >=0 ){
      if(col + y_inc[j] < size && col + y_inc[j] >=0 ){
        world[row+x_inc[j]][col + y_inc[j]] += 'S'
      }
    }
  }

  while(isPit(world[row][col]) || isWumpus(world[row][col])){
    row = Math.floor(Math.random() * size);
    col = Math.floor(Math.random() * size);
  }
  world[row][col] += 'G'

  while(isPit(world[row][col]) || isWumpus(world[row][col] || isGoal(world[row][col])){
    row = Math.floor(Math.random() * size);
    col = Math.floor(Math.random() * size);
  }
  world[row][col] += 'U'

  return world;
}

function extractVector(cell){
  return [cell.includes('W'), cell.includes('S'), cell.includes('P'), cell.includes('B'), cell.includes('G')];
}

function isWumpus(cell){
  return extractVector(cell)[0]
}
function isStench(cell){
  return extractVector(cell)[1]
}
function isPit(cell){
  return extractVector(cell)[2]
}
function isBreeze(cell){
  return extractVector(cell)[3]
}
function isGold(cell){
  return extractVector(cell)[4]
}
