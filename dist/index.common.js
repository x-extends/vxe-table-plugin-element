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
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImRlZmF1bHRFZGl0UmVuZGVyIiwiaCIsInJvdyIsImNvbHVtbiIsImF0dHJzIiwibW9kZWwiLCJnZXQiLCJwcm9wZXJ0eSIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiZGVmYXVsdEZpbHRlclJlbmRlciIsImNvbnRleHQiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsImZpbHRlck11bHRpcGxlIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsIm9wdGlvbiIsInJlbmRlck9wdGlvbnMiLCJvcHRpb25zIiwib3B0aW9uUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJkaXNhYmxlZFByb3AiLCJkaXNhYmxlZCIsImtleSIsImNlbGxUZXh0IiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwiZ3JvdXBPcHRpb25zIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsInVuZGVmaW5lZCIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjaGFuZ2UiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJFbENhc2NhZGVyIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiRWxEYXRlUGlja2VyIiwicmFuZ2VTZXBhcmF0b3IiLCJFbFRpbWVQaWNrZXIiLCJpc1JhbmdlIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJFbFNsaWRlciIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwieHRhYmxlIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7O0FBR0EsU0FBU0EsU0FBVCxDQUFtQkMsS0FBbkIsRUFBK0JDLEtBQS9CLEVBQXlDO0FBQ3ZDLFNBQU9ELEtBQUssSUFBSUMsS0FBSyxDQUFDQyxXQUFmLEdBQTZCQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0MsV0FBbEMsQ0FBN0IsR0FBOEVGLEtBQXJGO0FBQ0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF1QkwsS0FBdkIsRUFBbUNDLEtBQW5DLEVBQStDSyxhQUEvQyxFQUFvRTtB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LFFBQVAsRUFBaUIsb0JBQWpCLENBQWxCLENBQXlERyxJQUZ6RCxJQUdBO0FBQ0FKLEVBQUFBLGtCQUFrQixDQUFDMUUsSUFBRCxFQUFPMkUsUUFBUCxFQUFpQix1QkFBakIsQ0FBbEIsQ0FBNERHLElBSjVELElBS0FKLGtCQUFrQixDQUFDMUUsSUFBRCxFQUFPMkUsUUFBUCxFQUFpQixtQkFBakIsQ0FBbEIsQ0FBd0RHLElBTHhELElBTUE7QUFDQUosRUFBQUEsa0JBQWtCLENBQUMxRSxJQUFELEVBQU8yRSxRQUFQLEVBQWlCLGlCQUFqQixDQUFsQixDQUFzREcsSUFUeEQsRUFVRTtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7QUFHTyxJQUFNQyxxQkFBcUIsR0FBRztBQUNuQ0MsRUFBQUEsT0FEbUMsbUJBQzNCQyxNQUQyQixFQUNKO0FBQUEsUUFDdkJDLFdBRHVCLEdBQ0dELE1BREgsQ0FDdkJDLFdBRHVCO0FBQUEsUUFDVkMsUUFEVSxHQUNHRixNQURILENBQ1ZFLFFBRFU7QUFFN0JBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlaEQsU0FBZjtBQUNBOEMsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1osZ0JBQXJDO0FBQ0FTLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NaLGdCQUF0QztBQUNEO0FBTmtDLENBQTlCOzs7QUFTUCxJQUFJLE9BQU9hLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULHFCQUFwQjtBQUNEOztlQUVjQSxxQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBwYXJzZURhdGUodmFsdWU6IGFueSwgcHJvcHM6IGFueSk6IGFueSB7XHJcbiAgcmV0dXJuIHZhbHVlICYmIHByb3BzLnZhbHVlRm9ybWF0ID8gWEVVdGlscy50b1N0cmluZ0RhdGUodmFsdWUsIHByb3BzLnZhbHVlRm9ybWF0KSA6IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG5hbWUsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RWRpdFJlbmRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gW1xyXG4gICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgY2FsbGJhY2sodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyhvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJSZW5kZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICBsZXQgdHlwZSA9ICdjaGFuZ2UnXHJcbiAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBhdHRycyxcclxuICAgICAgbW9kZWw6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgIGNhbGxiYWNrKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICBbdHlwZV0oZXZudDogYW55KSB7XHJcbiAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKCEoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSkuam9pbignOycpKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAnJylcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gICAgICB2YXIgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKSlcclxuICAgIH1cclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgYXR0cnMsIGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50KHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
