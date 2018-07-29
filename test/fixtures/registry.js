'use strict';

module.exports = {
  init: function init() {
    this.items = {};
  },
  set: function set(key, item) {
    this.items[key] = item;
  },
  get: function get(key) {
    return this.items[key];
  },
  getMap: function getMap() {
    return this.items;
  },
  getList: function getList() {
    return Object.keys(this.items).map(key => this.items[key]);
  }
};
