"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Interface = require('forest-express');

var CompositeKeysManager = require('./composite-keys-manager');

var _require = require('./errors'),
    InvalidParameterError = _require.InvalidParameterError;

function ResourcesRemover(model, ids, options) {
  this.perform = function () {
    if (!Array.isArray(ids) || !ids.length) {
      throw new InvalidParameterError('`ids` must be a non-empty array.');
    }

    var schema = Interface.Schemas.schemas[model.name];
    var compositeKeysManager = new CompositeKeysManager(model);
    var where = schema.isCompositePrimary ? compositeKeysManager.getRecordsConditions(ids, options) : (0, _defineProperty2["default"])({}, schema.idField, ids);
    return model.destroy({
      where: where
    });
  };
}

module.exports = ResourcesRemover;