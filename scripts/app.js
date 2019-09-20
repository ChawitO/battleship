class Ship {
  constructor(type, size) {
    this.type = type
    this.size = size
    this.damage = 0
    this.pos = []
  }
  afloat() {
    return this.damage < this.size
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Generate classic ships
  const ships = [new Ship('carrier', 5),
    new Ship('battleship', 4),
    new Ship('destroyer', 3),
    new Ship('submarine', 3),
    new Ship('patrol boat', 2)]

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

  cells.forEach(cell => {
    const x = cell.x
    const y = cell.y

    // Add ship preview
    cell.addEventListener('mouseover', function() {
      const ship = ships[0]
      console.log(shipInPlay)
      console.log(shipInPlay.map(el => el.pos).flat())
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
        if (shipPositions.indexOf(index) !== -1) return true
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
})

HTMLElement.prototype.abc = function() {
  console.log('Im adding new prototype!')
}
