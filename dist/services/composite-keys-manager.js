"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash"));

var _operators = _interopRequireDefault(require("../utils/operators"));

function CompositeKeysManager(model, schema, record) {
  var GLUE = '|';

  this.getPrimaryKeyValues = function getPrimaryKeyValues(recordId) {
    var primaryKeyValues = recordId.split(GLUE); // NOTICE: Prevent liana to crash when a composite primary keys is null,
    //         this behaviour should be avoid instead of fixed.

    primaryKeyValues.forEach(function (key, index) {
      if (key === 'null') {
        primaryKeyValues[index] = null;
      }
    });
    return primaryKeyValues;
  };

  this.getRecordsConditions = function getRecordsConditions(recordsIds, options) {
    var _this = this;

    var _Operators = new _operators["default"](options),
        OR = _Operators.OR;

    return (0, _defineProperty2["default"])({}, OR, recordsIds.map(function (recordId) {
      return _this.getRecordConditions(recordId);
    }));
  };

  this.getRecordConditions = function getRecordConditions(recordId) {
    var where = {};
    var primaryKeyValues = this.getPrimaryKeyValues(recordId);

    if (primaryKeyValues.length === _lodash["default"].keys(model.primaryKeys).length) {
      _lodash["default"].keys(model.primaryKeys).forEach(function (primaryKey, index) {
        where[primaryKey] = primaryKeyValues[index];
      });
    }

    return where;
  };

  this.createCompositePrimary = function createCompositePrimary() {
    var compositePrimary = '';

    _lodash["default"].keys(model.primaryKeys).forEach(function (primaryKey, index) {
      // NOTICE: Prevent liana to crash when a composite primary keys is null,
      //         this behaviour should be avoid instead of fixed.
      if (record[primaryKey] === null) {
        record[primaryKey] = 'null';
      }

      if (index === 0) {
        compositePrimary = record[primaryKey];
      } else {
        compositePrimary = compositePrimary + GLUE + record[primaryKey];
      }
    });

    return compositePrimary;
  };
}

module.exports = CompositeKeysManager;