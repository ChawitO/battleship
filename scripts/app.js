class Ship {
  constructor(type, size, pos = []) {
    this.type = type
    this.size = size
    this.damage = 0
    this.pos = pos
  }
  afloat() {
    return this.damage < this.size
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Variables declarations
  const board = document.querySelector('.board')
  const boardWidth = 10
  const friendlyOcean = []
  const shipInPlay = []
  const targetBoard = document.querySelector('.target-board')
  const enemyOcean = []
  const attempts = []
  const enemyAttempts = []
  let vertical = false
  let phase = 'placement'

  // Generate classic ships
  const ships = [
    new Ship('carrier', 5),
    new Ship('battleship', 4),
    new Ship('destroyer', 3),
    new Ship('submarine', 3),
    new Ship('patrol boat', 2)
  ]
  const enemyShipInPlay = [
    new Ship('carrier', 5, [0, 1, 2, 3, 4]),
    new Ship('battleship', 4, [10, 11, 12, 13]),
    new Ship('destroyer', 3, [20, 21, 22]),
    new Ship('submarine', 3, [30, 31, 32]),
    new Ship('patrol boat', 2, [40, 41])
  ]

  // Generate the 10x10 board
  generateBoard(friendlyOcean, board)

  // Rotate ship during placement
  document.addEventListener('keyup', (e) => {
    if (phase !== 'placement') return
    console.log(e.keyCode)
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
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        friendlyOcean[getIndex(x, y, j)].classList.add('ghost')
      }
    })

    // Remove ship preview
    cell.addEventListener('mouseout', function() {
      const ship = ships[0]
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        friendlyOcean[getIndex(x, y, j)].classList.remove('ghost')
      }
    })

    // Placing down ship
    cell.addEventListener('click', function() {
      const ship = ships[0]
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        const index = getIndex(x, y, j)
        ship.pos.push(index)
        friendlyOcean[index].classList.remove('ghost')
        friendlyOcean[index].classList.add('ship')
      }
      console.log(`Placing ${ship.type}`)
      shipInPlay.push(ships.shift())
      if (!ships.length) phase = 'play'
    })

    // Functions
    function invalidPlacement(ship) {
      const shipPositions = shipInPlay.map(ship => ship.pos).flat()
      if (!ship) return true
      // Exceed x (boardWidth) when x > 9
      if (!vertical && x + ship.size > boardWidth) return true
      // Exceed y (boardWidth) when y > 9
      if (vertical && y + ship.size > boardWidth) return true
      // If the tile is occupied
      for (let j = 0; j < ship.size; j++) {
        const index = getIndex(x, y, j)
        if (shipPositions.includes(index)) return true
      }
    }

    function getIndex(x, y, modif = 0,) {
      vertical ? y += modif : x += modif
      return (y * 10) + x
    }
  })

  // AI ship placement logic


  // Attack logic
  generateBoard(enemyOcean, targetBoard)

  enemyOcean.forEach(tile => tile.addEventListener('click', function() {
    if (phase !== 'play') return
    if (attempts.includes(this.index)) return
    console.log(this.index)

    attempts.push(this.index)
    const hit = checkHit(this.index, enemyShipInPlay, enemyOcean)
    if (hit) {
      enemyOcean[this.index].classList.add('hit')
    } else {
      enemyOcean[this.index].classList.add('miss')
    }
  }))

  // AI attack logic
  // Math.random() for now
  const attackIntervalId = setInterval(() => {
    switch (phase) {
      case 'play':
        enemyAttack()
        break
      case 'finished':
        clearInterval(attackIntervalId)
        break
    }
  }, 1000)

  function enemyAttack() {
    let index = Math.floor(Math.random() * boardWidth ** 2)
    while (enemyAttempts.includes(index)) {
      index = Math.floor(Math.random() * boardWidth ** 2)
    }
    enemyAttempts.push(index)
    const cell = friendlyOcean[index]
    cell.textContent = '*'
    checkHit(index, shipInPlay, friendlyOcean)
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

  function checkHit(pos, defenderShips, ocean) {
    const ship = defenderShips.find(ship => ship.pos.includes(pos))
    if (!ship) return
    ship.damage++
    if (!ship.afloat()) {
      ship.pos.forEach(pos => ocean[pos].textContent = 'X')
    }
    const finished = defenderShips.every(ship => !ship.afloat())
    if (finished) phase = 'finished'
    return ship
  }


})

HTMLElement.prototype.abc = function() {
  console.log('Im adding new prototype!')
}
