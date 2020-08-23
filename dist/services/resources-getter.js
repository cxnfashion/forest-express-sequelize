"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _forestExpress = require("forest-express");

var _operators = _interopRequireDefault(require("../utils/operators"));

var _compositeKeysManager = _interopRequireDefault(require("./composite-keys-manager"));

var _queryBuilder = _interopRequireDefault(require("./query-builder"));

var _searchBuilder = _interopRequireDefault(require("./search-builder"));

var _liveQueryChecker = _interopRequireDefault(require("./live-query-checker"));

var _errors = require("./errors");

var _filtersParser = _interopRequireDefault(require("./filters-parser"));

function ResourcesGetter(model, options, params) {
  var schema = _forestExpress.Schemas.schemas[model.name];
  var queryBuilder = new _queryBuilder["default"](model, options, params);
  var segmentScope;
  var segmentWhere;
  var OPERATORS = new _operators["default"](options);

  var primaryKey = _lodash["default"].keys(model.primaryKeys)[0];

  var filterParser = new _filtersParser["default"](schema, params.timezone, options);
  var fieldNamesRequested;
  var searchBuilder;

  function getFieldNamesRequested() {
    return _getFieldNamesRequested.apply(this, arguments);
  }

  function _getFieldNamesRequested() {
    _getFieldNamesRequested = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var associations, associationFromSorting;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(!params.fields || !params.fields[model.name])) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", null);

            case 2:
              if (!params.filters) {
                _context3.next = 8;
                break;
              }

              _context3.next = 5;
              return filterParser.getAssociations(params.filters);

            case 5:
              _context3.t0 = _context3.sent;
              _context3.next = 9;
              break;

            case 8:
              _context3.t0 = [];

            case 9:
              associations = _context3.t0;

              if (params.sort && params.sort.includes('.')) {
                associationFromSorting = params.sort.split('.')[0];

                if (associationFromSorting[0] === '-') {
                  associationFromSorting = associationFromSorting.substring(1);
                }

                associations.push(associationFromSorting);
              } // NOTICE: Force the primaryKey retrieval to store the records properly in the client.


              return _context3.abrupt("return", _lodash["default"].union([primaryKey], params.fields[model.name].split(','), associations));

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _getFieldNamesRequested.apply(this, arguments);
  }

  function getSearchBuilder() {
    if (searchBuilder) {
      return searchBuilder;
    }

    searchBuilder = new _searchBuilder["default"](model, options, params, fieldNamesRequested);
    return searchBuilder;
  }

  var hasSmartFieldSearch = false;

  function handleFilterParams() {
    return _handleFilterParams.apply(this, arguments);
  }

  function _handleFilterParams() {
    _handleFilterParams = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", filterParser.perform(params.filters));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _handleFilterParams.apply(this, arguments);
  }

  function getWhere() {
    return _getWhere.apply(this, arguments);
  }

  function _getWhere() {
    _getWhere = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      var where, queryToFilterRecords, results, recordIds, condition, errorMessage;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              where = {};
              where[OPERATORS.AND] = [];

              if (params.search) {
                where[OPERATORS.AND].push(getSearchBuilder().perform());
              }

              if (!params.filters) {
                _context5.next = 9;
                break;
              }

              _context5.t0 = where[OPERATORS.AND];
              _context5.next = 7;
              return handleFilterParams();

            case 7:
              _context5.t1 = _context5.sent;

              _context5.t0.push.call(_context5.t0, _context5.t1);

            case 9:
              if (segmentWhere) {
                where[OPERATORS.AND].push(segmentWhere);
              }

              if (!params.segmentQuery) {
                _context5.next = 29;
                break;
              }

              queryToFilterRecords = params.segmentQuery.trim();
              new _liveQueryChecker["default"]().perform(queryToFilterRecords); // WARNING: Choosing the first connection might generate issues if the model does not
              //          belongs to this database.

              _context5.prev = 13;
              _context5.next = 16;
              return options.connections[0].query(queryToFilterRecords, {
                type: options.sequelize.QueryTypes.SELECT
              });

            case 16:
              results = _context5.sent;
              recordIds = results.map(function (result) {
                return result[primaryKey] || result.id;
              });
              condition = (0, _defineProperty2["default"])({}, primaryKey, {});
              condition[primaryKey][OPERATORS.IN] = recordIds;
              where[OPERATORS.AND].push(condition);
              return _context5.abrupt("return", where);

            case 24:
              _context5.prev = 24;
              _context5.t2 = _context5["catch"](13);
              errorMessage = "Invalid SQL query for this Live Query segment:\n".concat(_context5.t2.message);

              _forestExpress.logger.error(errorMessage);

              throw new _errors.ErrorHTTP422(errorMessage);

            case 29:
              return _context5.abrupt("return", where);

            case 30:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[13, 24]]);
    }));
    return _getWhere.apply(this, arguments);
  }

  function getRecords() {
    return _getRecords.apply(this, arguments);
  }

  function _getRecords() {
    _getRecords = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      var scope, include;
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.t0 = fieldNamesRequested;

              if (_context6.t0) {
                _context6.next = 5;
                break;
              }

              _context6.next = 4;
              return getFieldNamesRequested();

            case 4:
              _context6.t0 = _context6.sent;

            case 5:
              fieldNamesRequested = _context6.t0;
              scope = segmentScope ? model.scope(segmentScope) : model.unscoped();
              include = queryBuilder.getIncludes(model, fieldNamesRequested);
              return _context6.abrupt("return", getWhere().then(function (where) {
                var findAllOpts = {
                  where: where,
                  include: include,
                  order: queryBuilder.getOrder(),
                  offset: queryBuilder.getSkip(),
                  limit: queryBuilder.getLimit()
                };

                if (params.search) {
                  _lodash["default"].each(schema.fields, function (field) {
                    if (field.search) {
                      try {
                        field.search(findAllOpts, params.search);
                        hasSmartFieldSearch = true;
                      } catch (error) {
                        _forestExpress.logger.error("Cannot search properly on Smart Field ".concat(field.field), error);
                      }
                    }
                  });

                  var fieldsSearched = getSearchBuilder().getFieldsSearched();

                  if (fieldsSearched.length === 0 && !hasSmartFieldSearch) {
                    if (!params.searchExtended || !getSearchBuilder().hasExtendedSearchConditions()) {
                      // NOTICE: No search condition has been set for the current search, no record can be
                      //         found.
                      return [];
                    }
                  }
                }

                return scope.findAll(findAllOpts);
              }));

            case 9:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));
    return _getRecords.apply(this, arguments);
  }

  function countRecords() {
    return _countRecords.apply(this, arguments);
  }

  function _countRecords() {
    _countRecords = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      var scope, include;
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.t0 = fieldNamesRequested;

              if (_context7.t0) {
                _context7.next = 5;
                break;
              }

              _context7.next = 4;
              return getFieldNamesRequested();

            case 4:
              _context7.t0 = _context7.sent;

            case 5:
              fieldNamesRequested = _context7.t0;
              scope = segmentScope ? model.scope(segmentScope) : model.unscoped();
              include = queryBuilder.getIncludes(model, fieldNamesRequested);
              return _context7.abrupt("return", getWhere().then(function (where) {
                var countOptions = {
                  include: include,
                  where: where
                };

                if (!primaryKey) {
                  // NOTICE: If no primary key is found, use * as a fallback for Sequelize.
                  countOptions.col = '*';
                }

                if (params.search) {
                  _lodash["default"].each(schema.fields, function (field) {
                    if (field.search) {
                      try {
                        field.search(countOptions, params.search);
                        hasSmartFieldSearch = true;
                      } catch (error) {
                        _forestExpress.logger.error("Cannot search properly on Smart Field ".concat(field.field), error);
                      }
                    }
                  });

                  var fieldsSearched = getSearchBuilder().getFieldsSearched();

                  if (fieldsSearched.length === 0 && !hasSmartFieldSearch) {
                    if (!params.searchExtended || !getSearchBuilder().hasExtendedSearchConditions()) {
                      // NOTICE: No search condition has been set for the current search, no record can be
                      //         found.
                      return 0;
                    }
                  }
                }

                return scope.count(countOptions);
              }));

            case 9:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));
    return _countRecords.apply(this, arguments);
  }

  function getSegment() {
    if (schema.segments && params.segment) {
      var segment = _lodash["default"].find(schema.segments, function (schemaSegment) {
        return schemaSegment.name === params.segment;
      });

      segmentScope = segment.scope;
      segmentWhere = segment.where;
    }
  }

  function getSegmentCondition() {
    return _getSegmentCondition.apply(this, arguments);
  }

  function _getSegmentCondition() {
    _getSegmentCondition = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              getSegment();

              if (!_lodash["default"].isFunction(segmentWhere)) {
                _context8.next = 3;
                break;
              }

              return _context8.abrupt("return", segmentWhere(params).then(function (where) {
                segmentWhere = where;
              }));

            case 3:
              return _context8.abrupt("return", _bluebird["default"].resolve());

            case 4:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));
    return _getSegmentCondition.apply(this, arguments);
  }

  this.perform = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", getSegmentCondition().then(getRecords).then(function (records) {
              var fieldsSearched = null;

              if (params.search) {
                fieldsSearched = getSearchBuilder().getFieldsSearched();
              }

              if (schema.isCompositePrimary) {
                records.forEach(function (record) {
                  record.forestCompositePrimary = new _compositeKeysManager["default"](model, schema, record).createCompositePrimary();
                });
              }

              return [records, fieldsSearched];
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  this.count = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", getSegmentCondition().then(countRecords));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
}

module.exports = ResourcesGetter;