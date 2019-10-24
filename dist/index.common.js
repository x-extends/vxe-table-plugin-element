"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginElement = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parseDate(value, props) {
  return props.valueFormat ? _xeUtils["default"].toStringDate(value, props.valueFormat) : value;
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

function getProps(_ref, _ref2) {
  var $table = _ref.$table;
  var props = _ref2.props;
  return _xeUtils["default"].assign($table.vSize ? {
    size: $table.vSize
  } : {}, props);
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
    _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
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

function defaultEditRender(h, renderOpts, params) {
  var row = params.row,
      column = params.column;
  var attrs = renderOpts.attrs;
  var props = getProps(params, renderOpts);
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
}

function getFilterEvents(on, renderOpts, params) {
  var events = renderOpts.events;

  if (events) {
    _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
}

function defaultFilterRender(h, renderOpts, params, context) {
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
          events[type](params, evnt);
        }
      }), renderOpts, params)
    });
  });
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
  return _xeUtils["default"].map(options, function (item, index) {
    return h('el-option', {
      props: {
        value: item[valueProp],
        label: item[labelProp]
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
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  ElInput: {
    autofocus: 'input.el-input__inner',
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  ElInputNumber: {
    autofocus: 'input.el-input__inner',
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
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
      var row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';

      var cellValue = _xeUtils["default"].get(row, column.property);

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

          return selectItem ? selectItem[labelProp] : null;
        } : function (value) {
          var selectItem = _xeUtils["default"].find(options, function (item) {
            return item[valueProp] === value;
          });

          return selectItem ? selectItem[labelProp] : null;
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
                events[type](params, value);
              }
            }), renderOpts, params)
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
                events[type](params, value);
              }
            }
          }, renderOpts, params)
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
    renderEdit: defaultEditRender,
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
    renderEdit: defaultEditRender,
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
              events[type](params, value);
            }
          }), renderOpts, params)
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
    renderEdit: defaultEditRender,
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
    renderEdit: defaultEditRender
  },
  ElRate: {
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  ElSwitch: {
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  ElSlider: {
    renderDefault: defaultEditRender,
    renderEdit: defaultEditRender,
    renderFilter: defaultFilterRender,
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
  getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImRlZmF1bHRFZGl0UmVuZGVyIiwiaCIsInJvdyIsImNvbHVtbiIsImF0dHJzIiwibW9kZWwiLCJnZXQiLCJwcm9wZXJ0eSIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiZGVmYXVsdEZpbHRlclJlbmRlciIsImNvbnRleHQiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsImZpbHRlck11bHRpcGxlIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsIm9wdGlvbiIsInJlbmRlck9wdGlvbnMiLCJvcHRpb25zIiwib3B0aW9uUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJrZXkiLCJjZWxsVGV4dCIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0Iiwib3B0aW9uR3JvdXBzIiwib3B0aW9uR3JvdXBQcm9wcyIsImdyb3VwT3B0aW9ucyIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJ1bmRlZmluZWQiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiRWxDYXNjYWRlciIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsIkVsRGF0ZVBpY2tlciIsInJhbmdlU2VwYXJhdG9yIiwiRWxUaW1lUGlja2VyIiwiaXNSYW5nZSIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5FbGVtZW50IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQStCQyxLQUEvQixFQUF5QztBQUN2QyxTQUFPQSxLQUFLLENBQUNDLFdBQU4sR0FBb0JDLG9CQUFRQyxZQUFSLENBQXFCSixLQUFyQixFQUE0QkMsS0FBSyxDQUFDQyxXQUFsQyxDQUFwQixHQUFxRUYsS0FBNUU7QUFDRDs7QUFFRCxTQUFTSyxhQUFULENBQXdCTCxLQUF4QixFQUFvQ0MsS0FBcEMsRUFBZ0RLLGFBQWhELEVBQXFFO0FBQ25FLFNBQU9ILG9CQUFRSSxZQUFSLENBQXFCUixTQUFTLENB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QWpCLENBQWxCLENBQXdERyxJQUx4RCxJQU1BO0FBQ0FKLEVBQUFBLGtCQUFrQixDQUFDeEUsSUFBRCxFQUFPeUUsUUFBUCxFQUFpQixpQkFBakIsQ0FBbEIsQ0FBc0RHLElBVHhELEVBVUU7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMscUJBQXFCLEdBQUc7QUFDbkNDLEVBQUFBLE9BRG1DLG1CQUMxQkMsTUFEMEIsRUFDSDtBQUFBLFFBQ3hCQyxXQUR3QixHQUNFRCxNQURGLENBQ3hCQyxXQUR3QjtBQUFBLFFBQ1hDLFFBRFcsR0FDRUYsTUFERixDQUNYRSxRQURXO0FBRTlCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZWhELFNBQWY7QUFDQThDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihcclxuICAgICAge30sIFxyXG4gICAgICBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgICB9KSwgXHJcbiAgICAgIG9uXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RWRpdFJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBhdHRycyxcclxuICAgICAgbW9kZWw6IHtcclxuICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9KVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzIChvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlclJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICBsZXQgdHlwZSA9ICdjaGFuZ2UnXHJcbiAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBhdHRycyxcclxuICAgICAgbW9kZWw6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgW3R5cGVdIChldm50OiBhbnkpIHtcclxuICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdm9pZCAwID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKCEoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSkuam9pbignOycpKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAnJylcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgY2hhbmdlICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIHZhciB2YWx1ZXMgPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgdmFyIGxhYmVsczogQXJyYXk8YW55PiA9IFtdXHJcbiAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgKHByb3BzLnNob3dBbGxMZXZlbHMgPT09IGZhbHNlID8gbGFiZWxzLnNsaWNlKGxhYmVscy5sZW5ndGggLSAxLCBsYWJlbHMubGVuZ3RoKSA6IGxhYmVscykuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYCkpXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGNlbGxWYWx1ZSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGNlbGxWYWx1ZSAmJiBpc1JhbmdlKSB7XHJcbiAgICAgICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZTogYW55KSA9PiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoZGF0ZSwgcHJvcHMpLCBmb3JtYXQpKS5qb2luKGAgJHtyYW5nZVNlcGFyYXRvcn0gYClcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyXHJcbiAgfSxcclxuICBFbFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNsaWRlcjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBhbnksIGV2bnQ6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZ2V0RXZlbnRUYXJnZXROb2RlIH0gPSBjb250ZXh0XHJcbiAgbGV0IGJvZHlFbGVtID0gZG9jdW1lbnQuYm9keVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGVsZW1lbnQtdWkg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FbGVtZW50ID0ge1xyXG4gIGluc3RhbGwgKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
