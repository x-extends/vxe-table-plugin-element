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
  _exports["default"] = _exports.VXETablePluginElement = void 0;
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
      interceptor.add('event.clearFilter', handleClearEvent);
      interceptor.add('event.clearActived', handleClearEvent);
    }
  };
  _exports.VXETablePluginElement = VXETablePluginElement;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginElement);
  }

  var _default = VXETablePluginElement;
  _exports["default"] = _default;
});