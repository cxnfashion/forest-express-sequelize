"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _lodash = _interopRequireDefault(require("lodash"));

var _forestExpress = require("forest-express");

var _orm = _interopRequireDefault(require("../utils/orm"));

var _database = _interopRequireDefault(require("../utils/database"));

var _require = require('../utils/query'),
    getReferenceField = _require.getReferenceField;

function QueryBuilder(model, opts, params) {
  var _this = this;

  var schema = _forestExpress.Schemas.schemas[model.name];

  function hasPagination() {
    return params.page && params.page.number;
  }

  this.getSkip = function () {
    if (hasPagination()) {
      return (Number.parseInt(params.page.number, 10) - 1) * _this.getLimit();
    }

    return 0;
  };

  this.getLimit = function () {
    if (hasPagination()) {
      return Number.parseInt(params.page.size, 10) || 10;
    }

    return 10;
  };

  this.getIncludes = function (modelForIncludes, fieldNamesRequested) {
    var includes = [];

    _lodash["default"].values(modelForIncludes.associations).forEach(function (association) {
      if (!fieldNamesRequested || fieldNamesRequested.indexOf(association.as) !== -1) {
        if (['HasOne', 'BelongsTo'].indexOf(association.associationType) > -1) {
          includes.push({
            model: association.target.unscoped(),
            as: association.associationAccessor
          });
        }
      }
    });

    return includes;
  }; // NOTICE: This function supports params such as `id`, `-id` (DESC) and `collection.id`.
  //         It does not handle multiple columns sorting.


  this.getOrder = function (aliasName, aliasSchema) {
    if (!params.sort) {
      return null;
    }

    var order = 'ASC';

    if (params.sort[0] === '-') {
      params.sort = params.sort.substring(1);
      order = 'DESC';
    } // NOTICE: Sequelize version previous to 4.4.2 generate a bad MSSQL query
    //         if users sort the collection on the primary key, so we prevent
    //         that.


    var idField = _lodash["default"].keys(model.primaryKeys)[0];

    if (_database["default"].isMSSQL(opts) && _lodash["default"].includes([idField, "-".concat(idField)], params.sort)) {
      var sequelizeVersion = opts.sequelize.version;

      if (sequelizeVersion !== '4.4.2-forest') {
        return null;
      }
    }

    if (params.sort.indexOf('.') !== -1) {
      // NOTICE: Sort on the belongsTo displayed field
      var sortingParameters = params.sort.split('.');
      var associationName = aliasName ? "".concat(aliasName, "->").concat(sortingParameters[0]) : sortingParameters[0];
      var fieldName = sortingParameters[1];
      var column = getReferenceField(_forestExpress.Schemas.schemas, aliasSchema || schema, associationName, fieldName);
      return [[opts.sequelize.col(column), order]];
    }

    if (aliasName) {
      return [[opts.sequelize.col("".concat(aliasName, ".").concat(_orm["default"].getColumnName(aliasSchema, params.sort))), order]];
    }

    return [[params.sort, order]];
  };
}

module.exports = QueryBuilder;