import Box from "../env/box";
import BoxEnv from "../env/box-env";
import { gridCellWidth, gridColNum, gridRowNum } from "../env/grid";
import CommandUI from "./command-ui";
import Hand from "./hand";

export default class Bot {
  public readonly hand: Hand
  public readonly commandUI;
  public boxEnv: BoxEnv;

  constructor(boxEnv: BoxEnv) {
    this.boxEnv = boxEnv;
    this.hand = new Hand(this);
    this.commandUI = new CommandUI(this);
  }

  /**
   * 把 一个方块 放到 另一个方块 的上面。
   * @param srcBoxId 
   * @param dst 方块id或grid坐标
   * @return 0=完成，2=不能移动，因为目的地方块的宽度小于源方块的宽度
   */
  public async putOn(srcBoxId: number, dst: number | { gridX: number, gridY: number }) {
    const srcBox = this.boxEnv.boxes.get(srcBoxId);
    let dstBox, dstPos;
    if (typeof dst == 'number') {
      dstBox = this.boxEnv.boxes.get(dst);
      dstPos = { gridX: dstBox.gridX, gridY: dstBox.gridY };
    } else {
      dstPos = dst as { gridX: number, gridY: number };
    }

    if (dstBox && dstBox.gridXCells < srcBox.gridXCells) {
      return 2;
    }

    console.log(`put ${srcBoxId} on ${dstPos ? `(${dstPos.gridX}, ${dstPos.gridY})` : dstBox.id}`);

    await this.findSpace(srcBox.gridX, srcBox.gridY, srcBox.gridXCells, srcBox.gridXCells);
    const { gridX: dstSpaceGridX } = await this.findSpace(
      dstPos.gridX, dstPos.gridY, dstBox ? dstBox.gridXCells : srcBox.gridXCells,
      srcBox.gridXCells, false);

    await this.grasp(srcBox);

    let topY = this.findCanGoTopY(srcBox.gridX, dstSpaceGridX, dstPos.gridY - 1);
    const { hand } = this;
    await hand.gotoGridY(topY - srcBox.gridYCells + 1);
    await hand.gotoGridX(dstSpaceGridX);
    await hand.gotoGridY(dstBox ? dstBox.gridY - srcBox.gridYCells : dstPos.gridY);
    console.log(`ungrasp ${srcBox.id}`);
    await hand.grasp(null);
    return 0;
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
    } else {
      const srcBox = boxes.get(srcBoxId);
      const dstPos = {
        gridX: dstBox.gridX,
        gridY: (dstBox.gridY + dstBox.gridYCells - 1) - srcBox.gridYCells + 1
      };
      await this.findSpace(dstBox.gridX, dstBox.gridY, dstBox.gridXCells, srcBox.gridXCells);
      await this.getRidOf(dstBox);
      await this.putOn(srcBoxId, dstPos);
    }
    return this.putOn(dstBoxId, srcBoxId);
  }

  /**
   * 寻找空间，如果顶部不为空，则清理。
   * @param gridX 
   * @param gridY 
   * @param width 空间宽度
   */
  private async findSpace(gridX: number, gridY: number, width: number, spaceWidth: number, wholeClear = true) {
    console.log('findSpace', gridX, gridY);
    let topY = gridY - 1;
    if (wholeClear) {
      let isClear = true;
      while (!isClear) {
        for (let x = gridX; isClear && x < gridX + width; x++) {
          if (!this.boxEnv.grid.isEmpty(x, topY)) {
            isClear = false;
            await this.clearTop(x, topY, gridY);
          }
        }
        if (!isClear) {
          topY--;
        }
      }
    } else {
      let left = gridX;
      // 先找到第一个非空
      for (; left < gridX + width; left++) {
        if (!this.boxEnv.grid.isEmpty(left, topY)) {
          break;
        }
      }
      let end = left;
      if (left + 1 < gridX + width) {
        left++;
        end = left;
        for (; end < gridX + width; end++) {
          if (!this.boxEnv.grid.isEmpty(end, topY)) {
            break;
          }
        }
      }
      if ((end - left) < spaceWidth) {
        for (let x = gridX; x < gridX + spaceWidth; x++) {
          await this.clearTop(x, topY, gridY);
        }
        return { gridX, gridY };
      } else {
        return { gridX: left, gridY };
      }
    }
  }

  /**
   * 去抓取目标（前置条件：已清顶）
   */
  private async grasp(target: Box) {
    console.log(`grasp ${target.id}`);
    const { hand } = this;
    // 找到从抓手到源方块之间最高的障碍的y位置
    const canGoTopY = this.findCanGoTopY(hand.gridX, target.gridX, target.gridY);

    await hand.gotoGridY(canGoTopY);
    await hand.gotoGridX(
      target.gridX + target.gridXCells - 1,
      target.gridX + target.gridXCells - gridCellWidth / 2);
    await hand.gotoGridY(target.gridY);
    return hand.grasp(target);
  }

  private async clearTop(x: number, topY: number, targetY: number) {
    console.log('clearTop', x, topY, targetY);
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
    // todo: 空白必须和target尺寸相同
    for (let y = gridRowNum - target.gridYCells; y >= 0; y--) {
      for (let x = 0; x < gridColNum; x++) {
        if (this.boxEnv.grid.isEmpty(x, y)) {
          return this.putOn(target.id, { gridX: x, gridY: y - target.gridYCells + 1 });
        }
      }
    }
  }
}