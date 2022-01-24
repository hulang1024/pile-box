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
    const okButton = el.querySelector('#ok') as HTMLButtonElement;

    const enableInputs = (enable: boolean) => {
      okButton.disabled = !enable;
      srcBoxIdSelect.disabled = !enable;
      dstBoxIdSelect.disabled = !enable;
      placementSelect.disabled = !enable;
    };

    okButton.onclick = async () => {
      const srcBoxId = +srcBoxIdSelect.value;
      const dstBoxId = +dstBoxIdSelect.value;
      const placement = placementSelect.value;
      if ((isNaN(srcBoxId) || isNaN(dstBoxId)) || (srcBoxId == dstBoxId)) {
        alert('命令参数错误');
        return;
      }

      enableInputs(false);

      let promise;
      switch (placement) {
        case 'above':
          promise = bot.putOn(srcBoxId, dstBoxId);
          break;
        case 'below':
          promise = bot.putBelow(srcBoxId, dstBoxId);
          break;
      }
      const code = await promise;
      if (code != 0) {
        const srcBox = bot.boxEnv.boxes.get(srcBoxId);
        const dstBox = bot.boxEnv.boxes.get(srcBoxId);

        alert({2: `不能移动，因为${dstBox.name}的宽度小于${srcBox.name}的宽度`}[code]);
      }

      enableInputs(true);
    };
  }
}