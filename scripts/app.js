const boardWidth = 10
let vertical = false
let phase = 'placement'

class Ship {
  constructor(type, size, icon) {
    this.type = type
    this.size = size
    this.damage = 0
    this.fleet = undefined
    this.ocean = undefined
    this.pos = []
    this.display = document.createElement('div')
    this.icon = icon
  }

  afloat() {
    return this.damage < this.size
  }

  takeDamage() {
    this.damage++
    if (!this.afloat()) this.sunk()
  }

  sunk() {
    this.pos.forEach(pos => this.ocean[pos].style.backgroundColor = 'black')
    this.display.childNodes[1].classList.add('sunk')
    if (this.fleet.every(ship => !ship.afloat())) phase = 'finished'
  }
}

class BoardTile extends HTMLDivElement {
  constructor(i, ocean) {
    super()
    this.index = i
    this.x = i % boardWidth
    this.y = Math.floor(i / boardWidth)
    this.ship = undefined
    this.ocean = ocean

    ocean.push(this)
  }

  placeShip(ship, fleet, visible) {
    for (let j = 0; j < ship.size; j++) {
      const tile = this.getOffsetTile(j)
      ship.fleet = fleet
      ship.ocean = this.ocean
      ship.pos.push(tile.index)
      tile.ship = ship
      if (visible) {
        tile.classList.remove('ghost')
        tile.classList.add('ship')
        ship.display.childNodes[1].classList.add('ready')
      }
    }
    fleet.push(ship)
  }

  invalidPlacement(ship, fleet) {
    const { x, y } = this
    const shipPositions = fleet.map(ship => ship.pos).flat()

    if (!ship) return true
    if (!vertical && x + ship.size > boardWidth) return true
    if (vertical && y + ship.size > boardWidth) return true

    // If the tile is occupied
    for (let j = 0; j < ship.size; j++) {
      const index = this.getOffsetTile(j).index
      if (shipPositions.includes(index)) return true
    }
  }

  getOffsetTile(offset) {
    let { x, y } = this
    vertical ? y += offset : x += offset
    return this.ocean[(y * 10) + x]
  }

  checkHit() {
    if (!this.ship) return this.classList.add('miss')
    this.ship.takeDamage()
    this.classList.add('hit')
    return this.ship
  }
}
customElements.define('board-tile', BoardTile, { extends: 'div' })

window.addEventListener('DOMContentLoaded', () => {

  // Variables declarations
  const board = document.querySelector('.friendly-board')
  const targetBoard = document.querySelector('.enemy-board')
  const friendlyOcean = []
  const friendlyFleet = []
  const enemyOcean = []
  const enemyFleet = []
  const attempts = []
  const enemyAttempts = []
  let selectedShip

  // Generate classic ships
  let ships = [
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
    const tile = document.querySelector('.friendly-board div:hover')
    if (tile && e.keyCode === 82) {
      removeGhost(tile)
      vertical = !vertical
      addGhost(tile)
    }
  })

  // Ship selection
  ships.forEach(ship => ship.display.addEventListener('click', function() {
    if (friendlyFleet.includes(ship)) return
    selectedShip = ship
  }))

  // Ship placement logic
  friendlyOcean.forEach(tile => {

    // Add ship preview
    tile.addEventListener('mouseover', addGhost)

    // Remove ship preview
    tile.addEventListener('mouseout', removeGhost)

    // Placing down ship
    tile.addEventListener('click', function() {
      const ship = selectedShip || ships[0]
      if (this.invalidPlacement(ship, friendlyFleet)) return

      ships = ships.filter(s => s !== ship)
      selectedShip = null
      this.placeShip(ship, friendlyFleet, true)
      if (!ships.length) phase = 'play'
    })
  })

  // AI ship placement logic
  while (enemyShips.length) {
    const ship = enemyShips.shift()

    vertical = Math.random() >= 0.5
    let tile = enemyOcean[getRandomIndex()]
    do {
      tile = enemyOcean[getRandomIndex()]
    } while (tile.invalidPlacement(ship, enemyFleet))

    tile.placeShip(ship, enemyFleet)
    vertical = false
  }

  // Attack logic
  enemyOcean.forEach(tile => tile.addEventListener('click', function() {
    if (phase !== 'play') return
    if (attempts.includes(this.index)) return

    attempts.push(this.index)
    this.checkHit()

    // Do AI attack after the user's
    enemyAttack()
  }))

  // AI attack logic
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

  let hitRecords = []
  function enemyAttack() {

    // Pick a random tile to attack
    let index = getRandomIndex()
    const prev1 = hitRecords[hitRecords.length - 1]
    const prev2 = hitRecords[0]

    // If previous attempt is a hit pick random adjacent tile
    if (hitRecords.length === 1) {
      const adjacents = neighbourTiles(prev1).filter(i => !enemyAttempts.includes(i))
      const pick = Math.floor(Math.random() * adjacents.length)
      index = adjacents[pick]
    }

    // If 2 hits are adjacent, pick tile in the line
    if (hitRecords.length >= 2) {
      let diff = prev1 - prev2

      diff = Math.max(diff, -boardWidth)
      diff = Math.min(diff, boardWidth)
      if (diff < 0 && diff > -boardWidth) diff = -1
      if (diff > 0 && diff < boardWidth) diff = 1

      // Try tile next to the last hit
      index = prev1 + diff

      // If it was attempted, try tile next to the previous hit
      if (enemyAttempts.includes(index) || !neighbourTiles(prev1).includes(index)) index = prev2 - diff

      // If both ends of consecutive hits are misses, then there is at least 2 ships there
      if (enemyAttempts.includes(index) || (!neighbourTiles(prev2).includes(index) && !neighbourTiles(prev1).includes(index))) {
        index = neighbourTiles(hitRecords[0]).filter(pos => !enemyAttempts.includes(pos))[0]
      }
    }

    // If the index has been attempted, get random index
    while (enemyAttempts.includes(index) || (!hitRecords.length && unmarkedAdjacentCount(index) < 1)) {
      index = getRandomIndex()
    }

    enemyAttempts.push(index)
    const tile = friendlyOcean[index]
    const ship = tile.checkHit()
    if (ship) hitRecords.push(index)
    if (ship && !ship.afloat()) hitRecords = hitRecords.filter(index => !ship.pos.includes(index))
  }

  function addGhost(tile) {
    if (tile.target) tile = tile.target
    const ship = selectedShip || ships[0]
    if (tile.invalidPlacement(ship, friendlyFleet)) return

    for (let j = 0; j < ship.size; j++) {
      tile.getOffsetTile(j).classList.add('ghost')
    }
  }

  function removeGhost(tile) {
    if (tile.target) tile = tile.target
    const ship = selectedShip || ships[0]
    if (tile.invalidPlacement(ship, friendlyFleet)) return

    for (let j = 0; j < ship.size; j++) {
      tile.getOffsetTile(j).classList.remove('ghost')
    }
  }

  function generateBoard(ocean, parent) {
    for (let i = 0; i < boardWidth ** 2; i++) {
      const tile = new BoardTile(i, ocean)
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

  function getRandomIndex() {
    return Math.floor(Math.random() * boardWidth ** 2)
  }

  function getX(index) {
    return index % boardWidth
  }

  function neighbourTiles(index) {
    return Object.values({
      n: (index - boardWidth) >= 0 ? index - boardWidth : null,
      s: (index + boardWidth) < boardWidth ** 2 ? index + boardWidth : null,
      e: getX(index) < boardWidth - 1 ? index + 1 : null,
      w: getX(index) > 0 ? index - 1 : null
    }).filter(v => v !== null)
  }

  function unmarkedAdjacentCount(index) {
    return neighbourTiles(index).filter(i => !enemyAttempts.includes(i)).length
  }
})
