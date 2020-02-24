import {newViewOption} from '@/main/native/build';
import {encode} from '@/main/native/encode';
import {EventProxy} from '@/main/native/event-proxy';

let activeWindowid = -1;
const eventProxy = new EventProxy({});
eventProxy.todo('window-view-focus', ({windowid}: {windowid: number}) => {
  activeWindowid = windowid;
});
export const searchText = (link: string, text: string, utf8 = true) => {
  text = text.substr(0, 200);
  eventProxy.do(`window-add-view-${ activeWindowid }`, {
    ...newViewOption,
    uri: `${ link }${ encode(text, utf8 ? 'utf-8' : 'gbk') }`
  });
};
