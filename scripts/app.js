// Variables declarations
const playerOcean = []
let playerFleet = []
const enemyOcean = []
const enemyFleet = []
const attempts = []
const enemyAttempts = []
const boardWidth = 10
let selectedShip
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
    this.pos.forEach(pos => this.ocean[pos].classList.add('jsSunk'))
    setTimeout(() =>{
      this.pos.forEach(pos => this.ocean[pos].classList.add('sunk'))
      // this.display.childNodes[1].classList.add('sunk')
      if (this.fleet.every(ship => !ship.afloat())) {
        phase = 'finished'
        const endNotice = document.querySelector('.end-notice')
        const enemyDamage = enemyFleet.reduce((sum, ship) => sum + ship.damage, 0)
        const friendlyDamage = playerFleet.reduce((sum, ship) => sum + ship.damage, 0)
        const winner = enemyDamage > friendlyDamage ? 'You win' : 'AI wins'
        const count = enemyDamage > friendlyDamage ? attempts.length : enemyAttempts.length

        endNotice.textContent = `${winner} after ${count} attempts`
        endNotice.classList.add('fadeInDown')
      }
    }, 1100)
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

  invalidPlacement(ship, obstacles, vert = vertical) {
    const { x, y } = this

    if (!ship) return true
    if (!vert && x + ship.size > boardWidth) return true
    if (vert && y + ship.size > boardWidth) return true

    // Check against obstacles
    for (let j = 0; j < ship.size; j++) {
      const index = this.getOffsetTile(j, vert).index
      if (obstacles.includes(index)) return true
    }
  }

  getOffsetTile(offset, vert = vertical) {
    let { x, y } = this
    vert ? y += offset : x += offset
    return this.ocean[(y * 10) + x]
  }

  checkHit() {
    this.animateMissile()
    if (!this.ship) {
      this.classList.add('jsMiss')
      return setTimeout(() => this.classList.add('miss'), 600)
    }
    this.ship.takeDamage()
    this.classList.add('jsHit')
    this.animateExplosion()
    return this.ship
  }

  animateMissile() {
    const missile = document.createElement('div')
    missile.classList.add('missile')
    this.appendChild(missile)
    setTimeout(() => this.removeChild(missile), 600)
  }

  animateExplosion() {
    const explo = document.createElement('div')
    explo.classList.add('explosion')
    setTimeout(() => this.appendChild(explo), 600)
    setTimeout(() => {
      this.removeChild(explo)
      this.classList.add('hit')
    }, 1100)
  }
}
customElements.define('board-tile', BoardTile, { extends: 'div' })

window.addEventListener('DOMContentLoaded', () => {

  // Event for instruction button
  document.querySelector('#btn-inst').addEventListener('click', () => {
    document.querySelector('.instruction').classList.toggle('show')
  })

  // Event for restart button
  const restartBtn = document.querySelector('#btn-restart')
  restartBtn.addEventListener('click', function() {
    location.reload()
  })

  // Event for start button
  const startBtn = document.querySelector('#btn-start')
  startBtn.addEventListener('click', function() {
    if (!ships.length) {
      phase = 'play'
      const startNotice = document.querySelector('.start-notice')
      startNotice.classList.add('fadeInDownUp')
      startNotice.addEventListener('animationend', (e) => e.target.classList.remove('fadeInDownUp'))
      this.classList.add('hide')
      restartBtn.classList.remove('hide', 'noVisibility')
    }
  })

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
  const friendlyBoard = document.querySelector('.player .board')
  const enemyBoard = document.querySelector('.enemy .board')
  generateBoard(playerOcean, friendlyBoard)
  generateBoard(enemyOcean, enemyBoard)

  const pFleet = document.querySelector('.player .fleet')
  ships.forEach(ship => generateShipDisplay(ship, pFleet))
  ships[0].display.classList.add('selected')

  const eFleet = document.querySelector('.enemy .fleet')
  enemyShips.forEach(ship => generateShipDisplay(ship, eFleet))

  // Rotate ship during placement
  document.addEventListener('keyup', (e) => {
    const tile = document.querySelector('.player .board div:hover')
    if (tile && e.keyCode === 82) {
      removeGhost(tile)
      vertical = !vertical
      addGhost(tile)
    }
  })

  // Ship selection
  ships.forEach(ship => ship.display.addEventListener('click', function() {
    if (phase !== 'placement') return
    selectedShip = ship
    if (!ships.includes(ship)) {
      ships.push(ship)
      ship.pos.forEach(pos => {
        ship.ocean[pos].ship = undefined
        ship.ocean[pos].classList.remove('ship')
      })
      ship.display.childNodes[1].classList.remove('ready')
      ship.pos = []
      playerFleet = playerFleet.filter(fShip => fShip !== ship)
    }
    document.querySelector('.player .fleet').childNodes.forEach(div => div.classList.remove('selected'))
    this.classList.add('selected')
  }))

  // Ship placement logic
  playerOcean.forEach(tile => {

    // Add ship preview
    tile.addEventListener('mouseover', addGhost)

    // Remove ship preview
    tile.addEventListener('mouseout', removeGhost)

    // Placing down ship
    tile.addEventListener('click', function() {
      const ship = selectedShip || ships[0]
      const obstacles = playerFleet.map(ship => ship.pos).flat()
      if (this.invalidPlacement(ship, obstacles)) return

      ships = ships.filter(s => s !== ship)
      selectedShip = null
      this.placeShip(ship, playerFleet, true)
      ship.display.classList.remove('selected')
      if (ships[0]) ships[0].display.classList.add('selected')
      if (!ships.length) {
        startBtn.classList.remove('hide')
        restartBtn.classList.add('hide')
      }
    })
  })

  // AI ship placement logic
  while (enemyShips.length) {
    const ship = enemyShips.shift()

    vertical = Math.random() >= 0.5
    let tile = enemyOcean[getRandomIndex()]
    const obstacles = enemyFleet.map(ship => ship.pos).flat()
    while (tile.invalidPlacement(ship, obstacles)) {
      tile = enemyOcean[getRandomIndex()]
    }

    tile.placeShip(ship, enemyFleet)
    vertical = false
  }

  // Attack logic
  enemyOcean.forEach(tile => tile.addEventListener('click', function() {
    if (phase !== 'play') return
    if (attempts.includes(this.index)) return
    if (playerFleet.every(ship => !ship.afloat()) || enemyFleet.every(ship => !ship.afloat())) return

    attempts.push(this.index)
    this.checkHit()
    // Do AI attack after the user's
    probabilityDensityAlgorithm()
  }))

  // AI attack logic
  function huntTrackingAlgorithm() {

    const activeHits = playerOcean.filter(tile => {
      return tile.classList.contains('jsHit') && !tile.classList.contains('jsSunk')
    }).map(tile => tile.index)

    // Pick a random tile to attack
    let index = getRandomIndex()
    const prev1 = activeHits[activeHits.length - 1]
    const prev2 = activeHits[0]

    // If previous attempt is a hit pick random adjacent tile
    if (activeHits.length === 1) {
      const adjacents = neighbourTiles(prev1).filter(i => !enemyAttempts.includes(i))
      const pick = Math.floor(Math.random() * adjacents.length)
      index = adjacents[pick]
    }

    // If 2 hits are adjacent, pick tile in the line
    if (activeHits.length >= 2) {
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
        index = neighbourTiles(activeHits[0]).filter(pos => !enemyAttempts.includes(pos))[0]
      }
    }

    // If the index has been attempted, get random index
    while (index === undefined || enemyAttempts.includes(index) || (!activeHits.length && unmarkedAdjacentCount(index) < 1)) {
      index = getRandomIndex()
    }

    enemyAttempts.push(index)
    playerOcean[index].checkHit()
  }

  function probabilityDensityAlgorithm() {
    const remainingShips = playerFleet.filter(ship => ship.afloat())
    const probabilities = Array(100).fill(0)
    const obstacles = playerOcean.filter(tile => {
      return tile.classList.contains('jsMiss') || tile.classList.contains('jsSunk')
    }).map(tile => tile.index)

    const activeHits = playerOcean.filter(tile => {
      return tile.classList.contains('jsHit') && !tile.classList.contains('jsSunk')
    }).map(tile => tile.index)

    // For each remaining ships, find all possible arrangements
    remainingShips.forEach(ship => {
      playerOcean.forEach(tile => {
        [true, false].forEach(state => {
          if (!tile.invalidPlacement(ship, obstacles, state)) {
            let hitOverlaps = 0
            for (let j = 0; j < ship.size; j++) {
              const pos = tile.getOffsetTile(j, state).index
              probabilities[pos]++
              if (activeHits.includes(pos)) hitOverlaps++
            }
            // If the placement overlaps active hits, give extra weight
            if (hitOverlaps) {
              for (let j = 0; j < ship.size; j++) {
                const pos = tile.getOffsetTile(j, state).index
                probabilities[pos] += 5 * hitOverlaps
              }
            }
          }
        })
      })
    })
    // Prevent targeting previous tiles
    activeHits.forEach(i => probabilities[i] = 0)
    const index = probabilities.indexOf(Math.max(...probabilities))

    enemyAttempts.push(index)
    playerOcean[index].checkHit()
  }

  function addGhost(tile) {
    if (phase !== 'placement') return
    if (tile.target) tile = tile.target
    const ship = selectedShip || ships[0]
    const obstacles = playerFleet.map(ship => ship.pos).flat()
    if (tile.invalidPlacement(ship, obstacles)) return

    for (let j = 0; j < ship.size; j++) {
      tile.getOffsetTile(j).classList.add('ghost')
    }
  }

  function removeGhost(tile) {
    if (phase !== 'placement') return
    if (tile.target) tile = tile.target
    const ship = selectedShip || ships[0]
    const obstacles = playerFleet.map(ship => ship.pos).flat()
    if (tile.invalidPlacement(ship, obstacles)) return

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

  // testCycle(10000)
  // function testCycle(cycleCount) {
  //   const sum = Array(101).fill(0)
  //   while (cycleCount) {
  //     // Reset stages
  //     ships = [
  //       new Ship('carrier', 5, 'C'),
  //       new Ship('battleship', 4, 'E'),
  //       new Ship('destroyer', 3, 'M'),
  //       new Ship('submarine', 3, '('),
  //       new Ship('patrol boat', 2, 'W')
  //     ]
  //     playerOcean = []
  //     playerFleet = []
  //     enemyAttempts = []
  //
  //     // Randomly generate player's board
  //     for (let i = 0; i < 100; i++) {
  //       new BoardTile(i, playerOcean)
  //     }
  //
  //     while (ships.length) {
  //       const ship = ships.shift()
  //
  //       vertical = Math.random() >= 0.5
  //       let tile = playerOcean[getRandomIndex()]
  //       const obstacles = playerFleet.map(ship => ship.pos).flat()
  //       while (tile.invalidPlacement(ship, obstacles)) {
  //         tile = playerOcean[getRandomIndex()]
  //       }
  //
  //       tile.placeShip(ship, playerFleet)
  //       vertical = false
  //     }
  //
  //     // Run the attack
  //     while (playerFleet.some(ship => ship.afloat())) {
  //       // huntTrackingAlgorithm()
  //       probabilityDensityAlgorithm()
  //     }
  //
  //     // Increment
  //     console.log('test running...')
  //     sum[enemyAttempts.length]++
  //     cycleCount--
  //   }
  //   console.log(sum)
  // }
})
