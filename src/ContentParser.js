import {REG_NEW_ROW} from './utils';

export default class ContentParser {
  constructor(editor) {
    this.view = editor.view;
  }


  parse(rawContent = '') {
    const charList = [];

    let index = 0;
    const endIndex = rawContent.length;
    while (index < endIndex) {
      const char = this.parseChar(rawContent[index]);
      index++;
      charList.push(char);
    }

    return charList;
  }

  parseChar(char) {
    return {
      raw: char,
      width: this.measureTextWidth(char)
    };
  }

  layout(charList) {
    const content = [];
    let index = 0;
    const endIndex = charList.length;

    while (index < endIndex) {
      const {
        nextIndex, nextRow
      } = this.layoutNextRow(charList, index);
      index = nextIndex;
      content.push(nextRow);
    }

    return content;
  }

  layoutNextRow(charList, index) {
    const row = [];
    const rowWidthLimit = this.view.rowWidthLimit;
    let rowWidth = 0;
    const endIndex = charList.length;

    while (index < endIndex) {
      const char = charList[index];
      rowWidth = rowWidth + char.width;

      // 换行：换行符，包含字符
      if (REG_NEW_ROW.test(char.raw)) {
        row.push(char);
        index++;
        break;
      }

      // 换行：容不下，不包含字符
      if (rowWidth > rowWidthLimit) {
        break;
      }

      row.push(char);
      index++;
    }

    return {
      nextIndex: index,
      nextRow: row
    }
  }

  measureTextWidth(text) {
    const {ctx, font} = this.view;
    let result = 0;

    ctx.save();
    ctx.font = font;
    result = ctx.measureText(text).width;
    ctx.restore();

    return result;
  }

  // 将 content 转成 charList
  flatContent(content) {
    let charList = [];
    content.forEach((row) => {
      charList = charList.concat(row);
    });

    return charList;
  }
}
