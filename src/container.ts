export default class Container {
  public readonly el: HTMLElement;
  private _x: number;
  private _y: number;
  private _width = 20;
  private _height = 20;

  constructor() {
    this.el = document.createElement('div');
    this.el.classList.add('container');

    this.x = 0;
    this.y = 0;
  }

  public get x() { return this._x; }

  public set x(val: number) {
    if (this._x == val) return;
    this._x = val;
    this.setCssVar('x', `${val}px`);
  }

  public get y() { return this._y; }

  public set y(val: number) {
    if (this._y == val) return;
    this._y = val;
    this.setCssVar('y', `${val}px`);
  }

  public get width() { return this._width; }

  public set width(val: number) {
    if (this._width == val) return;
    this._width = val;
    this.setCssVar('width', `${val}px`);
  }

  public get height() { return this._height; }

  public set height(val: number) {
    if (this._height == val) return;
    this._height = val;
    this.setCssVar('height', `${val}px`);
  }

  public setCssVar(name: string, value: string) {
    this.el.style.setProperty(`--${name}`, value);
  }
} 