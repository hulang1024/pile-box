import Container from "../container";
import Box from "../env/box";
import { gridCellHeight, gridCellWidth, gridRowNum } from "../env/grid";
import Bot from "./bot";

const cellMSec = 200;

export default class Hand extends Container {
  public gridX = -1;
  public gridY = -1;
  public holdBox: Box = null;
  private bot: Bot;

  constructor(bot: Bot) {
    super();
    this.bot = bot;
    this.el.classList.add('bot-hand');

    const armEl = document.createElement('div');
    armEl.classList.add('arm');
    this.el.appendChild(armEl);
    const gripperEl = document.createElement('div');
    gripperEl.classList.add('gripper');
    this.el.appendChild(gripperEl);

    this.gotoGridX(0);
    this.gotoGridY(gridRowNum - 1);
  }

  public async gotoGridX(gridX: number, displayOffset: number = 0.5) {
    if (gridX == this.gridX) {
      return Promise.resolve();
    }
    const msec = cellMSec * Math.abs(this.gridX - gridX);
    this.gridX = gridX;
    this.setCssVar('duration', `${msec / 1000}s`);
    this.x = 35 + (gridX + displayOffset) * gridCellWidth;
    this.holdBox?.moveToX(gridX * gridCellWidth, msec);
    return timeout(msec);
  }

  public async gotoGridY(gridY: number) {
    if (gridY == this.gridY) {
      return Promise.resolve();
    }
    const msec = cellMSec * Math.abs(this.gridY - gridY);
    this.gridY = gridY;
    this.setCssVar('duration', `${msec / 1000}s`);
    this.y = -(gridRowNum - gridY) * gridCellHeight;
    this.holdBox?.moveToY((gridY - 1) * gridCellHeight, msec);
    return timeout(msec);
  }

  public grasp(box: Box) {
    if (box == null && this.holdBox) {
      const { holdBox, bot: { boxEnv } } = this;
      boxEnv.grid.clearBox(holdBox);
      holdBox.gridX = this.gridX;
      holdBox.gridY = this.gridY;
      boxEnv.grid.setBox(holdBox);
    }
    this.holdBox = box;
    return timeout(50);
  }
}

function timeout(msec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
