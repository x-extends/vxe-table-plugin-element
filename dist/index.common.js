"use strict";

exports.__esModule = true;

var xe_utils_1 = require("xe-utils/methods/xe-utils");

function getFormatDate(value, props, defaultFormat) {
  return xe_utils_1["default"].toDateString(value, props.format || defaultFormat);
}

function getFormatDates(values, props, separator, defaultFormat) {
  return xe_utils_1["default"].map(values, function (date) {
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
    xe_utils_1["default"].each(list, function (item) {
      if (item.value === val) {
        labels.push(item.label);
        matchCascaderData(++index, item.children, values, labels);
      }
    });
  }
}

function getProps(_a, _b) {
  var $table = _a.$table;
  var props = _b.props;
  return xe_utils_1["default"].assign($table.vSize ? {
    size: $table.vSize
  } : {}, props);
}

function getCellEvents(renderOpts, params) {
  var _a;

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

  var on = (_a = {}, _a[type] = function () {
    return $table.updateStatus(params);
  }, _a);

  if (events) {
    xe_utils_1["default"].assign(on, xe_utils_1["default"].objectMap(events, function (cb) {
      return function () {
        cb.apply(null, [params].concat.apply(params, arguments));
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
      value: xe_utils_1["default"].get(row, column.property),
      callback: function callback(value) {
        xe_utils_1["default"].set(row, column.property, value);
      }
    },
    on: getCellEvents(renderOpts, params)
  })];
}

function getFilterEvents(on, renderOpts, params) {
  var events = renderOpts.events;

  if (events) {
    xe_utils_1["default"].assign(on, xe_utils_1["default"].objectMap(events, function (cb) {
      return function () {
        cb.apply(null, [params].concat.apply(params, arguments));
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
    var _a;

    return h(name, {
      props: props,
      attrs: attrs,
      model: {
        value: item.data,
        callback: function callback(optionValue) {
          item.data = optionValue;
        }
      },
      on: getFilterEvents((_a = {}, _a[type] = function () {
        handleConfirmFilter(context, column, !!item.data, item);
      }, _a), renderOpts, params)
    });
  });
}

function handleConfirmFilter(context, column, checked, item) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
}

function defaultFilterMethod(_a) {
  var option = _a.option,
      row = _a.row,
      column = _a.column;
  var data = option.data;
  var cellValue = xe_utils_1["default"].get(row, column.property);
  /* eslint-disable eqeqeq */

  return cellValue == data;
}

function renderOptions(h, options, optionProps) {
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  return xe_utils_1["default"].map(options, function (item, index) {
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
          _a = renderOpts.optionProps,
          optionProps = _a === void 0 ? {} : _a,
          _b = renderOpts.optionGroupProps,
          optionGroupProps = _b === void 0 ? {} : _b;
      var row = params.row,
          column = params.column;
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);

      if (optionGroups) {
        var groupOptions_1 = optionGroupProps.options || 'options';
        var groupLabel_1 = optionGroupProps.label || 'label';
        return [h('el-select', {
          props: props,
          attrs: attrs,
          model: {
            value: xe_utils_1["default"].get(row, column.property),
            callback: function callback(cellValue) {
              xe_utils_1["default"].set(row, column.property, cellValue);
            }
          },
          on: getCellEvents(renderOpts, params)
        }, xe_utils_1["default"].map(optionGroups, function (group, gIndex) {
          return h('el-option-group', {
            props: {
              label: group[groupLabel_1]
            },
            key: gIndex
          }, renderOptions(h, group[groupOptions_1], optionProps));
        }))];
      }

      return [h('el-select', {
        props: props,
        attrs: attrs,
        model: {
          value: xe_utils_1["default"].get(row, column.property),
          callback: function callback(cellValue) {
            xe_utils_1["default"].set(row, column.property, cellValue);
          }
        },
        on: getCellEvents(renderOpts, params)
      }, renderOptions(h, options, optionProps))];
    },
    renderCell: function renderCell(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _a = renderOpts.props,
          props = _a === void 0 ? {} : _a,
          _b = renderOpts.optionProps,
          optionProps = _b === void 0 ? {} : _b,
          _c = renderOpts.optionGroupProps,
          optionGroupProps = _c === void 0 ? {} : _c;
      var row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';
      var cellValue = xe_utils_1["default"].get(row, column.property);

      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, xe_utils_1["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
          var selectItem;

          for (var index = 0; index < optionGroups.length; index++) {
            selectItem = xe_utils_1["default"].find(optionGroups[index][groupOptions], function (item) {
              return item[valueProp] === value;
            });

            if (selectItem) {
              break;
            }
          }

          return selectItem ? selectItem[labelProp] : null;
        } : function (value) {
          var selectItem = xe_utils_1["default"].find(options, function (item) {
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
          _a = renderOpts.optionProps,
          optionProps = _a === void 0 ? {} : _a,
          _b = renderOpts.optionGroupProps,
          optionGroupProps = _b === void 0 ? {} : _b;
      var column = params.column;
      var attrs = renderOpts.attrs;
      var props = getProps(params, renderOpts);

      if (optionGroups) {
        var groupOptions_2 = optionGroupProps.options || 'options';
        var groupLabel_2 = optionGroupProps.label || 'label';
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
          }, xe_utils_1["default"].map(optionGroups, function (group, gIndex) {
            return h('el-option-group', {
              props: {
                label: group[groupLabel_2]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions_2], optionProps));
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
    filterMethod: function filterMethod(_a) {
      var option = _a.option,
          row = _a.row,
          column = _a.column;
      var data = option.data;
      var property = column.property,
          renderOpts = column.filterRender;
      var _b = renderOpts.props,
          props = _b === void 0 ? {} : _b;
      var cellValue = xe_utils_1["default"].get(row, property);

      if (props.multiple) {
        if (xe_utils_1["default"].isArray(cellValue)) {
          return xe_utils_1["default"].includeArrays(cellValue, data);
        }

        return data.indexOf(cellValue) > -1;
      }
      /* eslint-disable eqeqeq */


      return cellValue == data;
    }
  },
  ElCascader: {
    renderEdit: defaultEditRender,
    renderCell: function renderCell(h, _a, params) {
      var _b = _a.props,
          props = _b === void 0 ? {} : _b;
      var row = params.row,
          column = params.column;
      var cellValue = xe_utils_1["default"].get(row, column.property);
      var values = cellValue || [];
      var labels = [];
      matchCascaderData(0, props.options, values, labels);
      return cellText(h, (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" " + (props.separator || '/') + " "));
    }
  },
  ElDatePicker: {
    renderEdit: defaultEditRender,
    renderCell: function renderCell(h, _a, params) {
      var _b = _a.props,
          props = _b === void 0 ? {} : _b;
      var row = params.row,
          column = params.column;
      var _c = props.rangeSeparator,
          rangeSeparator = _c === void 0 ? '-' : _c;
      var cellValue = xe_utils_1["default"].get(row, column.property);

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
          cellValue = getFormatDates(cellValue, props, " " + rangeSeparator + " ", 'yyyy-MM-dd');
          break;

        case 'datetimerange':
          cellValue = getFormatDates(cellValue, props, " " + rangeSeparator + " ", 'yyyy-MM-dd HH:ss:mm');
          break;

        case 'monthrange':
          cellValue = getFormatDates(cellValue, props, " " + rangeSeparator + " ", 'yyyy-MM');
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
    filterMethod: function filterMethod(_a) {
      var option = _a.option,
          row = _a.row,
          column = _a.column;
      var data = option.data;
      var renderOpts = column.filterRender;
      var _b = renderOpts.props,
          props = _b === void 0 ? {} : _b;
      var cellValue = xe_utils_1["default"].get(row, column.property);

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
    renderCell: function renderCell(h, _a, params) {
      var _b = _a.props,
          props = _b === void 0 ? {} : _b;
      var row = params.row,
          column = params.column;
      var isRange = props.isRange,
          _c = props.format,
          format = _c === void 0 ? 'hh:mm:ss' : _c,
          _d = props.rangeSeparator,
          rangeSeparator = _d === void 0 ? '-' : _d;
      var cellValue = xe_utils_1["default"].get(row, column.property);

      if (cellValue && isRange) {
        cellValue = xe_utils_1["default"].map(cellValue, function (date) {
          return xe_utils_1["default"].toDateString(date, format);
        }).join(" " + rangeSeparator + " ");
      }

      return xe_utils_1["default"].toDateString(cellValue, format);
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


exports.VXETablePluginElement = {
  install: function install(xtable) {
    var interceptor = xtable.interceptor,
        renderer = xtable.renderer;
    renderer.mixin(renderMap);
    interceptor.add('event.clear_filter', handleClearEvent);
    interceptor.add('event.clear_actived', handleClearEvent);
  }
};

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(exports.VXETablePluginElement);
}

exports["default"] = exports.VXETablePluginElement;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiaW5kZXgudHMiXSwibmFtZXMiOlsiZXhwb3J0cyIsIl9fZXNNb2R1bGUiLCJ4ZV91dGlsc18xIiwicmVxdWlyZSIsImdldEZvcm1hdERhdGUiLCJ2YWx1ZSIsInByb3BzIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImNlbGxWYWx1ZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsIl9hIiwiX2IiLCIkdGFibGUiLCJhc3NpZ24iLCJ2U2l6ZSIsInNpemUiLCJnZXRDZWxsRXZlbnRzIiwicmVuZGVyT3B0cyIsInBhcmFtcyIsIm5hbWUiLCJldmVudHMiLCJ0eXBlIiwib24iLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFwcGx5IiwiY29uY2F0IiwiYXJndW1lbnRzIiwiZGVmYXVsdEVkaXRSZW5kZXIiLCJoIiwicm93IiwiY29sdW1uIiwiYXR0cnMiLCJtb2RlbCIsImdldCIsInByb3BlcnR5IiwiY2FsbGJhY2siLCJzZXQiLCJnZXRGaWx0ZXJFdmVudHMiLCJkZWZhdWx0RmlsdGVyUmVuZGVyIiwiY29udGV4dCIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsIm9wdGlvbnMiLCJvcHRpb25Qcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImtleSIsImNlbGxUZXh0IiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Hcm91cFByb3BzIiwiZ3JvdXBPcHRpb25zXzEiLCJncm91cExhYmVsXzEiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJfYyIsImdyb3VwT3B0aW9ucyIsInVuZGVmaW5lZCIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJncm91cE9wdGlvbnNfMiIsImdyb3VwTGFiZWxfMiIsImNoYW5nZSIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsIkVsQ2FzY2FkZXIiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJFbERhdGVQaWNrZXIiLCJyYW5nZVNlcGFyYXRvciIsIkVsVGltZVBpY2tlciIsImlzUmFuZ2UiLCJfZCIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJoYW5kbGVDbGVhckV2ZW50IiwiZXZudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQ0FBLE9BQU8sQ0FBQ0MsVUFBUixHQUFxQixJQUFyQjs7QUNEQSxJQUFBQyxVQUFBLEdBQUFDLE9BQUEsQ0FBQSwyQkFBQSxDQUFBOztBQUdBLFNBQVNDLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFnREMsYUFBaEQsRUFBcUU7QUFDbkUsU0FBT0wsVUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFRTSxZQUFSLENB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QUFULEVBQWdDO0FBQ3hCLFFBQUFDLFdBQUEsR0FBQUQsTUFBQSxDQUFBQyxXQUFBO0FBQUEsUUFBYUMsUUFBQSxHQUFBRixNQUFBLENBQUFFLFFBQWI7QUFDTkEsSUFBQUEsUUFBUSxDQUFDQyxLQUFULENBQWV0RCxTQUFmO0FBQ0FvRCxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDYixnQkFBdEM7QUFDQVUsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLHFCQUFoQixFQUF1Q2IsZ0JBQXZDO0FBQ0Q7QUFOa0MsQ0FBeEI7O0FBU2IsSUFBSSxPQUFPYyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CdkksT0FBQSxDQUFBOEgscUJBQXBCO0FBQ0Q7O0FBRUQ5SCxPQUFBLENBQUEsU0FBQSxDQUFBLEdBQWVBLE9BQUEsQ0FBQThILHFCQUFmIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciB4ZV91dGlsc18xID0gcmVxdWlyZShcInhlLXV0aWxzL21ldGhvZHMveGUtdXRpbHNcIik7XG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlKHZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkge1xuICAgIHJldHVybiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS50b0RhdGVTdHJpbmcodmFsdWUsIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KTtcbn1cbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzKHZhbHVlcywgcHJvcHMsIHNlcGFyYXRvciwgZGVmYXVsdEZvcm1hdCkge1xuICAgIHJldHVybiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5tYXAodmFsdWVzLCBmdW5jdGlvbiAoZGF0ZSkgeyByZXR1cm4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCk7IH0pLmpvaW4oc2VwYXJhdG9yKTtcbn1cbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpIHtcbiAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpO1xuICAgIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpO1xufVxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEoaW5kZXgsIGxpc3QsIHZhbHVlcywgbGFiZWxzKSB7XG4gICAgdmFyIHZhbCA9IHZhbHVlc1tpbmRleF07XG4gICAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XG4gICAgICAgIHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmVhY2gobGlzdCwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKTtcbiAgICAgICAgICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldFByb3BzKF9hLCBfYikge1xuICAgIHZhciAkdGFibGUgPSBfYS4kdGFibGU7XG4gICAgdmFyIHByb3BzID0gX2IucHJvcHM7XG4gICAgcmV0dXJuIHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIHByb3BzKTtcbn1cbmZ1bmN0aW9uIGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKSB7XG4gICAgdmFyIF9hO1xuICAgIHZhciBuYW1lID0gcmVuZGVyT3B0cy5uYW1lLCBldmVudHMgPSByZW5kZXJPcHRzLmV2ZW50cztcbiAgICB2YXIgJHRhYmxlID0gcGFyYW1zLiR0YWJsZTtcbiAgICB2YXIgdHlwZSA9ICdjaGFuZ2UnO1xuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XG4gICAgICAgICAgICB0eXBlID0gJ3NlbGVjdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRWxJbnB1dCc6XG4gICAgICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxuICAgICAgICAgICAgdHlwZSA9ICdpbnB1dCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIG9uID0gKF9hID0ge30sXG4gICAgICAgIF9hW3R5cGVdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpOyB9LFxuICAgICAgICBfYSk7XG4gICAgaWYgKGV2ZW50cykge1xuICAgICAgICB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5hc3NpZ24ob24sIHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLm9iamVjdE1hcChldmVudHMsIGZ1bmN0aW9uIChjYikgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSk7XG4gICAgICAgIH07IH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9uO1xufVxuZnVuY3Rpb24gZGVmYXVsdEVkaXRSZW5kZXIoaCwgcmVuZGVyT3B0cywgcGFyYW1zKSB7XG4gICAgdmFyIHJvdyA9IHBhcmFtcy5yb3csIGNvbHVtbiA9IHBhcmFtcy5jb2x1bW47XG4gICAgdmFyIGF0dHJzID0gcmVuZGVyT3B0cy5hdHRycztcbiAgICB2YXIgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpO1xuICAgIHJldHVybiBbXG4gICAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XG4gICAgICAgICAgICBwcm9wczogcHJvcHMsXG4gICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgeGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcbiAgICAgICAgfSlcbiAgICBdO1xufVxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzKG9uLCByZW5kZXJPcHRzLCBwYXJhbXMpIHtcbiAgICB2YXIgZXZlbnRzID0gcmVuZGVyT3B0cy5ldmVudHM7XG4gICAgaWYgKGV2ZW50cykge1xuICAgICAgICB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5hc3NpZ24ob24sIHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLm9iamVjdE1hcChldmVudHMsIGZ1bmN0aW9uIChjYikgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSk7XG4gICAgICAgIH07IH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9uO1xufVxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlclJlbmRlcihoLCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpIHtcbiAgICB2YXIgY29sdW1uID0gcGFyYW1zLmNvbHVtbjtcbiAgICB2YXIgbmFtZSA9IHJlbmRlck9wdHMubmFtZSwgYXR0cnMgPSByZW5kZXJPcHRzLmF0dHJzO1xuICAgIHZhciBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cyk7XG4gICAgdmFyIHR5cGUgPSAnY2hhbmdlJztcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxuICAgICAgICAgICAgdHlwZSA9ICdzZWxlY3QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VsSW5wdXQnOlxuICAgICAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcbiAgICAgICAgICAgIHR5cGUgPSAnaW5wdXQnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gaChuYW1lLCB7XG4gICAgICAgICAgICBwcm9wczogcHJvcHMsXG4gICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uIChvcHRpb25WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cygoX2EgPSB7fSxcbiAgICAgICAgICAgICAgICBfYVt0eXBlXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9hKSwgcmVuZGVyT3B0cywgcGFyYW1zKVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCBjaGVja2VkLCBpdGVtKSB7XG4gICAgY29udGV4dFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pO1xufVxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZChfYSkge1xuICAgIHZhciBvcHRpb24gPSBfYS5vcHRpb24sIHJvdyA9IF9hLnJvdywgY29sdW1uID0gX2EuY29sdW1uO1xuICAgIHZhciBkYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgdmFyIGNlbGxWYWx1ZSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhO1xufVxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykge1xuICAgIHZhciBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnO1xuICAgIHZhciB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnO1xuICAgIHJldHVybiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5tYXAob3B0aW9ucywgZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtleTogaW5kZXhcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpIHtcbiAgICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV07XG59XG4vKipcbiAqIOa4suafk+WHveaVsFxuICovXG52YXIgcmVuZGVyTWFwID0ge1xuICAgIEVsQXV0b2NvbXBsZXRlOiB7XG4gICAgICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXG4gICAgICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxuICAgICAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcbiAgICAgICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxuICAgICAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcbiAgICB9LFxuICAgIEVsSW5wdXQ6IHtcbiAgICAgICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcbiAgICAgICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxuICAgICAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXG4gICAgICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxuICAgIH0sXG4gICAgRWxJbnB1dE51bWJlcjoge1xuICAgICAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxuICAgICAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcbiAgICAgICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXG4gICAgfSxcbiAgICBFbFNlbGVjdDoge1xuICAgICAgICByZW5kZXJFZGl0OiBmdW5jdGlvbiAoaCwgcmVuZGVyT3B0cywgcGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlbmRlck9wdHMub3B0aW9ucywgb3B0aW9uR3JvdXBzID0gcmVuZGVyT3B0cy5vcHRpb25Hcm91cHMsIF9hID0gcmVuZGVyT3B0cy5vcHRpb25Qcm9wcywgb3B0aW9uUHJvcHMgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2IgPSByZW5kZXJPcHRzLm9wdGlvbkdyb3VwUHJvcHMsIG9wdGlvbkdyb3VwUHJvcHMgPSBfYiA9PT0gdm9pZCAwID8ge30gOiBfYjtcbiAgICAgICAgICAgIHZhciByb3cgPSBwYXJhbXMucm93LCBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgdmFyIGF0dHJzID0gcmVuZGVyT3B0cy5hdHRycztcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cyk7XG4gICAgICAgICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwT3B0aW9uc18xID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJztcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXBMYWJlbF8xID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBwcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiBhdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uIChjZWxsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgIH0sIHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLm1hcChvcHRpb25Hcm91cHMsIGZ1bmN0aW9uIChncm91cCwgZ0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGdJbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNfMV0sIG9wdGlvblByb3BzKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgICAgICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoY2VsbFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXG4gICAgICAgICAgICBdO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXJDZWxsOiBmdW5jdGlvbiAoaCwgcmVuZGVyT3B0cywgcGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlbmRlck9wdHMub3B0aW9ucywgb3B0aW9uR3JvdXBzID0gcmVuZGVyT3B0cy5vcHRpb25Hcm91cHMsIF9hID0gcmVuZGVyT3B0cy5wcm9wcywgcHJvcHMgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2IgPSByZW5kZXJPcHRzLm9wdGlvblByb3BzLCBvcHRpb25Qcm9wcyA9IF9iID09PSB2b2lkIDAgPyB7fSA6IF9iLCBfYyA9IHJlbmRlck9wdHMub3B0aW9uR3JvdXBQcm9wcywgb3B0aW9uR3JvdXBQcm9wcyA9IF9jID09PSB2b2lkIDAgPyB7fSA6IF9jO1xuICAgICAgICAgICAgdmFyIHJvdyA9IHBhcmFtcy5yb3csIGNvbHVtbiA9IHBhcmFtcy5jb2x1bW47XG4gICAgICAgICAgICB2YXIgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJztcbiAgICAgICAgICAgIHZhciB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnO1xuICAgICAgICAgICAgdmFyIGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucyc7XG4gICAgICAgICAgICB2YXIgY2VsbFZhbHVlID0geGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KTtcbiAgICAgICAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjZWxsVGV4dChoLCB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RJdGVtO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0SXRlbSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCBmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbDtcbiAgICAgICAgICAgICAgICB9IDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RJdGVtID0geGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uZmluZChvcHRpb25zLCBmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZTsgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbDtcbiAgICAgICAgICAgICAgICB9KS5qb2luKCc7JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsICcnKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyRmlsdGVyOiBmdW5jdGlvbiAoaCwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHJlbmRlck9wdHMub3B0aW9ucywgb3B0aW9uR3JvdXBzID0gcmVuZGVyT3B0cy5vcHRpb25Hcm91cHMsIF9hID0gcmVuZGVyT3B0cy5vcHRpb25Qcm9wcywgb3B0aW9uUHJvcHMgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2IgPSByZW5kZXJPcHRzLm9wdGlvbkdyb3VwUHJvcHMsIG9wdGlvbkdyb3VwUHJvcHMgPSBfYiA9PT0gdm9pZCAwID8ge30gOiBfYjtcbiAgICAgICAgICAgIHZhciBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgdmFyIGF0dHJzID0gcmVuZGVyT3B0cy5hdHRycztcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cyk7XG4gICAgICAgICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwT3B0aW9uc18yID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJztcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXBMYWJlbF8yID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBwcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiBhdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKG9wdGlvblZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICB9LCB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5tYXAob3B0aW9uR3JvdXBzLCBmdW5jdGlvbiAoZ3JvdXAsIGdJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF8yXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBnSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXzJdLCBvcHRpb25Qcm9wcykpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgICAgICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uIChvcHRpb25WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlck1ldGhvZDogZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9uID0gX2Eub3B0aW9uLCByb3cgPSBfYS5yb3csIGNvbHVtbiA9IF9hLmNvbHVtbjtcbiAgICAgICAgICAgIHZhciBkYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBjb2x1bW4ucHJvcGVydHksIHJlbmRlck9wdHMgPSBjb2x1bW4uZmlsdGVyUmVuZGVyO1xuICAgICAgICAgICAgdmFyIF9iID0gcmVuZGVyT3B0cy5wcm9wcywgcHJvcHMgPSBfYiA9PT0gdm9pZCAwID8ge30gOiBfYjtcbiAgICAgICAgICAgIHZhciBjZWxsVmFsdWUgPSB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5nZXQocm93LCBwcm9wZXJ0eSk7XG4gICAgICAgICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGVfdXRpbHNfMVtcImRlZmF1bHRcIl0uaXNBcnJheShjZWxsVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGE7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIEVsQ2FzY2FkZXI6IHtcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckNlbGw6IGZ1bmN0aW9uIChoLCBfYSwgcGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBfYS5wcm9wcywgcHJvcHMgPSBfYiA9PT0gdm9pZCAwID8ge30gOiBfYjtcbiAgICAgICAgICAgIHZhciByb3cgPSBwYXJhbXMucm93LCBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgdmFyIGNlbGxWYWx1ZSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSk7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gY2VsbFZhbHVlIHx8IFtdO1xuICAgICAgICAgICAgdmFyIGxhYmVscyA9IFtdO1xuICAgICAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpO1xuICAgICAgICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oXCIgXCIgKyAocHJvcHMuc2VwYXJhdG9yIHx8ICcvJykgKyBcIiBcIikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBFbERhdGVQaWNrZXI6IHtcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckNlbGw6IGZ1bmN0aW9uIChoLCBfYSwgcGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBfYS5wcm9wcywgcHJvcHMgPSBfYiA9PT0gdm9pZCAwID8ge30gOiBfYjtcbiAgICAgICAgICAgIHZhciByb3cgPSBwYXJhbXMucm93LCBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgdmFyIF9jID0gcHJvcHMucmFuZ2VTZXBhcmF0b3IsIHJhbmdlU2VwYXJhdG9yID0gX2MgPT09IHZvaWQgMCA/ICctJyA6IF9jO1xuICAgICAgICAgICAgdmFyIGNlbGxWYWx1ZSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSk7XG4gICAgICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgICAgICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgICAgICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF0ZXMnOlxuICAgICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBcIiBcIiArIHJhbmdlU2VwYXJhdG9yICsgXCIgXCIsICd5eXl5LU1NLWRkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBcIiBcIiArIHJhbmdlU2VwYXJhdG9yICsgXCIgXCIsICd5eXl5LU1NLWRkIEhIOnNzOm1tJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBcIiBcIiArIHJhbmdlU2VwYXJhdG9yICsgXCIgXCIsICd5eXl5LU1NJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBjZWxsVmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXJGaWx0ZXI6IGZ1bmN0aW9uIChoLCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgdmFyIGF0dHJzID0gcmVuZGVyT3B0cy5hdHRycztcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cyk7XG4gICAgICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBwcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IGF0dHJzLFxuICAgICAgICAgICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAob3B0aW9uVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCAhIXZhbHVlLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlck1ldGhvZDogZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9uID0gX2Eub3B0aW9uLCByb3cgPSBfYS5yb3csIGNvbHVtbiA9IF9hLmNvbHVtbjtcbiAgICAgICAgICAgIHZhciBkYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgICAgICAgICB2YXIgcmVuZGVyT3B0cyA9IGNvbHVtbi5maWx0ZXJSZW5kZXI7XG4gICAgICAgICAgICB2YXIgX2IgPSByZW5kZXJPcHRzLnByb3BzLCBwcm9wcyA9IF9iID09PSB2b2lkIDAgPyB7fSA6IF9iO1xuICAgICAgICAgICAgdmFyIGNlbGxWYWx1ZSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJyk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgRWxUaW1lUGlja2VyOiB7XG4gICAgICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxuICAgICAgICByZW5kZXJDZWxsOiBmdW5jdGlvbiAoaCwgX2EsIHBhcmFtcykge1xuICAgICAgICAgICAgdmFyIF9iID0gX2EucHJvcHMsIHByb3BzID0gX2IgPT09IHZvaWQgMCA/IHt9IDogX2I7XG4gICAgICAgICAgICB2YXIgcm93ID0gcGFyYW1zLnJvdywgY29sdW1uID0gcGFyYW1zLmNvbHVtbjtcbiAgICAgICAgICAgIHZhciBpc1JhbmdlID0gcHJvcHMuaXNSYW5nZSwgX2MgPSBwcm9wcy5mb3JtYXQsIGZvcm1hdCA9IF9jID09PSB2b2lkIDAgPyAnaGg6bW06c3MnIDogX2MsIF9kID0gcHJvcHMucmFuZ2VTZXBhcmF0b3IsIHJhbmdlU2VwYXJhdG9yID0gX2QgPT09IHZvaWQgMCA/ICctJyA6IF9kO1xuICAgICAgICAgICAgdmFyIGNlbGxWYWx1ZSA9IHhlX3V0aWxzXzFbXCJkZWZhdWx0XCJdLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSk7XG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS5tYXAoY2VsbFZhbHVlLCBmdW5jdGlvbiAoZGF0ZSkgeyByZXR1cm4geGVfdXRpbHNfMVtcImRlZmF1bHRcIl0udG9EYXRlU3RyaW5nKGRhdGUsIGZvcm1hdCk7IH0pLmpvaW4oXCIgXCIgKyByYW5nZVNlcGFyYXRvciArIFwiIFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB4ZV91dGlsc18xW1wiZGVmYXVsdFwiXS50b0RhdGVTdHJpbmcoY2VsbFZhbHVlLCBmb3JtYXQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBFbFRpbWVTZWxlY3Q6IHtcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcbiAgICB9LFxuICAgIEVsUmF0ZToge1xuICAgICAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcbiAgICAgICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXG4gICAgfSxcbiAgICBFbFN3aXRjaDoge1xuICAgICAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcbiAgICAgICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXG4gICAgfSxcbiAgICBFbFNsaWRlcjoge1xuICAgICAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcbiAgICAgICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXG4gICAgICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcbiAgICAgICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXG4gICAgfVxufTtcbi8qKlxuICog5LqL5Lu25YW85a655oCn5aSE55CGXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQocGFyYW1zLCBldm50LCBjb250ZXh0KSB7XG4gICAgdmFyIGdldEV2ZW50VGFyZ2V0Tm9kZSA9IGNvbnRleHQuZ2V0RXZlbnRUYXJnZXROb2RlO1xuICAgIHZhciBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHk7XG4gICAgaWYgKFxuICAgIC8vIOi/nOeoi+aQnOe0olxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxuICAgICAgICAvLyDkuIvmi4nmoYZcbiAgICAgICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxuICAgICAgICAvLyDnuqfogZRcbiAgICAgICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxuICAgICAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcbiAgICAgICAgLy8g5pel5pyfXG4gICAgICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8qKlxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcbiAqL1xuZXhwb3J0cy5WWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XG4gICAgaW5zdGFsbDogZnVuY3Rpb24gKHh0YWJsZSkge1xuICAgICAgICB2YXIgaW50ZXJjZXB0b3IgPSB4dGFibGUuaW50ZXJjZXB0b3IsIHJlbmRlcmVyID0geHRhYmxlLnJlbmRlcmVyO1xuICAgICAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApO1xuICAgICAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2ZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpO1xuICAgICAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2FjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KTtcbiAgICB9XG59O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xuICAgIHdpbmRvdy5WWEVUYWJsZS51c2UoZXhwb3J0cy5WWEVUYWJsZVBsdWdpbkVsZW1lbnQpO1xufVxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBleHBvcnRzLlZYRVRhYmxlUGx1Z2luRWxlbWVudDtcbiIsImltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCB7IFZYRVRhYmxlIH0gZnJvbSAndnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHZhbHVlLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBBcnJheTxhbnk+LCB2YWx1ZXM6IEFycmF5PGFueT4sIGxhYmVsczogQXJyYXk8YW55Pikge1xyXG4gIGxldCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06ICgpID0+ICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRFZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gW1xyXG4gICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICBYRVV0aWxzLmFzc2lnbihvbiwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykpXHJcbiAgICB9KSlcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJSZW5kZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGxldCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBtb2RlbDoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICBbdHlwZV0gKCkge1xyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChjb250ZXh0OiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnRleHRbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHZvaWQgMCA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICBsZXQgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmICghKGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnKSkge1xyXG4gICAgICAgIHJldHVybiBjZWxsVGV4dChoLCBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW1cclxuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICAgIHJldHVybiBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogbnVsbFxyXG4gICAgICAgIH0pLmpvaW4oJzsnKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgJycpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgY2hhbmdlICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIoY29udGV4dCwgY29sdW1uLCB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAwLCBpdGVtKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9XHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCB7IHByb3BzID0ge30gfTogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgdmFyIHZhbHVlcyA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gICAgICB2YXIgbGFiZWxzOiBBcnJheTxhbnk+ID0gW11cclxuICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKSlcclxuICAgIH1cclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgY2VsbFZhbHVlKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHMgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgeyBwcm9wcyA9IHt9IH06IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgICAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKGRhdGUsIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhjZWxsVmFsdWUsIGZvcm1hdClcclxuICAgIH1cclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXJcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckZpbHRlcjogZGVmYXVsdEZpbHRlclJlbmRlcixcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZFxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJGaWx0ZXI6IGRlZmF1bHRGaWx0ZXJSZW5kZXIsXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2RcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0RWRpdFJlbmRlcixcclxuICAgIHJlbmRlckVkaXQ6IGRlZmF1bHRFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBkZWZhdWx0RmlsdGVyUmVuZGVyLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICBsZXQgeyBnZXRFdmVudFRhcmdldE5vZGUgfSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIGxldCB7IGludGVyY2VwdG9yLCByZW5kZXJlciB9ID0geHRhYmxlXHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2ZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyX2FjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
