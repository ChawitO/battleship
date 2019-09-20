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
  // Generate classic ships
  const ships = [
    new Ship('carrier', 5),
    new Ship('battleship', 4),
    new Ship('destroyer', 3),
    new Ship('submarine', 3),
    new Ship('patrol boat', 2)
  ]

  // Generate the 10x10 board
  const board = document.querySelector('.board')
  const boardWidth = 10
  const cells = []
  const shipInPlay = []
  let vertical = false
  let phase = 'placement'

  for (let i = 0; i < boardWidth ** 2; i++) {
    const cell = document.createElement('div')
    cell.index = i
    cell.x = i % boardWidth
    cell.y = Math.floor(i / boardWidth)
    cells.push(cell)
    board.appendChild(cell)
  }

  // Rotate ship during placement
  document.addEventListener('keyup', (e) => {
    if (phase !== 'placement') return
    console.log(e.keyCode)
    if (e.keyCode === 82) {
      vertical = !vertical
      cells.forEach(cell => cell.classList.remove('ghost'))
    }
  })

  // Ship placement logic
  cells.forEach(cell => {
    const x = cell.x
    const y = cell.y

    // Add ship preview
    cell.addEventListener('mouseover', function() {
      const ship = ships[0]
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        cells[getIndex(x, y, j)].classList.add('ghost')
      }
    })

    // Remove ship preview
    cell.addEventListener('mouseout', function() {
      const ship = ships[0]
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        cells[getIndex(x, y, j)].classList.remove('ghost')
      }
    })

    // Placing down ship
    cell.addEventListener('click', function() {
      const ship = ships[0]
      if (invalidPlacement(ship)) return

      for (let j = 0; j < ship.size; j++) {
        const index = getIndex(x, y, j)
        ship.pos.push(index)
        cells[index].classList.remove('ghost')
        cells[index].classList.add('ship')
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
      let index = 0
      vertical ? y += modif : x += modif
      index += y * 10
      index += x
      return index
    }
  })

  // AI ship placement logic
  const enemyShipInPlay = [
    new Ship('carrier', 5, [0, 1, 2, 3, 4]),
    new Ship('battleship', 4, [10, 11, 12, 13]),
    new Ship('destroyer', 3, [20, 21, 22]),
    new Ship('submarine', 3, [30, 31, 32]),
    new Ship('patrol boat', 2, [40, 41])
  ]

  // Attack logic
  const targetBoard = document.querySelector('.target-board')
  const targets = []
  const attempts = []

  for (let i = 0; i < boardWidth ** 2; i++) {
    const tile = document.createElement('div')
    tile.index = i
    tile.x = i % boardWidth
    tile.y = Math.floor(i / boardWidth)
    targets.push(tile)
    targetBoard.appendChild(tile)
  }

  targets.forEach(tile => tile.addEventListener('click', function() {
    if (attempts.includes(this.index)) return
    if (phase !== 'play') return
    console.log(this.index)
    checkHit(this.index)
  }))

  // Functions
  function checkHit(index) {
    attempts.push(index)
    const ship = enemyShipInPlay.find(ship => ship.pos.includes(index))
    if (ship) {
      ship.damage++
      targets[index].classList.add('hit')
      if (!ship.afloat()) {
        ship.pos.forEach(pos => targets[pos].textContent = 'X')
      }
      if (allSunk()) {
        console.log('game ends')
        phase = 'finished'
      }
    } else {
      targets[index].classList.add('miss')
    }
  }

  function allSunk() {
    return enemyShipInPlay.every(ship => !ship.afloat())
  }

  // AI attack logic
  // Math.random() for now
  const enemyAttempts = []
  const attackIntervalId = setInterval(() => {
    if (phase === 'play') {
      enemyAttack()
    } else if (phase === 'finished') {
      clearInterval(attackIntervalId)
    }
  }, 1000)

  function enemyAttack() {
    let index = Math.floor(Math.random() * boardWidth ** 2)
    while (enemyAttempts.includes(index)) {
      index = Math.floor(Math.random() * boardWidth ** 2)
    }
    enemyAttempts.push(index)
    const cell = cells[index]
    cell.textContent = '*'
    enemyCheckHit(index)
  }

  function enemyCheckHit(index) {
    const ship = shipInPlay.find(ship => ship.pos.includes(index))
    if (ship) {
      ship.damage++
      if (!ship.afloat()) {
        ship.pos.forEach(pos => cells[pos].textContent = 'X')
      }
      const finished = shipInPlay.every(ship => !ship.afloat())
      if (finished) {
        phase = 'finished'
      }
    }
  }
})

HTMLElement.prototype.abc = function() {
  console.log('Im adding new prototype!')
}
