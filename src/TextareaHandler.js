

class Range {
  constructor(startRowIndex, startColIndex, endRowIndex, endColIndex) {
    this.startRowIndex = startRowIndex;
    this.startColIndex = startColIndex;
    this.endRowIndex = endRowIndex;
    this.endColIndex = endColIndex;
  }

  isValid() {
    return typeof this.startRowIndex !== 'undefined'
      && typeof this.startColIndex !== 'undefined'
      && typeof this.endRowIndex !== 'undefined'
      && typeof this.endColIndex !== 'undefined';
  }
}

export default class TextareaHandler {

  constructor(editor) {
    this.editor = editor;
    this.view = editor.view;
    this.model = editor.model;
    this.controller = editor.controller;

    this.compositionRange = null;

    const {textareaElement} = this.view;

    textareaElement.addEventListener('input', this);
    textareaElement.addEventListener('focus', this);
    textareaElement.addEventListener('blur', this);
    textareaElement.addEventListener('input', this);
    textareaElement.addEventListener('change', this);
    textareaElement.addEventListener('keydown', this);

    textareaElement.addEventListener('compositionstart', this);
    textareaElement.addEventListener('compositionupdate', this);
    textareaElement.addEventListener('compositionend', this);

  }

  resetTextareaValue() {
    this.view.textareaElement.value = '';
  }

  handleEvent(event) {
    const type = event.type;
    const handler = this[type];

    if (handler) {
      handler.call(this, event);
    } else {
      console.warn('未处理的事件', event);
    }
  }

  focus() {
    this.editor.controller.setActive(true);
  }

  blur() {
    this.editor.controller.setActive(false);
  }


  /**
   * 处理输入
   * 标准：https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
   */
   input(event) {
    if (event.isComposing) {
      return;
    }

    const handlerName = `_input_${event.inputType}`;
    const handler = this[handlerName];
    if (handler) {
      handler.call(this, event);
    } else {
      // console.warn('未处理的事件', event);
    }
  }

  _input_insertText(event) {
    const rawContent = event.data;
    this.controller.insertContent(rawContent, this.model.getCursorPosition());
    this.resetTextareaValue();
  }

  _input_insertLineBreak(evnet) {
    const rawContent = "\n";
    this.controller.insertContent(rawContent, this.model.getCursorPosition());
    this.resetTextareaValue();
  }

  /**
   * composition
   */
   compositionstart(event) {
    const cursorPosition = this.model.getCursorPosition();
    this.compositionRange = new Range(cursorPosition.rowIndex, cursorPosition.colIndex);
  }
  compositionupdate(event) {
    // 第一次update
    if (this.compositionRange && this.compositionRange.isValid()) {
      this.controller.deleteContent(this.compositionRange);
    }

    this.controller.insertContent(event.data, {
      rowIndex: this.compositionRange.startRowIndex,
      colIndex: this.compositionRange.startColIndex
    });

    const cursorPosition = this.model.getCursorPosition();
    this.compositionRange.endRowIndex = cursorPosition.rowIndex;
    this.compositionRange.endColIndex = cursorPosition.colIndex;
    this.resetTextareaValue();
  }
  compositionend(event) {
    this.compositionRange = null;
    this.resetTextareaValue();
  }

  /**
   * 处理键盘
   */
  keydown(event) {
    const handlerName = `_keydown_${event.key}`;
    const handler = this[handlerName];
    if (handler) {
      handler.call(this, event);
    } else {
      // console.warn('未处理的事件', event);
    }
  }

  _keydown_ArrowRight(event) {
    const cursorPosition = this.model.getCursorPosition();
    this.controller.moveRight(1, cursorPosition);
  }

  _keydown_ArrowLeft(event) {
    const cursorPosition = this.model.getCursorPosition();
    this.controller.moveLeft(1, cursorPosition);
  }

  _keydown_ArrowUp(event) {
    const cursorPosition = this.model.getCursorPosition();
    this.controller.moveUp(1, cursorPosition);
  }

  _keydown_ArrowDown(event) {
    const cursorPosition = this.model.getCursorPosition();
    this.controller.moveDown(1, cursorPosition);
  }

  _keydown_Backspace(event) {

    // 删除一个字符
    const {
      rowIndex: endRowIndex,
      colIndex: endColIndex
    } = this.model.getCursorPosition();

    const content = this.model.getContent();
    let startRowIndex = endRowIndex;
    let startColIndex = endColIndex;
    if (startColIndex > 0) {
      startColIndex--;
    } else {
      startRowIndex--;
      const row = content[startRowIndex];
      // 尽头，不移动了
      if (startRowIndex < 0) {
        startRowIndex = 0;
        startColIndex = 0;
      } else {
        startColIndex = row.length - 1;
      }
    }
    const range = new Range(startRowIndex, startColIndex, endRowIndex, endColIndex);

    this.controller.deleteContent(range);
  }

}

