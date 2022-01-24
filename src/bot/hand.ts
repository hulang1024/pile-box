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

  public async gotoGridX(gridX: number, displayGridX: number = null) {
    if (gridX == this.gridX) {
      return Promise.resolve();
    }
    const msec = cellMSec * Math.abs(this.gridX - gridX);
    this.gridX = gridX;
    this.setCssVar('duration', `${msec / 1000}s`);
    this.x = 35 + gridCellWidth / 2 + (displayGridX ?? gridX) * gridCellWidth;
    this.holdBox?.moveToX((displayGridX ?? gridX) * gridCellWidth, msec);
    await timeout(msec);
    if (this.holdBox) {
      this.bot.boxEnv.grid.clearBox(this.holdBox);
      this.holdBox.gridX = gridX;
      this.bot.boxEnv.grid.setBox(this.holdBox);
    }
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
    await timeout(msec);
    if (this.holdBox) {
      this.bot.boxEnv.grid.clearBox(this.holdBox);
      this.holdBox.gridY = gridY;
      this.bot.boxEnv.grid.setBox(this.holdBox);
    }
  }

  public grasp(box: Box) {
    this.holdBox = box;
    return timeout(50);
  }
}

function timeout(msec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
