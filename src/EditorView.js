import * as utils from './utils';
import ContentView from './ContentView';
import ScrollBarView from './ScrollBarView';
import CursorView from './CursorView';

export default class EditorView {
  get x() {
    return 0;
  }
  get y() {
    return 0;
  }
  get width() {
    return this.virtualContainerElement.offsetWidth;
  }
  get height() {
    return this.virtualContainerElement.offsetHeight;
  }

  // ctx
  get ctx() {
    return this._ctx;
  }



  get textareaElement() {
    return this.cursorView.textareaElement;
  }

  get contentHeight() {
    return this.contentView.height;
  }

  // rowWidthLimit
  get rowWidthLimit() {
    return this.contentView.width;
  }

  get rowHeight() {
    const config = this.editor.config;
    return Math.round(this.fontSize * config.lineHeight);
  }

  /**
   * editor.config
   */
  get color() {
    const config = this.editor.config;
    return config.color;
  }
  get font() {
    const config = this.editor.config;
    return `${this.fontSize}px ${config.fontFamily}`;
  }
  get fontSize() {
    const config = this.editor.config;
    return config.fontSize * this.devicePixelRatio;
  }
  get backgroundColor() {
    const config = this.editor.config
    return config.backgroundColor;
  }
  get scrollBarWidth() {
    const config = this.editor.config;
    return config.scrollBarWidth * this.devicePixelRatio;
  }
  get scrollBarColor() {
    const config = this.editor.config;
    return config.scrollBarColor;
  }


  constructor(editor) {
    this.editor = editor;
    const ratio = this.devicePixelRatio = window.devicePixelRatio;

    /**
     * 虚拟容器
     */
    this.virtualContainerElement = document.createElement('div');
    utils.assignStyle(this.virtualContainerElement, {
      position: 'absolute',
      zIndex: '2',
      top: '0px',
      left: '0px',
      width: `${ratio * 100}%`,
      height: `${ratio * 100}%`,
      transform: `scale(${1 / ratio})`,
      transformOrigin: 'left top'
    });
    this.editor.container.appendChild(this.virtualContainerElement);

    /**
     * canvas元素
     */
    this.canvasElement = document.createElement('canvas');
    utils.assignStyle(this.canvasElement, {
      position: 'relation',
      zIndex: '1',
      width: '100%',
      height: '100%'
    });
    this.appendChild(this.canvasElement);

    /**
     * 事件代理元素
     */
    this.delegationElement = document.createElement('div');
    utils.assignStyle(this.delegationElement, {
      position: 'absolute',
      zIndex: '99999',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
    });
    this.appendChild(this.delegationElement);

    /**
     * ctx
     */
    this._ctx = this.canvasElement.getContext('2d');

    this.contentView = new ContentView(this, editor);
    this.scrollBarView = new ScrollBarView(this, editor);
    this.cursorView = new CursorView(this, editor);
  }

  resetCanvasElementSize() {
    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;
  }

  render() {
    this.resetCanvasElementSize();

    this.renderBackground();
    this.contentView.render();
    this.scrollBarView.render();
    this.cursorView.render();
  }

  renderBackground() {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  appendChild(element) {
    this.virtualContainerElement.appendChild(element);
  }
}

