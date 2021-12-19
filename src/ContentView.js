

export default class ContentView {
  get x() {
    return this.padding;
  }
  get y() {
    return this.padding - this.model.getScrollTop();
  }
  get width() {
    return this.view.width - this.view.scrollBarWidth - this.padding * 2;
  }
  get height() {
    const content = this.model.getContent();
    return this.view.rowHeight * content.length
      + this.padding * 2;
  }

  constructor(view, editor) {
    this.editor = editor;
    this.view = view;
    this.model = editor.model;

    this.padding = 10 * this.view.devicePixelRatio;
  }

  render() {
    const content = this.model.getContent();
    content.forEach((row, rowIndex) => {
      this.renderRow(row, rowIndex);
    });
  }

  renderRow(row, rowIndex) {
    const ctx = this.view.ctx;
    const {rowHeight, fontSize, color, font} = this.view;
    const text = row.map((char) => {
      return char.raw;
    }).join('');

    const x = this.x;
    let y = this.y + rowIndex * rowHeight
      + fontSize + (rowHeight - fontSize) / 2;
    y = Math.round(y); // 四舍五入

    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}
