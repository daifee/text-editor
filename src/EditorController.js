import {REG_NEW_ROW} from './utils';
import ContentParser from "./ContentParser";

export default class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.model = editor.model;
    this.view = editor.view;
    this.positionHelper = editor.positionHelper;

    this.cursorPositionX = 0;

    this.parser = new ContentParser(editor);
  }

  setActive(value) {
    this.model.setActive(value)
  }

  setContent(rawContent) {
    const charList = this.parser.parse(rawContent);
    const content = this.parser.layout(charList);
    this.model.setContent(content);
  }

  focus() {
    this.view.textareaElement.focus();
  }

  blur() {
    this.view.textareaElement.blur();
  }

  setScrollTop(deltaTop) {
    const {view} = this.editor;
    if (deltaTop === 0) {
      return;
    }
    let scrollTop = this.model.getScrollTop() + deltaTop;
    if (scrollTop < 0) {
      scrollTop = 0;
    }

    if (view.height >= view.contentHeight) {
      scrollTop = 0;
    } else {
      const max = view.contentHeight - view.height;
      if (scrollTop > max) {
        scrollTop = max;
      }
    }

    if (this.model.getScrollTop() === scrollTop) {
      return;
    }


    this.model.setScrollTop(scrollTop);
  }

  setCursorPositionByViewportPosition({x, y}) {
    const cursorPosition = this.positionHelper.convertViewportPositionToCursorPosition({x, y});
    this.setCursorPosition(cursorPosition);
  }



  moveRight(steps = 0, cursorPosition) {
    let {rowIndex, colIndex} = cursorPosition;
    const content = this.model.getContent();

    while (steps > 0) {
      steps--;
      const row = content[rowIndex] || [];
      // 移动到这个字符后面
      const char = row[colIndex];

      // 字符不存在（其实是下一行首字符
      if (!char) {
        // 尽头，不能再移动了
        if (rowIndex === content.length - 1) {
          break;
        }

        colIndex = 1;
        rowIndex++;
      } else if (REG_NEW_ROW.test(char.raw)) { // 换行符
        if (rowIndex === content.length - 1) {
          break;
        }

        colIndex = 0;
        rowIndex++;
      } else {
        colIndex++;
      }
    }

    this.setCursorPosition({rowIndex, colIndex});
  }

  moveLeft(steps = 0, cursorPosition) {
    let {rowIndex, colIndex} = cursorPosition;
    const content = this.model.getContent();

    while (steps > 0) {
      steps--;
      colIndex--;
      // 行内移动尽头；移到上一行
      if (colIndex < 0) {
        rowIndex--;
        const row = content[rowIndex];
        // 内容移动尽头
        if (rowIndex < 0 || !row) {
          rowIndex = 0;
          colIndex = 0;
          break;
        }
        // 在最后一个字符前面（可以是换行符）
        colIndex = row.length === 0 ? 0 : row.length - 1;
      }
    }

    this.setCursorPosition({rowIndex, colIndex});
  }

  moveUp(steps = 0, cursorPosition) {
    let {rowIndex, colIndex} = cursorPosition;
    rowIndex = rowIndex - steps;
    if (rowIndex < 0) {
      rowIndex = 0;
    }

    let {x, y} = this.positionHelper.convertCursorPositionToViewportPosition({rowIndex, colIndex});
    x = this.cursorPositionX;

    cursorPosition = this.editor.positionHelper.convertViewportPositionToCursorPosition({x, y});
    this.setCursorPosition(cursorPosition, false);
  }

  moveDown(steps = 0, cursorPosition) {
    let {rowIndex, colIndex} = cursorPosition;

    const content = this.model.getContent();
    const maxRowIndex = content.length - 1;
    rowIndex = rowIndex + steps;

    if (rowIndex > maxRowIndex) {
      rowIndex = maxRowIndex;
    }

    let {x, y} = this.positionHelper.convertCursorPositionToViewportPosition({rowIndex, colIndex});
    x = this.cursorPositionX;

    cursorPosition = this.editor.positionHelper.convertViewportPositionToCursorPosition({x, y});
    this.setCursorPosition(cursorPosition, false);
  }

  setCursorPosition(cursorPosition, cache = true) {
    const positionHelper = this.positionHelper;
    const cursorViewportPosition = positionHelper.convertCursorPositionToViewportPosition(cursorPosition);

    const view = this.view;
    const cursorHeight = this.view.rowHeight;
    let scrollTop = this.model.getScrollTop();

    if (cursorViewportPosition.y < view.y) {
      const offset = view.y - cursorViewportPosition.y;
      scrollTop = scrollTop - offset;
    } else if (cursorViewportPosition.y + cursorHeight > view.height) {
      const offset = cursorViewportPosition.y + cursorHeight - view.height;
      scrollTop = scrollTop + offset;
    }
    this.model.setScrollTop(scrollTop);

    //
    if (cache) {
      this.cursorPositionX = cursorViewportPosition.x;
    }
    this.model.setCursorPosition(cursorPosition);
  }

  insertContent(rawContent, cursorPosition) {
    const {rowIndex, colIndex} = cursorPosition;
    let content = this.model.getContent();

    const unchangedContent = content.slice(0, rowIndex);
    let changedContent = content.slice(rowIndex);

    // 重新布局改变的内容
    let changedCharList = this.parser.flatContent(changedContent);
    const left = changedCharList.slice(0, colIndex);
    const right = changedCharList.slice(colIndex);
    const center = this.parser.parse(rawContent);
    // 插入
    changedCharList = left.concat(center).concat(right);
    // 布局
    changedContent = this.parser.layout(changedCharList);
    // 合并内容
    content = unchangedContent.concat(changedContent);

    this.model.setContent(content);
    this.moveRight(center.length, cursorPosition);
  }

  // 删除内容
  deleteContent(range) {
    const {startRowIndex, startColIndex, endRowIndex, endColIndex} = range;
    let content = this.model.getContent();
    const charList = [];

    // 不删除
    if (startRowIndex === endRowIndex && startColIndex === endColIndex) {
      return;
    }

    content.forEach((row, rowIndex) => {
      row.forEach((char, colIndex) => {
        if (startRowIndex > rowIndex || endRowIndex < rowIndex) {
          charList.push(char);
          return;
        }

        if (startRowIndex === rowIndex && startColIndex > colIndex) {
          charList.push(char);
          return;
        }

        if (endRowIndex === rowIndex && endColIndex <= colIndex) {
          charList.push(char);
          return;
        }
      });
    });

    // 移动位置
    this.setCursorPosition({
      rowIndex: startRowIndex,
      colIndex: startColIndex
    });

    content = this.parser.layout(charList);
    this.model.setContent(content);
  }

}
