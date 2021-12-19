

export default class MouseHandler {

  constructor(editor) {
    this.editor = editor;

    const {delegationElement} = editor.view;

    delegationElement.addEventListener('wheel', this);
    delegationElement.addEventListener('mousedown', this);
  }

  handleEvent(event) {
    const type = event.type;
    const handler = this[type];
    if (handler) {
      handler.call(this, event);
    }
  }

  wheel(event) {
    const {view, controller} = this.editor;
    const deltaY = event.deltaY * view.devicePixelRatio;
    controller.setScrollTop(deltaY);
  }

  mousedown(event) {
    const {controller} = this.editor;
    const x = event.offsetX;
    const y = event.offsetY;


    controller.setCursorPositionByViewportPosition({x, y});
    // 聚焦
    controller.focus();
    // 阻止无意义的事件：blur, focus
    event.preventDefault();
  }
}

