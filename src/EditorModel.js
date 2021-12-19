import { LAST_CHAR_OBJ } from "./utils";


export default class EditorModel {
  constructor(listener) {
    this.listener = listener;

    this._data = {
      scrollTop: 0,
      content: [
        [LAST_CHAR_OBJ]
      ],
      active: false,
      cursorPosition: {rowIndex: 0, colIndex: 0},
      /**
       * ```
       * {
       *   startRowIndex: 0,
       *   startColIndex: 0,
       *   endRowIndex: 0,
       *   endColIndex: 0,
       * }
       * ```
       */
      selection: null
    };
  }

  get(key) {
    return this._data[key];
  }

  set(key, value, silent = false) {
    this._data[key] = value;

    if (silent === false) {
      this.listener(this);
    }
  }

  getScrollTop() {
    return this.get('scrollTop');
  }
  setScrollTop(value, silent) {
    this.set('scrollTop', value, silent);
  }

  getContent() {
    return this.get('content');
  }
  setContent(value, silent) {
    // 最后一个字符
    const rowIndex = value.length > 0 ? value.length - 1 : 0;
    let row = value[rowIndex];
    if (!row) {
      row = [];
      value.push(row);
    }
    const colIndex = row.length > 0 ? row.length - 1 : 0;
    const char = row[colIndex];
    if (char !== LAST_CHAR_OBJ) {
      row.push(LAST_CHAR_OBJ);
    }

    this.set('content', value, silent);
  }

  getActive() {
    return this.get('active');
  }
  setActive(value, silent) {
    this.set('active', value, silent);
  }

  getCursorPosition() {
    return this.get('cursorPosition');
  }
  setCursorPosition(value, silent) {
    this.set('cursorPosition', value, silent);
  }

  getSelection() {
    return this.get('selection');
  }
  setSelection(value, silent) {
    this.set('selection', value, silent);
  }
}

