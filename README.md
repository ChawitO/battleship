# Battleship
A classic board game remade on browser with vanilla JavaScript, HTML, and SCSS. The project was given a time limit of 1 week as the first project taken during General Assembly's Software Engineering Immersive course.

Deployed with GitHub Pages at https://chawito.github.io/battleship/

## Technologies
* JavaScript
* HTML5
* SCSS

# Design and Concepts

The game was designed with flat design in mind, with clean visual and minimal clutters.

The ship panels on the side show the player's ships (left panel), and enemy's ships (right panel). With blue colour for player, and black colour for the enemy. If a ship has been sunk, the panel icon will show the ship in orange colour.

I decided to add missile animation coming from above to strike the tile when each player attacks as well, along with small explosion that shows up when a ship is hit.
![Imgur](https://i.imgur.com/05dF0r5.png)
![Imgur](https://i.imgur.com/faBlGu4.png)

I also made use of web component by building a `BoardTile` that extends `HTMLDivElement` and add my own methods. The board is built as a 10x10 grid, each tile is constructed using the `BoardTile` constructor, with the given index (from 0 to 99), and 'ocean' which is an array representing either the player board or the enemy board. The `BoardTile` also contains the ship object, if there is one.
![Imgur](https://i.imgur.com/yR54lKA.png)

## Game Rules
* Each player deploys all their ships on the 10x10 board.
* Each ship can be deployed in vertical or horizontal orientation, rotated by the R key.
* Game begins once both side playced all their ships.
* Each player takes turn attacking a tile on opponent's board.
* Once a ship is destroyed, it will be coloured black.
* Once a side has lost all ships, the game ends.

## AI logics
The current AI is based on probability density function. To choose a tile to attack, the current board and player's still afloat ships are used to calculate the most likely tile to contain a player's ship, based on a superposition of all possible board states that player ships could be in.

Begins with a ship that is still afloot, then place that ship onto the board on an available top leftmost tile that it could fit, ie. not on a tile that was previously attacked nor tile with a sunk ship. The tiles that this ship fit onto is then given a score, and added to the overall weight of the tiles.

Then the same ship is calculated again while being moved 1 tile to the left, if it is already on rightmost tile, it is moved down 1 row and begin on the leftmost tile. This new position is also added to the overal weight of the tiles.

Once the first ship has been calculated with all its possible board placement. The next ship is calculated with the same method, adding to the overall weight.

If a tile can contain a ship, and that ship overlap with previously hit but not yet sunk ship, then that tile is given an extra weight.

Once all ships were calculated, in both orientation, the AI then attack at the tile with the highest weight, being the most likely tile to contain a ship. If there are multiple tiles with the same weight, then it picks the top leftmost tile of the group by default.

This resulted in AI with a win after an average of 43 attempts.
When compared with the previous iteration of AI logic, called 'hunt and tracking' described below, which wins after an average of 60 attempts. The new logic is a clear improvement.

![statistic](https://i.imgur.com/4sILHLN.png)
The graph above was generated from 100,000 test runs for each AI logic. The graph shows the distribution of game lengths required for the AI to win the game, the lower the number of shots the better. Blue line for probability density function, and red line for hunt and tracking algorithm.

The graph clearly shows the great improvement of probability density function over the hunt and tracking algorithm.

The probability density function algorithm was inspired by reading an article on http://datagenetics.com/blog/december32011/index.html

# Challenges
The AI logic was the most complicated part of this project. It is also my first time trying to build a game. The game logic itself was not too complicated, however getting the enemy AI to play competently and be a challenge to the player is quite complicated.

The first iteration of the AI was just choosing a tile purely at random. This allowed me to test the game logic and make sure it is working as intended.

Then the next iteration was to improve upon it, in which I called 'Hunt and Tracking'. There are 2 phases, the first phase, hunting, is still choosing a tile at random. However if it results in a hit, then it triggers the second phase, tracking. Which will try to attack the 4 tiles surrounding the previously hit tile. And will try to trace down the ship until it is sunk. This algorithm works well enough to win sometimes, however I was still not satisfied. This lead me to search for a better idea and landed on the [article](http://datagenetics.com/blog/december32011/index.html) mentioned above.

The third iteration was build based on what I read in the article. Having to find the way to implement the probability density function algorith described in the article was enjoyable.

The result was highly satisfying. An enemy AI in which I could not beat. Along with an improved understanding in statistic.

# Future improvements
* Responsive design for mobile
* More game modes such as salvo mode (5 shots per turn), and different ship sizes.
* Make the AI less deterministic, make it choose a random tile if the weight between different tiles are the same. Currently it will always choose the top leftmost tile.
