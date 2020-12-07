"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _ = require('lodash');

var Operators = require('../utils/operators');

var orm = require('../utils/orm');

var _require = require('./errors'),
    ErrorHTTP422 = _require.ErrorHTTP422;

function HasManyDissociator(model, association, options, params, data) {
  var OPERATORS = new Operators(options);
  var isDelete = Boolean(params["delete"]);

  this.perform = function () {
    var associatedIds = _.map(data.data, function (value) {
      return value.id;
    });

    return orm.findRecord(model, params.recordId).then(function (record) {
      var removeAssociation = false;

      if (isDelete) {
        _.each(model.associations, function (innerAssociation, associationName) {
          if (associationName === params.associationName) {
            removeAssociation = innerAssociation.associationType === 'belongsToMany';
          }
        });
      } else {
        removeAssociation = true;
      }

      if (removeAssociation) {
        return record["remove".concat(_.upperFirst(params.associationName))](associatedIds);
      }

      return null;
    }).then(function () {
      if (isDelete) {
        var primaryKeys = _.keys(association.primaryKeys);

        var _primaryKeys = (0, _slicedToArray2["default"])(primaryKeys, 1),
            idField = _primaryKeys[0];

        var condition = (0, _defineProperty2["default"])({}, idField, (0, _defineProperty2["default"])({}, OPERATORS.IN, associatedIds));
        return association.destroy({
          where: condition
        });
      }

      return null;
    })["catch"](function (error) {
      throw new ErrorHTTP422(error.message);
    });
  };
}

module.exports = HasManyDissociator;