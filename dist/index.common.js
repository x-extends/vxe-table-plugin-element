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

  var on = _defineProperty({}, type, function () {
    return $table.updateStatus(params);
  });

  if (events) {
    _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }));
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
    _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }));
  }

  return on;
}

function defaultFilterRender(h, renderOpts, params, context) {
  var column = params.column;
  var name = renderOpts.name,
      attrs = renderOpts.attrs;
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
      on: getFilterEvents(_defineProperty({}, type, function () {
        handleConfirmFilter(context, column, !!item.data, item);
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
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);

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
            on: getFilterEvents({
              change: function change(value) {
                handleConfirmFilter(context, column, value && value.length > 0, item);
              }
            }, renderOpts, params)
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
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);
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
          on: getFilterEvents({
            change: function change(value) {
              handleConfirmFilter(context, column, !!value, item);
            }
          }, renderOpts, params)
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsInVwZGF0ZVN0YXR1cyIsIm9iamVjdE1hcCIsImNiIiwiYXJncyIsImFwcGx5IiwiY29uY2F0IiwiZGVmYXVsdEVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJkZWZhdWx0RmlsdGVyUmVuZGVyIiwiY29udGV4dCIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImtleSIsImNlbGxUZXh0IiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwiZ3JvdXBPcHRpb25zIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsInVuZGVmaW5lZCIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjaGFuZ2UiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJFbENhc2NhZGVyIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiRWxEYXRlUGlja2VyIiwicmFuZ2VTZXBhcmF0b3IiLCJFbFRpbWVQaWNrZXIiLCJpc1JhbmdlIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJFbFNsaWRlciIsImhhbmRsZUNsZWFyRXZlbnQiLCJldm50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5FbGVtZW50IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQStCQyxLQUEvQixFQUF5QztBQUN2QyxTQUFPQSxLQUFLLENBQUNDLFdBQU4sR0FBb0JDLG9CQUFRQyxZQUFSLENBQXFCSixLQUFyQixFQUE0QkMsS0FBSyxDQUFDQyxXQUFsQyxDQUFwQixHQUFxRUYsS0FBNUU7QUFDRDs7QUFFRCxTQUFTSyxhQUFULENBQXdCTCxLQUF4QixFQUFvQ0MsS0FBcEMsRUFBZ0RLLGFBQWhELEVBQXFFO0FBQ25FLFNBQU9ILG9CQUFRSSxZQUFSLENBQXFCUixTQUFTLENB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QUFBQSxrQkFBa0IsQ0FBQ0QsSUFBRCxFQUFPRSxRQUFQLEVBQWlCLHVCQUFqQixDQUFsQixDQUE0REcsSUFKNUQsSUFLQUosa0JBQWtCLENBQUNELElBQUQsRUFBT0UsUUFBUCxFQUFpQixtQkFBakIsQ0FBbEIsQ0FBd0RHLElBTHhELElBTUE7QUFDQUosRUFBQUEsa0JBQWtCLENBQUNELElBQUQsRUFBT0UsUUFBUCxFQUFpQixpQkFBakIsQ0FBbEIsQ0FBc0RHLElBVHhELEVBVUU7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMscUJBQXFCLEdBQUc7QUFDbkNDLEVBQUFBLE9BRG1DLG1CQUMxQkMsTUFEMEIsRUFDSDtBQUFBLFFBQ3hCQyxXQUR3QixHQUNFRCxNQURGLENBQ3hCQyxXQUR3QjtBQUFBLFFBQ1hDLFFBRFcsR0FDRUYsTUFERixDQUNYRSxRQURXO0FBRTlCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZWpELFNBQWY7QUFDQStDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNiLGdCQUFyQztBQUNBVSxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDYixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06ICgpID0+ICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRFZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gW1xyXG4gICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJSZW5kZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICBbdHlwZV0gKCkge1xyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xyXG4gICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgY2hhbmdlICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gICAgICB2YXIgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKSlcclxuICAgIH1cclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
