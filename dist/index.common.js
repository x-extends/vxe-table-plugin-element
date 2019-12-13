"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginElement = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parseDate(value, props) {
  return value && props.valueFormat ? _xeUtils["default"].toStringDate(value, props.valueFormat) : value;
}

function getFormatDate(value, props, defaultFormat) {
  return _xeUtils["default"].toDateString(parseDate(value, props), props.format || defaultFormat);
}

function getFormatDates(values, props, separator, defaultFormat) {
  return _xeUtils["default"].map(values, function (date) {
    return getFormatDate(date, props, defaultFormat);
  }).join(separator);
}

function equalDaterange(cellValue, data, props, defaultFormat) {
  cellValue = getFormatDate(cellValue, props, defaultFormat);
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat);
}

function matchCascaderData(index, list, values, labels) {
  var val = values[index];

  if (list && values.length > index) {
    _xeUtils["default"].each(list, function (item) {
      if (item.value === val) {
        labels.push(item.label);
        matchCascaderData(++index, item.children, values, labels);
      }
    });
  }
}

function getProps(_ref, _ref2, defaultProps) {
  var $table = _ref.$table;
  var props = _ref2.props;
  return _xeUtils["default"].assign($table.vSize ? {
    size: $table.vSize
  } : {}, defaultProps, props);
}

function getCellEvents(renderOpts, params) {
  var name = renderOpts.name,
      events = renderOpts.events;
  var $table = params.$table;
  var type = 'change';

  switch (name) {
    case 'ElAutocomplete':
      type = 'select';
      break;

    case 'ElInput':
    case 'ElInputNumber':
      type = 'input';
      break;
  }

  var on = _defineProperty({}, type, function (evnt) {
    $table.updateStatus(params);

    if (events && events[type]) {
      events[type](params, evnt);
    }
  });

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
}

function createEditRender(defaultProps) {
  return function (h, renderOpts, params) {
    var row = params.row,
        column = params.column;
    var attrs = renderOpts.attrs;
    var props = getProps(params, renderOpts, defaultProps);
    return [h(renderOpts.name, {
      props: props,
      attrs: attrs,
      model: {
        value: _xeUtils["default"].get(row, column.property),
        callback: function callback(value) {
          _xeUtils["default"].set(row, column.property, value);
        }
      },
      on: getCellEvents(renderOpts, params)
    })];
  };
}

function getFilterEvents(on, renderOpts, params, context) {
  var events = renderOpts.events;

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        params = Object.assign({
          context: context
        }, params);

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
}

function createFilterRender(defaultProps) {
  return function (h, renderOpts, params, context) {
    var column = params.column;
    var name = renderOpts.name,
        attrs = renderOpts.attrs,
        events = renderOpts.events;
    var props = getProps(params, renderOpts);
    var type = 'change';

    switch (name) {
      case 'ElAutocomplete':
        type = 'select';
        break;

      case 'ElInput':
      case 'ElInputNumber':
        type = 'input';
        break;
    }

    return column.filters.map(function (item) {
      return h(name, {
        props: props,
        attrs: attrs,
        model: {
          value: item.data,
          callback: function callback(optionValue) {
            item.data = optionValue;
          }
        },
        on: getFilterEvents(_defineProperty({}, type, function (evnt) {
          handleConfirmFilter(context, column, !!item.data, item);

          if (events && events[type]) {
            events[type](Object.assign({
              context: context
            }, params), evnt);
          }
        }), renderOpts, params, context)
      });
    });
  };
}

function handleConfirmFilter(context, column, checked, item) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
}

function defaultFilterMethod(_ref3) {
  var option = _ref3.option,
      row = _ref3.row,
      column = _ref3.column;
  var data = option.data;

  var cellValue = _xeUtils["default"].get(row, column.property);
  /* eslint-disable eqeqeq */


  return cellValue == data;
}

function renderOptions(h, options, optionProps) {
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return _xeUtils["default"].map(options, function (item, index) {
    return h('el-option', {
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
      },
      key: index
    });
  });
}

function cellText(h, cellValue) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)];
}
/**
 * 渲染函数
 */


var renderMap = {
  ElAutocomplete: {
    autofocus: 'input.el-input__inner',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  ElInput: {
    autofocus: 'input.el-input__inner',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  ElInputNumber: {
    autofocus: 'input.el-input__inner',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  ElSelect: {
    renderEdit: function renderEdit(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
          _renderOpts$optionGro = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
      var row = params.row,
          column = params.column;
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('el-select', {
          props: props,
          attrs: attrs,
          model: {
            value: _xeUtils["default"].get(row, column.property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(row, column.property, cellValue);
            }
          },
          on: getCellEvents(renderOpts, params)
        }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
          return h('el-option-group', {
            props: {
              label: group[groupLabel]
            },
            key: gIndex
          }, renderOptions(h, group[groupOptions], optionProps));
        }))];
      }

      return [h('el-select', {
        props: props,
        attrs: attrs,
        model: {
          value: _xeUtils["default"].get(row, column.property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(row, column.property, cellValue);
          }
        },
        on: getCellEvents(renderOpts, params)
      }, renderOptions(h, options, optionProps))];
    },
    renderCell: function renderCell(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$props = renderOpts.props,
          props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
          _renderOpts$optionPro2 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2,
          _renderOpts$optionGro2 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
      var $table = params.$table,
          row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';

      var cellValue = _xeUtils["default"].get(row, column.property);

      var colid = column.id;
      var rest;
      var cellData;

      if (props.filterable) {
        var fullAllDataRowMap = $table.fullAllDataRowMap;
        var cacheCell = fullAllDataRowMap.has(row);

        if (cacheCell) {
          rest = fullAllDataRowMap.get(row);
          cellData = rest.cellData;

          if (!cellData) {
            cellData = fullAllDataRowMap.get(row).cellData = {};
          }
        }

        if (rest && cellData[colid] && cellData[colid].value === cellValue) {
          return cellData[colid].label;
        }
      }

      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
          var selectItem;

          for (var index = 0; index < optionGroups.length; index++) {
            selectItem = _xeUtils["default"].find(optionGroups[index][groupOptions], function (item) {
              return item[valueProp] === value;
            });

            if (selectItem) {
              break;
            }
          }

          var cellLabel = selectItem ? selectItem[labelProp] : value;

          if (cellData && options && options.length) {
            cellData[colid] = {
              value: cellValue,
              label: cellLabel
            };
          }

          return cellLabel;
        } : function (value) {
          var selectItem = _xeUtils["default"].find(options, function (item) {
            return item[valueProp] === value;
          });

          var cellLabel = selectItem ? selectItem[labelProp] : value;

          if (cellData && options && options.length) {
            cellData[colid] = {
              value: cellValue,
              label: cellLabel
            };
          }

          return cellLabel;
        }).join(';'));
      }

      return cellText(h, '');
    },
    renderFilter: function renderFilter(h, renderOpts, params, context) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro3 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
          _renderOpts$optionGro3 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3;
      var column = params.column;
      var attrs = renderOpts.attrs,
          events = renderOpts.events;
      var props = getProps(params, renderOpts);
      var type = 'change';

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return column.filters.map(function (item) {
          return h('el-select', {
            props: props,
            attrs: attrs,
            model: {
              value: item.data,
              callback: function callback(optionValue) {
                item.data = optionValue;
              }
            },
            on: getFilterEvents(_defineProperty({}, type, function (value) {
              handleConfirmFilter(context, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](Object.assign({
                  context: context
                }, params), value);
              }
            }), renderOpts, params, context)
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('el-option-group', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps));
          }));
        });
      }

      return column.filters.map(function (item) {
        return h('el-select', {
          props: props,
          attrs: attrs,
          model: {
            value: item.data,
            callback: function callback(optionValue) {
              item.data = optionValue;
            }
          },
          on: getFilterEvents({
            change: function change(value) {
              handleConfirmFilter(context, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](Object.assign({
                  context: context
                }, params), value);
              }
            }
          }, renderOpts, params, context)
        }, renderOptions(h, options, optionProps));
      });
    },
    filterMethod: function filterMethod(_ref4) {
      var option = _ref4.option,
          row = _ref4.row,
          column = _ref4.column;
      var data = option.data;
      var property = column.property,
          renderOpts = column.filterRender;
      var _renderOpts$props2 = renderOpts.props,
          props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2;

      var cellValue = _xeUtils["default"].get(row, property);

      if (props.multiple) {
        if (_xeUtils["default"].isArray(cellValue)) {
          return _xeUtils["default"].includeArrays(cellValue, data);
        }

        return data.indexOf(cellValue) > -1;
      }
      /* eslint-disable eqeqeq */


      return cellValue == data;
    }
  },
  ElCascader: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref5, params) {
      var _ref5$props = _ref5.props,
          props = _ref5$props === void 0 ? {} : _ref5$props;
      var row = params.row,
          column = params.column;

      var cellValue = _xeUtils["default"].get(row, column.property);

      var values = cellValue || [];
      var labels = [];
      matchCascaderData(0, props.options, values, labels);
      return cellText(h, (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" ".concat(props.separator || '/', " ")));
    }
  },
  ElDatePicker: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref6, params) {
      var _ref6$props = _ref6.props,
          props = _ref6$props === void 0 ? {} : _ref6$props;
      var row = params.row,
          column = params.column;
      var _props$rangeSeparator = props.rangeSeparator,
          rangeSeparator = _props$rangeSeparator === void 0 ? '-' : _props$rangeSeparator;

      var cellValue = _xeUtils["default"].get(row, column.property);

      switch (props.type) {
        case 'week':
          cellValue = getFormatDate(cellValue, props, 'yyyywWW');
          break;

        case 'month':
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM');
          break;

        case 'year':
          cellValue = getFormatDate(cellValue, props, 'yyyy');
          break;

        case 'dates':
          cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd');
          break;

        case 'daterange':
          cellValue = getFormatDates(cellValue, props, " ".concat(rangeSeparator, " "), 'yyyy-MM-dd');
          break;

        case 'datetimerange':
          cellValue = getFormatDates(cellValue, props, " ".concat(rangeSeparator, " "), 'yyyy-MM-dd HH:ss:mm');
          break;

        case 'monthrange':
          cellValue = getFormatDates(cellValue, props, " ".concat(rangeSeparator, " "), 'yyyy-MM');
          break;

        default:
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd');
      }

      return cellText(h, cellValue);
    },
    renderFilter: function renderFilter(h, renderOpts, params, context) {
      var column = params.column;
      var attrs = renderOpts.attrs,
          events = renderOpts.events;
      var props = getProps(params, renderOpts);
      var type = 'change';
      return column.filters.map(function (item) {
        return h(renderOpts.name, {
          props: props,
          attrs: attrs,
          model: {
            value: item.data,
            callback: function callback(optionValue) {
              item.data = optionValue;
            }
          },
          on: getFilterEvents(_defineProperty({}, type, function (value) {
            handleConfirmFilter(context, column, !!value, item);

            if (events && events[type]) {
              events[type](Object.assign({
                context: context
              }, params), value);
            }
          }), renderOpts, params, context)
        });
      });
    },
    filterMethod: function filterMethod(_ref7) {
      var option = _ref7.option,
          row = _ref7.row,
          column = _ref7.column;
      var data = option.data;
      var renderOpts = column.filterRender;
      var _renderOpts$props3 = renderOpts.props,
          props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3;

      var cellValue = _xeUtils["default"].get(row, column.property);

      if (data) {
        switch (props.type) {
          case 'daterange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd');

          case 'datetimerange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm');

          case 'monthrange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM');

          default:
            return cellValue === data;
        }
      }

      return false;
    }
  },
  ElTimePicker: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref8, params) {
      var _ref8$props = _ref8.props,
          props = _ref8$props === void 0 ? {} : _ref8$props;
      var row = params.row,
          column = params.column;
      var isRange = props.isRange,
          _props$format = props.format,
          format = _props$format === void 0 ? 'hh:mm:ss' : _props$format,
          _props$rangeSeparator2 = props.rangeSeparator,
          rangeSeparator = _props$rangeSeparator2 === void 0 ? '-' : _props$rangeSeparator2;

      var cellValue = _xeUtils["default"].get(row, column.property);

      if (cellValue && isRange) {
        cellValue = _xeUtils["default"].map(cellValue, function (date) {
          return _xeUtils["default"].toDateString(parseDate(date, props), format);
        }).join(" ".concat(rangeSeparator, " "));
      }

      return _xeUtils["default"].toDateString(parseDate(cellValue, props), format);
    }
  },
  ElTimeSelect: {
    renderEdit: createEditRender()
  },
  ElRate: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  ElSwitch: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  },
  ElSlider: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod
  }
};
/**
 * 事件兼容性处理
 */

function handleClearEvent(params, evnt, context) {
  var getEventTargetNode = context.getEventTargetNode;
  var bodyElem = document.body;

  if ( // 远程搜索
  getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag || // 下拉框
  getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag || // 级联
  getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag || getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag || // 日期
  getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag || getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag) {
    return false;
  }
}
/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */


var VXETablePluginElement = {
  install: function install(xtable) {
    var interceptor = xtable.interceptor,
        renderer = xtable.renderer;
    renderer.mixin(renderMap);
    interceptor.add('event.clearFilter', handleClearEvent);
    interceptor.add('event.clearActived', handleClearEvent);
  }
};
exports.VXETablePluginElement = VXETablePluginElement;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement);
}

var _default = VXETablePluginElement;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwib3B0aW9ucyIsIm9wdGlvblByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjZWxsVGV4dCIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0Iiwib3B0aW9uR3JvdXBzIiwib3B0aW9uR3JvdXBQcm9wcyIsImdyb3VwT3B0aW9ucyIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwidW5kZWZpbmVkIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImNoYW5nZSIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkVsQ2FzY2FkZXIiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJFbERhdGVQaWNrZXIiLCJyYW5nZVNlcGFyYXRvciIsIkVsVGltZVBpY2tlciIsImlzUmFuZ2UiLCJFbFRpbWVTZWxlY3QiLCJFbFJhdGUiLCJFbFN3aXRjaCIsIkVsU2xpZGVyIiwiaGFuZGxlQ2xlYXJFdmVudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxTQUFULENBQW1CQyxLQUFuQixFQUErQkMsS0FBL0IsRUFBeUM7QUFDdkMsU0FBT0QsS0FBSyxJQUFJQyxLQUFLLENBQUNDLFdBQWYsR0FBNkJDLG9CQUFRQyxZQUFSLENBQXFCSixL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Q0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULHFCQUFwQjtBQUNEOztlQUVjQSxxQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBwYXJzZURhdGUodmFsdWU6IGFueSwgcHJvcHM6IGFueSk6IGFueSB7XHJcbiAgcmV0dXJuIHZhbHVlICYmIHByb3BzLnZhbHVlRm9ybWF0ID8gWEVVdGlscy50b1N0cmluZ0RhdGUodmFsdWUsIHByb3BzLnZhbHVlRm9ybWF0KSA6IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsOiBhbnkgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzKHsgJHRhYmxlIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG5hbWUsIGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyhvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKVxyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlcihkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXShldm50OiBhbnkpIHtcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCBldm50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dDogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb250ZXh0W2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlOiBzdHJpbmcgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gICAgICBsZXQgcmVzdDogYW55XHJcbiAgICAgIGxldCBjZWxsRGF0YTogYW55XHJcbiAgICAgIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICAgICAgbGV0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICAgICAgbGV0IGNhY2hlQ2VsbDogYW55ID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgICAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xyXG4gICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIHZhciB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgICAgIHZhciBsYWJlbHM6IGFueVtdID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKSlcclxuICAgIH1cclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH06IGFueSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9OiBhbnkgPSBwcm9wc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGNlbGxWYWx1ZSAmJiBpc1JhbmdlKSB7XHJcbiAgICAgICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZTogYW55KSA9PiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoZGF0ZSwgcHJvcHMpLCBmb3JtYXQpKS5qb2luKGAgJHtyYW5nZVNlcGFyYXRvcn0gYClcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQocGFyYW1zOiBhbnksIGV2bnQ6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZ2V0RXZlbnRUYXJnZXROb2RlIH06IGFueSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW06IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXRpbWUtcGFuZWwnKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
