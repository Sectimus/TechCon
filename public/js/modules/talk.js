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

  rate(rating) {
    this._ratings.push(rating);
  }
}
