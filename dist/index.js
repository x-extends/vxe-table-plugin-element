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
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginElement = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function isEmptyValue(cellValue) {
    return cellValue === null || cellValue === undefined || cellValue === '';
  }

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

  function getSelectCellValue(renderOpts, params) {
    var options = renderOpts.options,
        optionGroups = renderOpts.optionGroups,
        _renderOpts$props = renderOpts.props,
        props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
        _renderOpts$optionPro = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
        _renderOpts$optionGro = renderOpts.optionGroupProps,
        optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
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

    if (!isEmptyValue(cellValue)) {
      return _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
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
      }).join(', ');
    }

    return null;
  }

  function getCascaderCellValue(renderOpts, params) {
    var _renderOpts$props2 = renderOpts.props,
        props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2;
    var row = params.row,
        column = params.column;

    var cellValue = _xeUtils["default"].get(row, column.property);

    var values = cellValue || [];
    var labels = [];
    matchCascaderData(0, props.options, values, labels);
    return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" ".concat(props.separator || '/', " "));
  }

  function getDatePickerCellValue(renderOpts, params) {
    var _renderOpts$props3 = renderOpts.props,
        props = _renderOpts$props3 === void 0 ? {} : _renderOpts$props3;
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

    return cellValue;
  }

  function getTimePickerCellValue(renderOpts, params) {
    var _renderOpts$props4 = renderOpts.props,
        props = _renderOpts$props4 === void 0 ? {} : _renderOpts$props4;
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

  function defaultButtonEditRender(h, renderOpts, params) {
    var attrs = renderOpts.attrs;
    var props = getProps(params, renderOpts);
    return [h('el-button', {
      attrs: attrs,
      props: props,
      on: getCellEvents(renderOpts, params)
    }, cellText(h, renderOpts.content))];
  }

  function defaultButtonsEditRender(h, renderOpts, params) {
    return renderOpts.children.map(function (childRenderOpts) {
      return defaultButtonEditRender(h, childRenderOpts, params)[0];
    });
  }

  function getFilterEvents(on, renderOpts, params) {
    var events = renderOpts.events;

    if (events) {
      return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
        return function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          cb.apply(null, [params].concat(args));
        };
      }), on);
    }

    return on;
  }

  function createFilterRender(defaultProps) {
    return function (h, renderOpts, params) {
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
            handleConfirmFilter(params, column, !!item.data, item);

            if (events && events[type]) {
              events[type](params, evnt);
            }
          }), renderOpts, params)
        });
      });
    };
  }

  function handleConfirmFilter(params, column, checked, item) {
    var $panel = params.$panel || params.context;
    $panel[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
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
    return ['' + (isEmptyValue(cellValue) ? '' : cellValue)];
  }

  function createFormItemRender(defaultProps) {
    return function (h, renderOpts, params) {
      var data = params.data,
          property = params.property;
      var name = renderOpts.name;
      var attrs = renderOpts.attrs;
      var props = getFormItemProps(params, renderOpts, defaultProps);
      return [h(name, {
        attrs: attrs,
        props: props,
        model: {
          value: _xeUtils["default"].get(data, property),
          callback: function callback(value) {
            _xeUtils["default"].set(data, property, value);
          }
        },
        on: getFormEvents(renderOpts, params)
      })];
    };
  }

  function defaultButtonItemRender(h, renderOpts, params) {
    var attrs = renderOpts.attrs;
    var props = getFormItemProps(params, renderOpts);
    return [h('el-button', {
      attrs: attrs,
      props: props,
      on: getFormEvents(renderOpts, params)
    }, cellText(h, renderOpts.content || props.content))];
  }

  function defaultButtonsItemRender(h, renderOpts, params) {
    return renderOpts.children.map(function (childRenderOpts) {
      return defaultButtonItemRender(h, childRenderOpts, params)[0];
    });
  }

  function getFormItemProps(_ref4, _ref5, defaultProps) {
    var $form = _ref4.$form;
    var props = _ref5.props;
    return _xeUtils["default"].assign($form.vSize ? {
      size: $form.vSize
    } : {}, defaultProps, props);
  }

  function getFormEvents(renderOpts, params) {
    var events = renderOpts.events;
    var $form = params.$form;
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
      $form.updateStatus(params);

      if (events && events[type]) {
        events[type](params, evnt);
      }
    });

    if (events) {
      return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
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

  function createExportMethod(valueMethod, isEdit) {
    var renderProperty = isEdit ? 'editRender' : 'cellRender';
    return function (params) {
      return valueMethod(params.column[renderProperty], params);
    };
  }

  function createFormItemRadioAndCheckboxRender() {
    return function (h, renderOpts, params) {
      var name = renderOpts.name,
          options = renderOpts.options,
          _renderOpts$optionPro2 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormItemProps(params, renderOpts);
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var disabledProp = optionProps.disabled || 'disabled';
      return [h("".concat(name, "Group"), {
        props: props,
        attrs: attrs,
        model: {
          value: _xeUtils["default"].get(data, property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(data, property, cellValue);
          }
        },
        on: getFormEvents(renderOpts, params)
      }, options.map(function (option) {
        return h(name, {
          props: {
            label: option[valueProp],
            disabled: option[disabledProp]
          }
        }, option[labelProp]);
      }))];
    };
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
            _renderOpts$optionPro3 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
            _renderOpts$optionGro2 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
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
        return cellText(h, getSelectCellValue(renderOpts, params));
      },
      renderFilter: function renderFilter(h, renderOpts, params) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro4 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
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
                handleConfirmFilter(params, column, value && value.length > 0, item);

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
                handleConfirmFilter(params, column, value && value.length > 0, item);

                if (events && events[type]) {
                  events[type](params, value);
                }
              }
            }, renderOpts, params)
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
        var _renderOpts$props5 = renderOpts.props,
            props = _renderOpts$props5 === void 0 ? {} : _renderOpts$props5;

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
      renderItem: function renderItem(h, renderOpts, params) {
        var options = renderOpts.options,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro5 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
            _renderOpts$optionGro4 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
        var data = params.data,
            property = params.property;
        var attrs = renderOpts.attrs;
        var props = getFormItemProps(params, renderOpts);

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
            on: getFormEvents(renderOpts, params)
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
          on: getFormEvents(renderOpts, params)
        }, renderOptions(h, options, optionProps))];
      },
      cellExportMethod: createExportMethod(getSelectCellValue),
      editCellExportMethod: createExportMethod(getSelectCellValue, true)
    },
    ElCascader: {
      renderEdit: createEditRender(),
      renderCell: function renderCell(h, renderOpts, params) {
        return cellText(h, getCascaderCellValue(renderOpts, params));
      },
      renderItem: createFormItemRender(),
      cellExportMethod: createExportMethod(getCascaderCellValue),
      editCellExportMethod: createExportMethod(getCascaderCellValue, true)
    },
    ElDatePicker: {
      renderEdit: createEditRender(),
      renderCell: function renderCell(h, renderOpts, params) {
        return cellText(h, getDatePickerCellValue(renderOpts, params));
      },
      renderFilter: function renderFilter(h, renderOpts, params) {
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
              handleConfirmFilter(params, column, !!value, item);

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
        var _renderOpts$props6 = renderOpts.props,
            props = _renderOpts$props6 === void 0 ? {} : _renderOpts$props6;

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
      renderItem: createFormItemRender(),
      cellExportMethod: createExportMethod(getDatePickerCellValue),
      editCellExportMethod: createExportMethod(getDatePickerCellValue, true)
    },
    ElTimePicker: {
      renderEdit: createEditRender(),
      renderCell: function renderCell(h, renderOpts, params) {
        return getTimePickerCellValue(renderOpts, params);
      },
      renderItem: createFormItemRender(),
      cellExportMethod: createExportMethod(getTimePickerCellValue),
      editCellExportMethod: createExportMethod(getTimePickerCellValue, true)
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
    },
    ElRadio: {
      renderItem: createFormItemRadioAndCheckboxRender()
    },
    ElCheckbox: {
      renderItem: createFormItemRadioAndCheckboxRender()
    },
    ElButton: {
      renderEdit: defaultButtonEditRender,
      renderDefault: defaultButtonEditRender,
      renderItem: defaultButtonItemRender
    },
    ElButtons: {
      renderEdit: defaultButtonsEditRender,
      renderDefault: defaultButtonsEditRender,
      renderItem: defaultButtonsItemRender
    }
  };
  /**
   * 事件兼容性处理
   */

  function handleClearEvent(params, evnt, context) {
    var $table = params.$table;
    var getEventTargetNode = $table ? $table.getEventTargetNode : context.getEventTargetNode;
    var bodyElem = document.body;

    if ( // 远程搜索
    getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag || // 下拉框
    getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag || // 级联
    getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag || getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag || // 日期
    getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag || getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag || // 颜色
    getEventTargetNode(evnt, bodyElem, 'el-color-dropdown').flag) {
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