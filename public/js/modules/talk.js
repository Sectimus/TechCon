export default class Talk {
  constructor(id, speaker, title, description, session, time, tags, ratings) {
    this._id = id;
    this._speaker = speaker;
    this._title = title;
    this._description = description;
    this._session = session;
    this._time = time;
    this._tags = tags;
    this._ratings = ratings;
  }

  //returns a promise for loading all talks that resolves with all talk objects in an array
  static loadAll() {
    return new Promise(function(resolve, reject) {
      var url = "/talks/";
      $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
          var talks = [];
          data.forEach(talk => {
            var obj = new Talk(
              talk.id,
              talk.speaker,
              talk.title,
              talk.description,
              talk.session,
              talk.time,
              talk.tags,
              talk.ratings
            );
            talks.push(obj);
          });
          resolve(talks);
        },
        error: function(a, b, c) {
          reject(Error([a, b, c]));
        }
      });
    });
  }

  //returns a promise for loading all talks by sessionid that resolves with all talk objects in an array
  static loadBySessionId(session) {
    return new Promise(function(resolve, reject) {
      var url = "/talks/session/" + session;
      $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
          var talks = [];
          data.forEach(talk => {
            var obj = new Talk(
              talk.id,
              talk.speaker,
              talk.title,
              talk.description,
              talk.session,
              talk.time,
              talk.tags,
              talk.ratings
            );
            talks.push(obj);
          });
          resolve(talks);
        },
        error: function(a, b, c) {
          reject(Error([a, b, c]));
        }
      });
    });
  }
  //returns a promise for loading all talks by their id that resolves with all talk objects in an array
  static loadById(talk) {
    return new Promise(function(resolve, reject) {
      var url = "/talks/" + talk;
      $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
          var talk = new Talk(
            data[0].id,
            data[0].speaker,
            data[0].title,
            data[0].description,
            data[0].session,
            data[0].time,
            data[0].tags,
            data[0].ratings
          );
          resolve(talk);
        },
        error: function(a, b, c) {
          reject(Error([a, b, c]));
        }
      });
    });
  }

  rate(rating) {
    var url = "/talks/rate/" + this.id + "/" + rating + "/";

    $.ajax({
      url: url,
      method: "GET",
      error: function(a, b, c) {
        alert("Error rating talk");
      }
    });
  }

  get id() {
    return this._id;
  }
  set id(id) {
    this._id = id;
  }

  get speaker() {
    return this._speaker;
  }
  set speaker(speaker) {
    this._speaker = speaker;
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
  }

  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
  }

  get session() {
    return this._session;
  }
  set session(session) {
    this._session = session;
  }

  get time() {
    return this._time;
  }
  set time(time) {
    this._time = time;
  }

  get tags() {
    return this._tags;
  }
  set tags(tags) {
    this._tags = tags;
  }

  get ratings() {
    return this._ratings;
  }
  set ratings(ratings) {
    this._ratings = ratings;
  }
}
