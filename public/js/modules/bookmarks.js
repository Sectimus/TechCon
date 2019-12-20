export default class Bookmarks {
  static add(talkid, time) {
    if (typeof Storage !== "undefined") {
      var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));

      if (bookmarks == null) {
        bookmarks = [];
      }
      if (bookmarks.some(bookmark => bookmark.talkid === talkid)) {
        //bookmark is already saved
        return false;
      }
      bookmarks.push({ talkid: talkid, time: time });
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      return true;
    } else {
      return false;
    }
  }
  static remove(talkid) {
    if (typeof Storage !== "undefined") {
      var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
      if (bookmarks == null) {
        bookmarks = [];
      }
      var removedOne = false;

      for (let i = 0; i < bookmarks.length; i++) {
        if (talkid == bookmarks[i].talkid) {
          bookmarks.splice(i, 1);
          removedOne = true;
        }
      }
      if (removedOne) {
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      }
      return removedOne;
    } else {
      return false;
    }
  }
  static get() {
    if (typeof Storage !== "undefined") {
      var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
      if (bookmarks == null) {
        bookmarks = [];
      }
      return bookmarks;
    } else {
      return false;
    }
  }
}
