(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-element", ["exports", "xe-utils"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils);
    global.VXETablePluginElement = mod.exports.default;
  }
})(this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

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

  function getCellEvents(editRender, params) {
    var name = editRender.name,
        events = editRender.events;
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
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultCellRender(h, editRender, params) {
    var row = params.row,
        column = params.column;
    var attrs = editRender.attrs;
    var props = getProps(params, editRender);
    return [h(editRender.name, {
      props: props,
      attrs: attrs,
      model: {
        value: _xeUtils["default"].get(row, column.property),
        callback: function callback(value) {
          _xeUtils["default"].set(row, column.property, value);
        }
      },
      on: getCellEvents(editRender, params)
    })];
  }

  function getFilterEvents(on, filterRender, params) {
    var events = filterRender.events;

    if (events) {
      _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }

  function defaultFilterRender(h, filterRender, params, context) {
    var column = params.column;
    var name = filterRender.name,
        attrs = filterRender.attrs;
    var props = getProps(params, filterRender);
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
        }), filterRender, params)
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

    return cellValue === data;
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
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    ElInput: {
      autofocus: 'input.el-input__inner',
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    ElInputNumber: {
      autofocus: 'input.el-input__inner',
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    ElSelect: {
      renderEdit: function renderEdit(h, editRender, params) {
        var options = editRender.options,
            optionGroups = editRender.optionGroups,
            _editRender$optionPro = editRender.optionProps,
            optionProps = _editRender$optionPro === void 0 ? {} : _editRender$optionPro,
            _editRender$optionGro = editRender.optionGroupProps,
            optionGroupProps = _editRender$optionGro === void 0 ? {} : _editRender$optionGro;
        var row = params.row,
            column = params.column;
        var attrs = editRender.attrs;
        var props = getProps(params, editRender);

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
            on: getCellEvents(editRender, params)
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
          on: getCellEvents(editRender, params)
        }, renderOptions(h, options, optionProps))];
      },
      renderCell: function renderCell(h, editRender, params) {
        var options = editRender.options,
            optionGroups = editRender.optionGroups,
            _editRender$props = editRender.props,
            props = _editRender$props === void 0 ? {} : _editRender$props,
            _editRender$optionPro2 = editRender.optionProps,
            optionProps = _editRender$optionPro2 === void 0 ? {} : _editRender$optionPro2,
            _editRender$optionGro2 = editRender.optionGroupProps,
            optionGroupProps = _editRender$optionGro2 === void 0 ? {} : _editRender$optionGro2;
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
      renderFilter: function renderFilter(h, filterRender, params, context) {
        var options = filterRender.options,
            optionGroups = filterRender.optionGroups,
            _filterRender$optionP = filterRender.optionProps,
            optionProps = _filterRender$optionP === void 0 ? {} : _filterRender$optionP,
            _filterRender$optionG = filterRender.optionGroupProps,
            optionGroupProps = _filterRender$optionG === void 0 ? {} : _filterRender$optionG;
        var column = params.column;
        var attrs = filterRender.attrs;
        var props = getProps(params, filterRender);

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
              }, filterRender, params)
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
            }, filterRender, params)
          }, renderOptions(h, options, optionProps));
        });
      },
      filterMethod: function filterMethod(_ref4) {
        var option = _ref4.option,
            row = _ref4.row,
            column = _ref4.column;
        var data = option.data;
        var property = column.property,
            filterRender = column.filterRender;
        var _filterRender$props = filterRender.props,
            props = _filterRender$props === void 0 ? {} : _filterRender$props;

        var cellValue = _xeUtils["default"].get(row, property);

        if (props.multiple) {
          if (_xeUtils["default"].isArray(cellValue)) {
            return _xeUtils["default"].includeArrays(cellValue, data);
          }

          return data.indexOf(cellValue) > -1;
        }

        return cellValue === data;
      }
    },
    ElCascader: {
      renderEdit: defaultCellRender,
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
      renderEdit: defaultCellRender,
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
      renderFilter: function renderFilter(h, filterRender, params, context) {
        var column = params.column;
        var attrs = filterRender.attrs;
        var props = getProps(params, filterRender);
        return column.filters.map(function (item) {
          return h(filterRender.name, {
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
            }, filterRender, params)
          });
        });
      },
      filterMethod: function filterMethod(_ref7) {
        var option = _ref7.option,
            row = _ref7.row,
            column = _ref7.column;
        var data = option.data;
        var filterRender = column.filterRender;
        var _filterRender$props2 = filterRender.props,
            props = _filterRender$props2 === void 0 ? {} : _filterRender$props2;

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
      renderEdit: defaultCellRender,
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
      renderEdit: defaultCellRender
    },
    ElRate: {
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    ElSwitch: {
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    },
    ElSlider: {
      renderEdit: defaultCellRender,
      renderFilter: defaultFilterRender,
      filterMethod: defaultFilterMethod
    }
    /**
     * 事件兼容性处理
     */

  };

  function handleClearEvent(params, evnt, context) {
    var getEventTargetNode = context.getEventTargetNode;

    if ( // 远程搜索
    getEventTargetNode(evnt, document.body, 'el-autocomplete-suggestion').flag || // 下拉框
    getEventTargetNode(evnt, document.body, 'el-select-dropdown').flag || // 级联
    getEventTargetNode(evnt, document.body, 'el-cascader__dropdown').flag || getEventTargetNode(evnt, document.body, 'el-cascader-menus').flag || // 日期
    getEventTargetNode(evnt, document.body, 'el-picker-panel').flag) {
      return false;
    }
  }

  var VXETablePluginElement = {
    install: function install(_ref9) {
      var interceptor = _ref9.interceptor,
          renderer = _ref9.renderer;
      // 添加到渲染器
      renderer.mixin(renderMap); // 处理事件冲突

      interceptor.add('event.clear_filter', handleClearEvent);
      interceptor.add('event.clear_actived', handleClearEvent);
    }
  };

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginElement);
  }

  var _default = VXETablePluginElement;
  _exports["default"] = _default;
});