export class Context {
  view: any;
  cache: any;
  parent: any;
  constructor (view: any, parentContext: any);
  lookup(name: any): any;
  push(view: any): any;
}
export class Scanner {
  string: any;
  tail: any;
  pos: any;
  constructor (string: any);
  eos(): any;
  scan(re: any): any;
  scanUntil(re: any): any;
}
export class Writer {
  cache: any;
  clearCache(): void;
  escapedValue(token: any, context: any): any;
  parse(template: any, tags: any): any;
  rawValue(token: any): any;
  render(template: any, view: any, partials: any, tags: any): any;
  renderInverted(token: any, context: any, partials: any, originalTemplate: any): any;
  renderPartial(token: any, context: any, partials: any, tags: any): any;
  renderSection(token: any, context: any, partials: any, originalTemplate: any): any;
  renderTokens(tokens: any, context: any, partials: any, originalTemplate: any, tags: any): any;
  unescapedValue(token: any, context: any): any;
}
export function clearCache(): any;
export function escape(string: any): any;
export const name: string;
export function parse(template: any, tags_: any): any;
export function render(template: any, view: any, partials?: any, tags_?: any): any;
export const tags: string[];
export function to_html(template: any, view: any, partials: any, send: any): any;
export const version: string;
