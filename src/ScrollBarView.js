

export default class ScrollBarView {
  get x() {
    return this.view.width - this.width;
  }
  get y() {
    return 0;
  }
  get width() {
    return this.view.scrollBarWidth;
  }
  get height() {
    return this.view.height;
  }

  constructor(view, editor) {
    this.view = view;
    this.model = editor.model;
  }

  render() {
    this.renderSlidingBlock();
    this.renderBorder();
  }

  renderSlidingBlock() {
    const {ctx, contentView} = this.view;

    // 没有滚动块
    if (contentView.height <= this.view.height) {
      return;
    }

    // 滚动块
    const ratio = this.view.height / contentView.height;
    const rect = {
      width: this.width,
      height: this.height * ratio,
      x: this.x,
      y: this.model.getScrollTop() * ratio
    };

    ctx.save();
    ctx.fillStyle = this.view.scrollBarColor;
    ctx.fillRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
    ctx.restore();
  }

  renderBorder() {
    const ctx = this.view.ctx;

    // 辅助线
    let x = this.x;
    if (x % 2 === 0) {
      x = x + 0.5;
    }
    const y = this.y;
    ctx.save();
    ctx.strokeStyle = this.view.scrollBarColor
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, this.height);
    ctx.stroke();
    ctx.restore();
  }
}
