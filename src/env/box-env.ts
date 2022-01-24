import Box from "./box";
import Container from "../container";
import Grid, { gridCellHeight, gridCellWidth, gridRowNum } from "./grid";

export default class BoxEnv extends Container {
  public readonly boxes: Map<number, Box> = new Map();
  public readonly grid = new Grid();

  constructor() {
    super();
  
    this.el.classList.add('boxes');

    const box1 = new Box(1, 1, 1, 'blue');
    const box2 = new Box(2, 1, 2, 'blue');
    const box3 = new Box(3, 2, 2, 'red');
    const box4 = new Box(4, 1, 1, 'red');
    const box5 = new Box(5, 1, 1, 'yellow');
    const box6 = new Box(6, 1, 2, 'yellow');
    const box7 = new Box(7, 1, 1, '#75eb00');
    const box8 = new Box(8, 2, 1, '#75eb00');

    this.putBottom(box1, 0);
    this.putRight(box1, box7);
    this.putRight(box7, box3);
    this.putRight(box3, box5);
    this.putRight(box5, box2);
    this.putRight(box2, box8);
    this.putRight(box8, box4);
    this.putOn(box6, box4);
    
    for (const box of this.boxes.values()) {
      this.el.appendChild(box.el);
    }
  }

  private putRight(baseBox: Box, rightBox: Box) {
    const gridX = baseBox.gridX + baseBox.gridXCells;
    let gridY = baseBox.gridY - rightBox.gridYCells;

    if (!this.grid.canSet(rightBox, gridX, gridY)) return;

    if (this.boxes.has(rightBox.id)) {
      this.grid.clearBox(rightBox);
    }
    this.putBox(rightBox, gridX, gridY);
  }
  
  private putOn(upBox: Box, baseBox: Box) {
    const gridX = baseBox.gridX;
    let gridY = baseBox.gridY - upBox.gridYCells;

    if (!this.grid.canSet(upBox, gridX, gridY)) return;

    if (this.boxes.has(upBox.id)) {
      this.grid.clearBox(upBox);
    }
    this.putBox(upBox, gridX, gridY);
  }

  private putBottom(box: Box, gridX: number) {
    const gridY = gridRowNum - box.gridYCells;
    if (!this.grid.canSet(box, gridX, gridY)) return;
    this.putBox(box, gridX, gridY);
  }

  private putBox(box: Box, gridX: number, gridY: number): void {
    gridY = this.grid.drop(box, gridX, gridY);
    box.gridX = gridX;
    box.gridY = gridY;
    box.x = gridX * gridCellWidth;
    box.y = (gridY - 1) * gridCellHeight;

    this.grid.setBox(box);
    this.boxes.set(box.id, box);
  }
}