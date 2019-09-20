![battleships](https://media.git.generalassemb.ly/user/15120/files/da59cd00-fec9-11e8-96b7-dd04a818ea95)

## Rules
  - User places down 5 ships on the board
  - Once done, alternate turn between user and AI to attack
  - Attack by choosing a cell on the 10x10 grid, return with hit or no hit
  - If a ship is sunk, announce
  - If all ships are sunk, game ends

## Components
Ships:
  - 5 Carrier
  - 4 Battleship
  - 3 Destroyer
  - 3 Submarine
  - 2 Patrol Boat

Boards:
  - 10x10 grid, 2 for each player, (A-J, 1-10)
  - 1 for the ships, another for tracking attacks

## Logics
  - mouseover to show ship's shadow when placing
  - Rotate ships with 'R' key
  - Track each ship's positions, size, damages taken in the ship object.
  - click event on each grid cell for attacks
  - AI use `Math.random()` until it gets a hit.
    - Then target around that hit, try to sink the ship.
    - Later on it will make educated guess based on the remaining ship size and space available on the board

## Features
  - Shows opponent's ships' status
  - Do advanced 'salvo' rules if has time
  - 'Russian' variant with different ships and sizes.
  - Add images

### Minor Features
  - Allow user to choose ships when placing down
  - Allow user to replace ship using placement phase
