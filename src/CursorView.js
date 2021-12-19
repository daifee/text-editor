import {assignStyle} from './utils';
import './CursorView.css';

export default class CursorView {
  get width() {
    return 2 * this.view.devicePixelRatio;
  }
  get height() {
    return this.view.rowHeight;
  }
  get x() {
    return this.position ? this.position.x : 0;
  }
  get y() {
    return this.position ? this.position.y : 0;
  }


  constructor(view, editor) {
    this.view = view;
    this.editor = editor;
    this.model = editor.model;

    this.position = null;
    this.animationName = 0;

    /**
     * textarea元素
     */
    this.textareaElement = document.createElement('textarea');
    this.textareaElement.className = 'cursor';
    assignStyle(this.textareaElement, {
      width: `${this.width}px`,
      height: `${this.height}px`
    });
    this.view.appendChild(this.textareaElement);

    this.cursorElement = document.createElement('div');
    this.cursorElement.className = 'cursor';
    assignStyle(this.cursorElement, {
      width: `${this.width}px`,
      height: `${this.height}px`
    });
    this.view.appendChild(this.cursorElement);
  }

  render() {
    const display = this.model.getActive() ? 'block' : 'none';
    const cursorPosition = this.model.getCursorPosition();
    const position = this.position = this.editor.positionHelper.convertCursorPositionToViewportPosition(cursorPosition);

    assignStyle(this.textareaElement, {
      left: `${position.x}px`,
      top: `${position.y}px`,
      // display: display
    });

    assignStyle(this.cursorElement, {
      left: `${position.x}px`,
      top: `${position.y}px`,
      display: display
    });

    // 闪烁动画
    this.cursorElement.style.animationName = `flicker-${this.animationName}`;
    this.animationName = this.animationName ^ 1;
  }


}
