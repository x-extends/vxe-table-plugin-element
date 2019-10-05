"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginElement = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getFormatDate(value, props, defaultFormat) {
  return _xeUtils["default"].toDateString(value, props.format || defaultFormat);
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
          return _xeUtils["default"].toDateString(date, format);
        }).join(" ".concat(rangeSeparator, " "));
      }

      return _xeUtils["default"].toDateString(cellValue, format);
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
    interceptor.add('event.clear_filter', handleClearEvent);
    interceptor.add('event.clear_actived', handleClearEvent);
  }
};
exports.VXETablePluginElement = VXETablePluginElement;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement);
}

var _default = VXETablePluginElement;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsIlhFVXRpbHMiLCJ0b0RhdGVTdHJpbmciLCJmb3JtYXQiLCJnZXRGb3JtYXREYXRlcyIsInZhbHVlcyIsInNlcGFyYXRvciIsIm1hcCIsImRhdGUiLCJqb2luIiwiZXF1YWxEYXRlcmFuZ2UiLCJjZWxsVmFsdWUiLCJkYXRhIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0UHJvcHMiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsIm5hbWUiLCJldmVudHMiLCJ0eXBlIiwib24iLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImRlZmF1bHRFZGl0UmVuZGVyIiwiaCIsInJvdyIsImNvbHVtbiIsImF0dHJzIiwibW9kZWwiLCJnZXQiLCJwcm9wZXJ0eSIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiZGVmYXVsdEZpbHRlclJlbmRlciIsImNvbnRleHQiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsImZpbHRlck11bHRpcGxlIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsIm9wdGlvbiIsInJlbmRlck9wdGlvbnMiLCJvcHRpb25zIiwib3B0aW9uUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJrZXkiLCJjZWxsVGV4dCIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0Iiwib3B0aW9uR3JvdXBzIiwib3B0aW9uR3JvdXBQcm9wcyIsImdyb3VwT3B0aW9ucyIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJ1bmRlZmluZWQiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiRWxDYXNjYWRlciIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsIkVsRGF0ZVBpY2tlciIsInJhbmdlU2VwYXJhdG9yIiwiRWxUaW1lUGlja2VyIiwiaXNSYW5nZSIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJoYW5kbGVDbGVhckV2ZW50IiwiZXZudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxhQUFULENBQXdCQyxLQUF4QixFQUFvQ0MsS0FBcEMsRUFBZ0RDLGFBQWhELEVBQXFFO0FBQ25FLFNBQU9DLG9CQUFRQyxZQUFSLENBQXFCSixLQUFyQixFQUE0QkMsS0FBSyxDQUFDSSxNQUFOLElBQWdCSCxhQUE1QyxDQUFQO0FBQ0Q7O0FBRUQsU0FBU0ksY0FBVCxDQUF5QkMsTUFBekIsRUFBc0NOLEtBQXRDLEVBQWtETyxTQUFsRCxFQUFxRU4sYUFBckUsRUFBMEY7QUFDeEYsU0FBT0Msb0JBQVFNLEdBQVIsQ0FBWUYsTUFBWixFQUFvQixVQUFDRyxJQUFEO0FBQUEsV0FBZVgsYUFBYSxDQUFDVyxJQUFE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bUMsbUJBQzFCQyxNQUQwQixFQUNIO0FBQUEsUUFDeEJDLFdBRHdCLEdBQ0VELE1BREYsQ0FDeEJDLFdBRHdCO0FBQUEsUUFDWEMsUUFEVyxHQUNFRixNQURGLENBQ1hFLFFBRFc7QUFFOUJBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlakQsU0FBZjtBQUNBK0MsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ2IsZ0JBQXRDO0FBQ0FVLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixxQkFBaEIsRUFBdUNiLGdCQUF2QztBQUNEO0FBTmtDLENBQTlCOzs7QUFTUCxJQUFJLE9BQU9jLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULHFCQUFwQjtBQUNEOztlQUVjQSxxQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyh2YWx1ZSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06ICgpID0+ICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRFZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gW1xyXG4gICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJSZW5kZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICBbdHlwZV0gKCkge1xyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xyXG4gICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgY2hhbmdlICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gICAgICB2YXIgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKSlcclxuICAgIH1cclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKGRhdGUsIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhjZWxsVmFsdWUsIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2ZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2FjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
