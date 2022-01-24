import Box from "./box";

export const gridRowNum = 11;
export const gridColNum = 10;

export const gridCellWidth = 50;
export const gridCellHeight = 60;

export function isBounds(x: number, y: number) {
  return (0 <= x && x < gridColNum) && (0 <= y && y < gridRowNum);
}

export default class Grid {
  private cells: number[][];

  constructor() {
    this.cells = new Array(gridRowNum).fill(0)
      .map(_ => new Array(gridColNum).fill(0));
  }
  
  public clearBox(box: Box) {
    for (let y = 0; y < box.gridYCells; y++) {
      for (let x = 0; x < box.gridXCells; x++) {
        if (this.cells[box.gridY + y][box.gridX + x] == box.id) {
          this.cells[box.gridY + y][box.gridX + x] = 0;
        }
      }
    }
  }

  public setBox(box: Box) {
    for (let y = 0; y < box.gridYCells; y++) {
      for (let x = 0; x < box.gridXCells; x++) {
        this.cells[box.gridY + y][box.gridX + x] = box.id;
      }
    }
  }

  public canSet(box: Box, baseX: number, baseY: number) {
    for (let y = 0; y < box.gridYCells; y++) {
      for (let x = 0; x < box.gridXCells; x++) {
        if (!isBounds(baseX + x, baseY + y) || this.cells[baseY + y][baseX + x]) {
          return false;
        }
      }
    }
    return true;
  }

  public drop(box: Box, x: number, baseY: number) {
    let y = baseY;
    while (this.canSet(box, x, y + 1)) {
      ++y;
    }
    return y;
  }

  public cellAt(x: number, y: number): number {
    return isBounds(x, y) && this.cells[y][x];
  }

  public isEmpty(x: number, y: number) {
    return !this.cells[y][x];
  }
}