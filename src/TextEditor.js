import EditorView from './EditorView';
import EditorModel from './EditorModel';
import EditorController from './EditorController';
import PositionHelper from './PositionHelper';
import MouseHandler from './MouseHandler';
import TextareaHandler from './TextareaHandler';

export default class TextEditor {
  constructor(container) {
    this.container = container;

    this.config = {
      fontFamily: 'Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.35,
      color: '#ffffff',
      backgroundColor: '#1e1e1e',
      scrollBarWidth: 14,
      scrollBarColor: '#777777'
    };

    this.positionHelper = new PositionHelper(this);
    this.model = new EditorModel(() => {
      this.view.render();
    });
    this.view = new EditorView(this);
    this.controller = new EditorController(this);

    this.mouseHandler = new MouseHandler(this);
    this.textareaHandler = new TextareaHandler(this);
  }

  setContent(rawContent) {
    this.controller.setContent(rawContent);
  }
  getContent() {
    return this.model.getContent();
  }
  focus() {
    this.controller.focus();
  }
  blur() {
    this.controller.blur();
  }
  // 重新渲染
  rerender() {
    this.controller.rerender();
  }
}
