'use strict';

module.exports = {
  build: function build(definitions) {
    return {
      definitions,
      addDefinitions: function addDefinitions(newDefinitions) {
        this.definitions = this.definitions.concat(newDefinitions);
      }
    };
  }
};
