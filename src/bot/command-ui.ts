import Bot from "./bot";

export default class CommandUI {
  constructor(bot: Bot) {
    const el = document.querySelector('#command-ui');
    const selects = el.querySelectorAll('.box-id-select');

    selects.forEach((select: HTMLSelectElement) => {
      const boxes = [];
      for (const box of bot.boxEnv.boxes.values()) {
        boxes.push(box);
      }
      boxes.sort((a, b) => a.id - b.id);
      boxes.forEach((box) => {
        const opt = new Option(box.name, box.id.toString());
        select.options.add(opt);
      });
    });

    const srcBoxIdSelect = el.querySelector('#src-box-id') as HTMLSelectElement;
    const dstBoxIdSelect = el.querySelector('#dst-box-id') as HTMLSelectElement;
    const placementSelect = el.querySelector('#placement') as HTMLSelectElement;
    const okButton = el.querySelector('#ok') as HTMLElement;
    okButton.onclick = () => {
      const srcBoxId = +srcBoxIdSelect.value;
      const dstBoxId = +dstBoxIdSelect.value;
      const placement = placementSelect.value;
      if ((isNaN(srcBoxId) || isNaN(dstBoxId)) || (srcBoxId == dstBoxId)) {
        alert('命令错误');
        return;
      }

      switch (placement) {
        case 'above':
          bot.putOn(srcBoxId, dstBoxId);
          break;
        case 'below':
          bot.putBelow(srcBoxId, dstBoxId);
          break;
      }
    };
  }
}