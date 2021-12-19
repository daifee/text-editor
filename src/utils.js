

export const REG_NEW_ROW = /\r\n|\r|\n/;


export const LAST_CHAR_OBJ = {
  raw: '',
  width: 0
};

export function assignStyle(el, style) {
  Object.keys(style).forEach((attr) => {
    el.style[attr] = style[attr];
  });
}
