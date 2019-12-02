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
      var remote = renderOpts.remote,
          options = renderOpts.options,
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

      if (props.remote) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwib3B0aW9ucyIsIm9wdGlvblByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjZWxsVGV4dCIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0Iiwib3B0aW9uR3JvdXBzIiwib3B0aW9uR3JvdXBQcm9wcyIsImdyb3VwT3B0aW9ucyIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJyZW1vdGUiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJ1bmRlZmluZWQiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiRWxDYXNjYWRlciIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsIkVsRGF0ZVBpY2tlciIsInJhbmdlU2VwYXJhdG9yIiwiRWxUaW1lUGlja2VyIiwiaXNSYW5nZSIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5FbGVtZW50IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQStCQyxLQUEvQixFQUF5QztBQUN2QyxTQUFPRCxLQUFLLElBQUlDLEtBQUssQ0FBQ0MsV0FBZixHQUE2QkMsb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJC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QUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZSh2YWx1ZSwgcHJvcHMpLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXModmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhKGluZGV4OiBudW1iZXIsIGxpc3Q6IEFycmF5PGFueT4sIHZhbHVlczogQXJyYXk8YW55PiwgbGFiZWxzOiBBcnJheTxhbnk+KSB7XHJcbiAgbGV0IHZhbDogYW55ID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlcihkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcylcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgbGV0IHR5cGU6IHN0cmluZyA9ICdjaGFuZ2UnXHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0oZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgZXZudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfTogYW55ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQoaDogRnVuY3Rpb24sIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB2b2lkIDAgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBFbEF1dG9jb21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcmVtb3RlLCBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gICAgICBsZXQgcmVzdDogYW55XHJcbiAgICAgIGxldCBjZWxsRGF0YTogYW55XHJcbiAgICAgIGlmIChwcm9wcy5yZW1vdGUpIHtcclxuICAgICAgICBsZXQgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgICAgICBsZXQgY2FjaGVDZWxsOiBhbnkgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCEoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbTogYW55XHJcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbTogYW55ID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICAgICAgfSkuam9pbignOycpKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAnJylcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgY2hhbmdlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfTogYW55ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfTogYW55ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH1cclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgdmFyIGxhYmVsczogYW55W10gPSBbXVxyXG4gICAgICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgICAgbGV0IHsgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfTogYW55ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfTogYW55ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGlzUmFuZ2UsIGZvcm1hdCA9ICdoaDptbTpzcycsIHJhbmdlU2VwYXJhdG9yID0gJy0nIH06IGFueSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNsaWRlcjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfTogYW55ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtdGltZS1wYW5lbCcpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGVsZW1lbnQtdWkg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FbGVtZW50ID0ge1xyXG4gIGluc3RhbGwoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
