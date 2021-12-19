import {REG_NEW_ROW} from './utils';

export default class PositionHelper {
  constructor(editor) {
    this.editor = editor;
  }

  convertCursorPositionToViewportPosition({rowIndex,  colIndex}) {
    const {model, view} = this.editor;
    const rowHeight = view.rowHeight;
    const content = model.getContent();

    if (rowIndex >= content.length) {
      rowIndex = content.length - 1;
    }

    const row = content[rowIndex] || []; // 避免 rowIndex = -1

    let y = view.contentView.y + rowHeight * rowIndex;
    let x = view.contentView.x;

    for (let i = 0; i < colIndex; i++) {
      const char = row[i];
      if (!char) {
        break;
      }
      x = x + char.width;
    }

    return {x, y};
  }

  convertViewportPositionToCursorPosition({x, y}) {
    const {model, view} = this.editor;
    const content = model.getContent();
    const rowHeight = view.rowHeight;

    let offsetY = y - view.contentView.y;
    if (offsetY < 0) {
      offsetY = 0;
    }
    let rowIndex = Math.floor(offsetY / rowHeight);
    if (rowIndex >= content.length) {
      rowIndex = content.length - 1;
    }

    let colIndex = 0;
    const row = content[rowIndex] || [];
    x = x - view.contentView.x;

    while (x > 0) {
      const char = row[colIndex];
      if (!char) {
        break;
      }
      if (REG_NEW_ROW.test(char.raw)) {
        break;
      }

      if (x > char.width) {
        x = x - char.width;
        colIndex++;
        continue;
      }

      if (x > char.width / 2) {
        colIndex++;
        break;
      } else {
        break;
      }
    }

    return {rowIndex, colIndex};
  }
}

