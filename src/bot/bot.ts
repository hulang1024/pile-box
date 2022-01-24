import Box from "../env/box";
import BoxEnv from "../env/box-env";
import { gridColNum, gridRowNum } from "../env/grid";
import CommandUI from "./command-ui";
import Hand from "./hand";

export default class Bot {
  public readonly hand = new Hand(this);
  public readonly commandUI: CommandUI;
  public boxEnv: BoxEnv;

  constructor(boxEnv: BoxEnv) {
    this.boxEnv = boxEnv;
    this.commandUI = new CommandUI(this);
  }

  /**
   * 把 一个方块 放到 另一个方块 的上面。
   * @param srcBoxId 
   * @param dst 方块id或grid坐标
   */
  public async putOn(srcBoxId: number, dst: number | { gridX: number, gridY: number }) {
    const srcBox = this.boxEnv.boxes.get(srcBoxId);
    let dstBox, dstPos;
    if (typeof dst == 'number') {
      dstBox = this.boxEnv.boxes.get(dst)
    } else {
      dstPos = dst as { gridX: number, gridY: number };
    }
    console.log(`put ${srcBoxId} on ${dstPos ? `(${dstPos.gridX}, ${dstPos.gridY})` : dstBox.id}`);
    await this.findSpace(srcBox.gridX, srcBox.gridY);
    if (dstBox) {
      await this.findSpace(dstBox.gridX, dstBox.gridY);
    } else {
      await this.findSpace(dstPos.gridX, dstPos.gridY);
    }

    await this.grasp(srcBox);

    let topY;
    if (dstBox) {
      topY = this.findCanGoTopY(srcBox.gridX, dstBox.gridX, dstBox.gridY - 1);
    } else {
      topY = this.findCanGoTopY(srcBox.gridX, dstPos.gridX, dstPos.gridY - 1);
    }
    await this.hand.gotoGridY(topY - srcBox.gridYCells + 1);
    if (dstBox) {
      await this.hand.gotoGridX(dstBox.gridX);
      await this.hand.gotoGridY(dstBox.gridY - srcBox.gridYCells);
    } else {
      await this.hand.gotoGridX(dstPos.gridX);
      await this.hand.gotoGridY(dstPos.gridY - srcBox.gridYCells + 1);
    }

    return this.hand.grasp(null);
  }
  
  /**
   * 把 一个方块 放到 另一个方块 的下面。
   * @param srcBoxId 
   * @param dstBoxId 
   */
  public async putBelow(srcBoxId: number, dstBoxId: number) {
    const { boxEnv, boxEnv: { boxes } } = this;
    const dstBox = boxes.get(dstBoxId);
    const dstUnderBoxId = boxEnv.grid.cellAt(dstBox.gridX, dstBox.gridY + dstBox.gridYCells);
    if (dstUnderBoxId) {
      await this.putOn(srcBoxId, dstUnderBoxId);
      return this.putOn(dstBoxId, srcBoxId);
    } else {
      const dstPos = { gridX: dstBox.gridX, gridY: dstBox.gridY };
      await this.getRidOf(dstBox);
      await this.putOn(srcBoxId, dstPos);
      return this.putOn(dstBoxId, srcBoxId);
    }
  }

  private findSpace(gridX: number, gridY: number) {
    console.log('findSpace', gridX, gridY);
    // 找到源方块的顶部坐标（如果上面有其它方块则会算上其它方块）
    let targetTopY = gridY;
    while (this.boxEnv.grid.cellAt(gridX, targetTopY - 1)) {
      targetTopY--;
    }
    return this.clearTop(gridX, targetTopY, gridY);
  }

  /**
   * 去抓取目标（前置条件：已清顶）
   */
  private async grasp(target: Box) {
    const { hand } = this;
    // 找到从抓手到源方块之间最高的障碍的y位置
    const canGoTopY = this.findCanGoTopY(hand.gridX, target.gridX, target.gridY);

    await hand.gotoGridY(canGoTopY);
    await hand.gotoGridX(target.gridX + target.gridXCells - 1);
    await hand.gotoGridY(target.gridY);
    return this.hand.grasp(target);
  }

  private async clearTop(x: number, topY: number, targetY: number) {
    while (topY < targetY) {
      const cell = this.boxEnv.grid.cellAt(x, topY);
      if (cell) {
        const target = this.boxEnv.boxes.get(cell);
        await this.getRidOf(target);
      }
      topY++;
    }
  }

  /**
   * 在grid中找到从(x1,y)到(x2,y)之间最高的障碍的纵轴位置。
   */
  private findCanGoTopY(x1: number, x2: number, y: number) {
    let canGoTopY = y;
    while (canGoTopY > 0) {
      let isXClear = true;
      const dirX = Math.sign(x2 - x1);
      for (let x = x1; x != x2; x += dirX) {
        if (!this.boxEnv.grid.isEmpty(x, canGoTopY)) {
          isXClear = false;
          break;
        }
      }
      if (isXClear) {
        break;
      } else {
        canGoTopY--;
      }
    }
    return canGoTopY;
  }

  private async getRidOf(target: Box) {
    console.log(`getRidOf ${target.id}`);
    // 找一个空白地
    for (let y = gridRowNum - 1; y >= 0; y--) {
      for (let x = 0; x < gridColNum; x++) {
        if (this.boxEnv.grid.isEmpty(x, y)) {
          return this.putOn(target.id, { gridX: x, gridY: y });
        }
      }
    }
  }
}