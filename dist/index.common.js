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
          events[type](Object.assign({
            context: context
          }, params), evnt);
        }
      }), renderOpts, params, context)
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImRlZmF1bHRFZGl0UmVuZGVyIiwiaCIsInJvdyIsImNvbHVtbiIsImF0dHJzIiwibW9kZWwiLCJnZXQiLCJwcm9wZXJ0eSIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImRlZmF1bHRGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsImZpbHRlck11bHRpcGxlIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsIm9wdGlvbiIsInJlbmRlck9wdGlvbnMiLCJvcHRpb25zIiwib3B0aW9uUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJkaXNhYmxlZFByb3AiLCJkaXNhYmxlZCIsImtleSIsImNlbGxUZXh0IiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwiZ3JvdXBPcHRpb25zIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsInVuZGVmaW5lZCIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjaGFuZ2UiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJFbENhc2NhZGVyIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiRWxEYXRlUGlja2VyIiwicmFuZ2VTZXBhcmF0b3IiLCJFbFRpbWVQaWNrZXIiLCJpc1JhbmdlIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJFbFNsaWRlciIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwieHRhYmxlIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7O0FBR0EsU0FBU0EsU0FBVCxDQUFtQkMsS0FBbkIsRUFBK0JDLEtBQS9CLEVBQXlDO0FBQ3ZDLFNBQU9ELEtBQUssSUFBSUMsS0FBSyxDQUFDQyxXQUFmLEdBQTZCQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0MsV0FBbEMsQ0FBN0IsR0FBOEVGLEtBQXJGO0FBQ0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF1QkwsS0FBdkIsRUFBbUNDLEtBQW5DLEVBQStDSyxhQUEv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LFFBQ3ZCQyxXQUR1QixHQUNHRCxNQURILENBQ3ZCQyxXQUR1QjtBQUFBLFFBQ1ZDLFFBRFUsR0FDR0YsTUFESCxDQUNWRSxRQURVO0FBRTdCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZWhELFNBQWY7QUFDQThDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZSh2YWx1ZSwgcHJvcHMpLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXModmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhKGluZGV4OiBudW1iZXIsIGxpc3Q6IEFycmF5PGFueT4sIHZhbHVlczogQXJyYXk8YW55PiwgbGFiZWxzOiBBcnJheTxhbnk+KSB7XHJcbiAgbGV0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEVkaXRSZW5kZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBhdHRycyxcclxuICAgICAgbW9kZWw6IHtcclxuICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgIGNhbGxiYWNrKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlclJlbmRlcihoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgIFt0eXBlXShldm50OiBhbnkpIHtcclxuICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIWl0ZW0uZGF0YSwgaXRlbSlcclxuICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCBldm50KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQ6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayhjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2soY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGxldCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKCEoY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiBudWxsXHJcbiAgICAgICAgfSkuam9pbignOycpKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAnJylcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgY2hhbmdlKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICB2YXIgdmFsdWVzID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgICAgIHZhciBsYWJlbHM6IEFycmF5PGFueT4gPSBbXVxyXG4gICAgICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckNlbGwoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgbGV0IHsgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGNlbGxWYWx1ZSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0odmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKVxyXG4gICAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyQ2VsbChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50KHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9ID0gY29udGV4dFxyXG4gIGxldCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC10aW1lLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
