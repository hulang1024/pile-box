import Container from "../container";
import { gridCellHeight, gridCellWidth } from "./grid";

export default class Box extends Container {
  public readonly id: number;
  public readonly color: string;
  public gridX: number;
  public gridY: number;
  public readonly gridXCells: number;
  public readonly gridYCells: number;

  constructor(id: number, gridXCells: number, gridYCells: number, color: string) {
    super();

    this.id = id;
    this.gridXCells = gridXCells;
    this.gridYCells = gridYCells;
    this.color = color;

    const { el, el: { style } } = this;
    this.width = gridXCells * gridCellWidth;
    this.height = gridYCells * gridCellHeight;
    el.classList.add('box');
    style.backgroundColor = color;
    el.innerText = this.name;
  }

  public moveToX(x: number, msec: number) {
    this.setCssVar('duration', `${msec / 1000}s`);
    this.x = x;
  }

  public moveToY(y: number, msec: number) {
    this.setCssVar('duration', `${msec / 1000}s`);
    this.y = y;
  }

  public get name() { return `B${this.id}`; }
}