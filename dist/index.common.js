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

function createFormItemRender(defaultProps) {
  return function (h, renderOpts, params, context) {
    var data = params.data,
        field = params.field;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormProps(context, renderOpts, defaultProps);
    return [h(name, {
      attrs: attrs,
      props: props,
      model: {
        value: _xeUtils["default"].get(data, field),
        callback: function callback(value) {
          _xeUtils["default"].set(data, field, value);
        }
      },
      on: getFormEvents(renderOpts, params, context)
    })];
  };
}

function getFormProps(_ref4, _ref5, defaultProps) {
  var $form = _ref4.$form;
  var props = _ref5.props;
  return _xeUtils["default"].assign($form.vSize ? {
    size: $form.vSize
  } : {}, defaultProps, props);
}

function getFormEvents(renderOpts, params, context) {
  var events = renderOpts.events;
  var on;

  if (events) {
    on = _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        cb.apply(null, [params].concat.apply(params, args));
      };
    }), on);
  }

  return on;
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
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  ElInput: {
    autofocus: 'input.el-input__inner',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  ElInputNumber: {
    autofocus: 'input.el-input__inner',
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
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
    filterMethod: function filterMethod(_ref6) {
      var option = _ref6.option,
          row = _ref6.row,
          column = _ref6.column;
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
    },
    renderItem: function renderItem(h, renderOpts, params, context) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro4 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormProps(context, renderOpts);

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('el-select', {
          props: props,
          attrs: attrs,
          model: {
            value: _xeUtils["default"].get(data, property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(data, property, cellValue);
            }
          },
          on: getFormEvents(renderOpts, params, context)
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
          value: _xeUtils["default"].get(data, property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(data, property, cellValue);
          }
        },
        on: getFormEvents(renderOpts, params, context)
      }, renderOptions(h, options, optionProps))];
    }
  },
  ElCascader: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref7, params) {
      var _ref7$props = _ref7.props,
          props = _ref7$props === void 0 ? {} : _ref7$props;
      var row = params.row,
          column = params.column;

      var cellValue = _xeUtils["default"].get(row, column.property);

      var values = cellValue || [];
      var labels = [];
      matchCascaderData(0, props.options, values, labels);
      return cellText(h, (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" ".concat(props.separator || '/', " ")));
    },
    renderItem: createFormItemRender()
  },
  ElDatePicker: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref8, params) {
      var _ref8$props = _ref8.props,
          props = _ref8$props === void 0 ? {} : _ref8$props;
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
    filterMethod: function filterMethod(_ref9) {
      var option = _ref9.option,
          row = _ref9.row,
          column = _ref9.column;
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
    },
    renderItem: createFormItemRender()
  },
  ElTimePicker: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, _ref10, params) {
      var _ref10$props = _ref10.props,
          props = _ref10$props === void 0 ? {} : _ref10$props;
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
    },
    renderItem: createFormItemRender()
  },
  ElTimeSelect: {
    renderEdit: createEditRender(),
    renderItem: createFormItemRender()
  },
  ElRate: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  ElSwitch: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
  },
  ElSlider: {
    renderDefault: createEditRender(),
    renderEdit: createEditRender(),
    renderFilter: createFilterRender(),
    filterMethod: defaultFilterMethod,
    renderItem: createFormItemRender()
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJjb250ZXh0IiwiT2JqZWN0IiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwib3B0aW9ucyIsIm9wdGlvblByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjZWxsVGV4dCIsImNyZWF0ZUZvcm1JdGVtUmVuZGVyIiwiZmllbGQiLCJnZXRGb3JtUHJvcHMiLCJnZXRGb3JtRXZlbnRzIiwiJGZvcm0iLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwiZ3JvdXBPcHRpb25zIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJ1bmRlZmluZWQiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiRWxDYXNjYWRlciIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsIkVsRGF0ZVBpY2tlciIsInJhbmdlU2VwYXJhdG9yIiwiRWxUaW1lUGlja2VyIiwiaXNSYW5nZSIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJoYW5kbGVDbGVhckV2ZW50IiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiYm9keUVsZW0iLCJkb2N1bWVudCIsImJvZHkiLCJmbGFnIiwiVlhFVGFibGVQbHVnaW5FbGVtZW50IiwiaW5zdGFsbCIsInh0YWJsZSIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUdBLFNBQVNBLFNBQVQsQ0FBb0JDLEtBQXBCLEVB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QUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55KTogYW55IHtcclxuICByZXR1cm4gdmFsdWUgJiYgcHJvcHMudmFsdWVGb3JtYXQgPyBYRVV0aWxzLnRvU3RyaW5nRGF0ZSh2YWx1ZSwgcHJvcHMudmFsdWVGb3JtYXQpIDogdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogQXJyYXk8YW55PiwgdmFsdWVzOiBBcnJheTxhbnk+LCBsYWJlbHM6IEFycmF5PGFueT4pIHtcclxuICBsZXQgdmFsOiBhbnkgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgbmFtZSwgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGU6IHN0cmluZyA9ICdjaGFuZ2UnXHJcbiAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0gKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAoY29udGV4dDogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb250ZXh0W2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfTogYW55ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ2VsLW9wdGlvbicsIHtcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgZGF0YSwgZmllbGQgfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHsgYXR0cnMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMoY29udGV4dCwgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBmaWVsZCksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBmaWVsZCwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgbGV0IG9uXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgb24gPSBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gICAgICBsZXQgcmVzdDogYW55XHJcbiAgICAgIGxldCBjZWxsRGF0YTogYW55XHJcbiAgICAgIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICAgICAgbGV0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICAgICAgbGV0IGNhY2hlQ2VsbDogYW55ID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgICAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xyXG4gICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueVxyXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBsZXQgdHlwZSA9ICdjaGFuZ2UnXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKGNvbnRleHQsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWw6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICAgICAgdmFyIGxhYmVsczogYW55W10gPSBbXVxyXG4gICAgICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHsgcHJvcHMgPSB7fSB9OiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9OiBhbnkgPSBwcm9wc1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGNlbGxWYWx1ZSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhdmFsdWUsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpLCB2YWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfTogYW55ID0gY29sdW1uXHJcbiAgICAgIGxldCB7IHByb3BzID0ge30gfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgICAgbGV0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfTogYW55ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChjZWxsVmFsdWUgJiYgaXNSYW5nZSkge1xyXG4gICAgICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGU6IGFueSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShjZWxsVmFsdWUsIHByb3BzKSwgZm9ybWF0KVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNsaWRlcjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGdldEV2ZW50VGFyZ2V0Tm9kZSB9OiBhbnkgPSBjb250ZXh0XHJcbiAgbGV0IGJvZHlFbGVtOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC10aW1lLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
