export default class Session {
  constructor(id, title, location) {
    this._id = id;
    this._title = title;
    this._location = location;
    this._talks = [];
  }
  //returns a promise for loading all sessions that resolves with all session objects in an array
  static loadAll() {
    return new Promise(function(resolve, reject) {
      var url = "/sessions/";
      $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
          var sessions = [];
          data.forEach(session => {
            var obj = new Session(session.id, session.title, session.location);
            sessions.push(obj);
          });
          resolve(sessions);
        },
        error: function(a, b, c) {
          reject(Error([a, b, c]));
        }
      });
    });
  }

  get id() {
    return this._id;
  }
  set id(id) {
    this._id = id;
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
  }

  get location() {
    return this._location;
  }
  set location(location) {
    this._location = location;
  }

  get talks() {
    return this._talks;
  }
  set talks(talks) {
    this._talks = talks;
  }

  addTalk(talk) {
    this._talks.push(talk);
  }
}
