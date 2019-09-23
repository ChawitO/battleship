class Ship {
  constructor(type, size, icon) {
    this.type = type
    this.size = size
    this.damage = 0
    this.pos = []
    this.display = document.createElement('div')
    this.icon = icon
  }
  afloat() {
    return this.damage < this.size
  }
  sunk() {
    this.display.childNodes[1].classList.add('sunk')
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Variables declarations
  const board = document.querySelector('.friendly-board')
  const targetBoard = document.querySelector('.enemy-board')
  const boardWidth = 10
  const friendlyOcean = []
  const friendlyFleet = []
  const enemyOcean = []
  const enemyFleet = []
  const attempts = []
  const enemyAttempts = []
  let vertical = false
  let phase = 'placement'

  // Generate classic ships
  const ships = [
    new Ship('carrier', 5, 'C'),
    new Ship('battleship', 4, 'E'),
    new Ship('destroyer', 3, 'M'),
    new Ship('submarine', 3, '('),
    new Ship('patrol boat', 2, 'W')
  ]
  const enemyShips = [
    new Ship('carrier', 5, 'C'),
    new Ship('battleship', 4, 'E'),
    new Ship('destroyer', 3, 'M'),
    new Ship('submarine', 3, '('),
    new Ship('patrol boat', 2, 'W')
  ]

  // Generate the 10x10 boards
  generateBoard(friendlyOcean, board)
  generateBoard(enemyOcean, targetBoard)

  const fFleet = document.querySelector('.friendly-fleet')
  ships.forEach(ship => generateShipDisplay(ship, fFleet))

  const eFleet = document.querySelector('.enemy-fleet')
  enemyShips.forEach(ship => generateShipDisplay(ship, eFleet))

  // Rotate ship during placement
  document.addEventListener('keyup', (e) => {
    if (phase !== 'placement') return
    if (e.keyCode === 82) {
      vertical = !vertical
      friendlyOcean.forEach(cell => cell.classList.remove('ghost'))
    }
  })

  // Ship placement logic
  friendlyOcean.forEach(cell => {
    const x = cell.x
    const y = cell.y

    // Add ship preview
    cell.addEventListener('mouseover', function() {
      const ship = ships[0]
      if (invalidPlacement(this.index, ship, friendlyFleet)) return

      for (let j = 0; j < ship.size; j++) {
        friendlyOcean[getIndex(x, y, j)].classList.add('ghost')
      }
    })

    // Remove ship preview
    cell.addEventListener('mouseout', function() {
      const ship = ships[0]
      if (invalidPlacement(this.index, ship, friendlyFleet)) return

      for (let j = 0; j < ship.size; j++) {
        friendlyOcean[getIndex(x, y, j)].classList.remove('ghost')
      }
    })

    // Placing down ship
    cell.addEventListener('click', function() {
      const ship = ships[0]
      if (invalidPlacement(this.index, ship, friendlyFleet)) return

      placeShip(this.index, ships.shift(), friendlyOcean, friendlyFleet, vertical, 'player')
      if (!ships.length) phase = 'play'
    })
  })

  // AI ship placement logic
  while (enemyShips.length) {
    const ship = enemyShips.shift()
    // Randomise index and orientation
    let index = getRandomIndex()
    const vert = Math.random() >= 0.5
    while (invalidPlacement(index, ship, enemyFleet, vert)) {
      index = getRandomIndex()
    }

    placeShip(index, ship, enemyOcean, enemyFleet, vert)
  }

  function placeShip(index, ship, ocean, fleet, vert = vertical, user) {
    for (let j = 0; j < ship.size; j++) {
      const pos = getIndex(ocean[index].x, ocean[index].y, j, vert)
      ship.pos.push(pos)
      if (user === 'player') {
        ocean[pos].classList.remove('ghost')
        ocean[pos].classList.add('ship')
      }
    }
    fleet.push(ship)
  }

  // Attack logic
  enemyOcean.forEach(tile => tile.addEventListener('click', function() {
    if (phase !== 'play') return
    if (attempts.includes(this.index)) return

    attempts.push(this.index)
    checkHit(this.index, enemyFleet, enemyOcean)

    // Do AI attack after the user's
    enemyAttack()
  }))

  // AI attack logic
  // Math.random() for now
  // const attackIntervalId = setInterval(() => {
  //   switch (phase) {
  //     case 'play':
  //       enemyAttack()
  //       break
  //     case 'finished':
  //       clearInterval(attackIntervalId)
  //       break
  //   }
  // }, 1000)

  let prevPos
  function enemyAttack() {
    // If previous attempt is a hit: choose one of the 4 adjecent tile
    let index
    const directions = [-boardWidth, 1, boardWidth, -1]
    if (prevPos) {
      do {
        index = prevPos + directions.shift()
      } while (directions.length && enemyAttempts.includes(index))
    } else {
      index = Math.floor(Math.random() * boardWidth ** 2)
    }
    while (enemyAttempts.includes(index)) {
      index = Math.floor(Math.random() * boardWidth ** 2)
    }
    // If previous 2 attempts are hits, choose the next tile in line


    enemyAttempts.push(index)
    const hit = checkHit(index, friendlyFleet, friendlyOcean)
    if (hit) prevPos = index
    if (!directions.length) prevPos = false
  }

  function generateBoard(ocean, parent) {
    for (let i = 0; i < boardWidth ** 2; i++) {
      const tile = document.createElement('div')
      tile.index = i
      tile.x = i % boardWidth
      tile.y = Math.floor(i / boardWidth)
      ocean.push(tile)
      parent.appendChild(tile)
    }
  }

  function generateShipDisplay(ship, parent) {
    const div = ship.display

    const name = document.createElement('p')
    name.textContent = ship.type
    div.appendChild(name)

    const icon = document.createElement('div')
    icon.textContent = ship.icon
    div.appendChild(icon)

    div.classList.add('ship-display')
    parent.appendChild(div)
  }

  function invalidPlacement(pos, ship, fleet, vert = vertical) {
    const x = pos % boardWidth
    const y = Math.floor(pos / boardWidth)
    const shipPositions = fleet.map(ship => ship.pos).flat()

    if (!ship) return true
    if (!vert && x + ship.size > boardWidth) return true
    if (vert && y + ship.size > boardWidth) return true

    // If the tile is occupied
    for (let j = 0; j < ship.size; j++) {
      const index = getIndex(x, y, j, vert)
      if (shipPositions.includes(index)) return true
    }
  }

  function checkHit(pos, defenderShips, ocean) {
    const ship = defenderShips.find(ship => ship.pos.includes(pos))
    if (!ship) {
      ocean[pos].classList.add('miss')
      return
    }
    ship.damage++
    ocean[pos].classList.add('hit')
    if (!ship.afloat()) {
      ship.pos.forEach(pos => ocean[pos].style.backgroundColor = 'black')
      ship.sunk()
    }
    const finished = defenderShips.every(ship => !ship.afloat())
    if (finished) phase = 'finished'
    return ship
  }

  function getRandomIndex() {
    return Math.floor(Math.random() * boardWidth ** 2)
  }

  function getIndex(x, y, modif = 0, vert = vertical) {
    vert ? y += modif : x += modif
    return (y * 10) + x
  }

})

HTMLElement.prototype.abc = function() {
  console.log('Im adding new prototype!')
}
