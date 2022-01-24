import 'regenerator-runtime';
import Bot from './bot/bot';
import BoxEnv from './env/box-env';
import { gridCellWidth, gridColNum } from './env/grid';

window.onload = () => {
  const stage = document.getElementById('stage');
  stage.style.setProperty('--floor-width', `${gridColNum * gridCellWidth}px`);

  const boxEnv = new BoxEnv();
  (window as any)['boxEnv'] = boxEnv;
  boxEnv.y = -60;
  stage.appendChild(boxEnv.el);

  const bot = new Bot(boxEnv);
  stage.appendChild(bot.hand.el);
};
