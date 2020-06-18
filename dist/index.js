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

  /* eslint-enable no-unused-vars */
  function isEmptyValue(cellValue) {
    return cellValue === null || cellValue === undefined || cellValue === '';
  }

  function getModelProp(renderOpts) {
    return 'value';
  }

  function getModelEvent(renderOpts) {
    return 'input';
  }

  function getChangeEvent(renderOpts) {
    var type = 'change';

    switch (renderOpts.name) {
      case 'ElAutocomplete':
        type = 'select';
        break;

      case 'ElInput':
      case 'ElInputNumber':
        type = 'input';
        break;
    }

    return type;
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

  function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
    var vSize = params.$table.vSize;
    return _xeUtils["default"].assign(vSize ? {
      size: vSize
    } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
  }

  function getItemProps(renderOpts, params, value, defaultProps) {
    var vSize = params.$form.vSize;
    return _xeUtils["default"].assign(vSize ? {
      size: vSize
    } : {}, defaultProps, renderOpts.props, _defineProperty({}, getModelProp(renderOpts), value));
  }

  function getNativeOns(renderOpts, params) {
    var nativeEvents = renderOpts.nativeEvents;
    var nativeOns = {};

    _xeUtils["default"].objectEach(nativeEvents, function (func, key) {
      nativeOns[key] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        func.apply(void 0, [params].concat(args));
      };
    });

    return nativeOns;
  }

  function getOns(renderOpts, params, inputFunc, changeFunc) {
    var events = renderOpts.events;
    var modelEvent = getModelEvent(renderOpts);
    var changeEvent = getChangeEvent(renderOpts);
    var isSameEvent = changeEvent === modelEvent;
    var ons = {};

    _xeUtils["default"].objectEach(events, function (func, key) {
      ons[key] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        func.apply(void 0, [params].concat(args));
      };
    });

    if (inputFunc) {
      ons[modelEvent] = function (targetEvnt) {
        inputFunc(targetEvnt);

        if (events && events[modelEvent]) {
          events[modelEvent](params, targetEvnt);
        }

        if (isSameEvent && changeFunc) {
          changeFunc(targetEvnt);
        }
      };
    }

    if (!isSameEvent && changeFunc) {
      ons[changeEvent] = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        changeFunc.apply(void 0, args);

        if (events && events[changeEvent]) {
          events[changeEvent].apply(events, [params].concat(args));
        }
      };
    }

    return ons;
  }

  function getEditOns(renderOpts, params) {
    var $table = params.$table,
        row = params.row,
        column = params.column;
    return getOns(renderOpts, params, function (value) {
      // 处理 model 值双向绑定
      _xeUtils["default"].set(row, column.property, value);
    }, function () {
      // 处理 change 事件相关逻辑
      $table.updateStatus(params);
    });
  }

  function getFilterOns(renderOpts, params, option, changeFunc) {
    return getOns(renderOpts, params, function (value) {
      // 处理 model 值双向绑定
      option.data = value;
    }, changeFunc);
  }

  function getItemOns(renderOpts, params) {
    var $form = params.$form,
        data = params.data,
        property = params.property;
    return getOns(renderOpts, params, function (value) {
      // 处理 model 值双向绑定
      _xeUtils["default"].set(data, property, value);
    }, function () {
      // 处理 change 事件相关逻辑
      $form.updateStatus(params);
    });
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

  function getSelectCellValue(renderOpts, params) {
    var _renderOpts$options = renderOpts.options,
        options = _renderOpts$options === void 0 ? [] : _renderOpts$options,
        optionGroups = renderOpts.optionGroups,
        _renderOpts$props = renderOpts.props,
        props = _renderOpts$props === void 0 ? {} : _renderOpts$props,
        _renderOpts$optionPro = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro === void 0 ? {} : _renderOpts$optionPro,
        _renderOpts$optionGro = renderOpts.optionGroupProps,
        optionGroupProps = _renderOpts$optionGro === void 0 ? {} : _renderOpts$optionGro;
    var row = params.row,
        column = params.column;
    var $table = params.$table;
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

      var cellValue = _xeUtils["default"].get(row, column.property);

      return [h(renderOpts.name, {
        attrs: attrs,
        props: getCellEditFilterProps(renderOpts, params, cellValue, defaultProps),
        on: getEditOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      })];
    };
  }

  function defaultButtonEditRender(h, renderOpts, params) {
    var attrs = renderOpts.attrs;
    return [h('el-button', {
      attrs: attrs,
      props: getCellEditFilterProps(renderOpts, params, null),
      on: getOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    }, cellText(h, renderOpts.content))];
  }

  function defaultButtonsEditRender(h, renderOpts, params) {
    return renderOpts.children.map(function (childRenderOpts) {
      return defaultButtonEditRender(h, childRenderOpts, params)[0];
    });
  }

  function createFilterRender(defaultProps) {
    return function (h, renderOpts, params) {
      var column = params.column;
      var name = renderOpts.name,
          attrs = renderOpts.attrs;
      var nativeOn = getNativeOns(renderOpts, params);
      return [h('div', {
        "class": 'vxe-table--filter-element-wrapper'
      }, column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        return h(name, {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue, defaultProps),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, !!option.data, option);
          }),
          nativeOn: nativeOn
        });
      }))];
    };
  }

  function handleConfirmFilter(params, checked, option) {
    var $panel = params.$panel;
    $panel.changeOption({}, checked, option);
  }

  function defaultFilterMethod(params) {
    var option = params.option,
        row = params.row,
        column = params.column;
    var data = option.data;

    var cellValue = _xeUtils["default"].get(row, column.property);
    /* eslint-disable eqeqeq */


    return cellValue == data;
  }

  function renderOptions(h, options, optionProps) {
    var labelProp = optionProps.label || 'label';
    var valueProp = optionProps.value || 'value';
    var disabledProp = optionProps.disabled || 'disabled';
    return _xeUtils["default"].map(options, function (item, oIndex) {
      return h('el-option', {
        key: oIndex,
        props: {
          value: item[valueProp],
          label: item[labelProp],
          disabled: item[disabledProp]
        }
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

      var itemValue = _xeUtils["default"].get(data, property);

      return [h(name, {
        attrs: attrs,
        props: getItemProps(renderOpts, params, itemValue, defaultProps),
        on: getItemOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      })];
    };
  }

  function defaultButtonItemRender(h, renderOpts, params) {
    var attrs = renderOpts.attrs;
    var props = getItemProps(renderOpts, params, null);
    return [h('el-button', {
      attrs: attrs,
      props: props,
      on: getOns(renderOpts, params),
      nativeOn: getNativeOns(renderOpts, params)
    }, cellText(h, renderOpts.content || props.content))];
  }

  function defaultButtonsItemRender(h, renderOpts, params) {
    return renderOpts.children.map(function (childRenderOpts) {
      return defaultButtonItemRender(h, childRenderOpts, params)[0];
    });
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
          _renderOpts$options2 = renderOpts.options,
          options = _renderOpts$options2 === void 0 ? [] : _renderOpts$options2,
          _renderOpts$optionPro2 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2,
          attrs = renderOpts.attrs;
      var data = params.data,
          property = params.property;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var disabledProp = optionProps.disabled || 'disabled';

      var itemValue = _xeUtils["default"].get(data, property);

      return [h("".concat(name, "Group"), {
        attrs: attrs,
        props: getItemProps(renderOpts, params, itemValue),
        on: getItemOns(renderOpts, params),
        nativeOn: getNativeOns(renderOpts, params)
      }, options.map(function (option, oIndex) {
        return h(name, {
          key: oIndex,
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
        var _renderOpts$options3 = renderOpts.options,
            options = _renderOpts$options3 === void 0 ? [] : _renderOpts$options3,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro3 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro3 === void 0 ? {} : _renderOpts$optionPro3,
            _renderOpts$optionGro2 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro2 === void 0 ? {} : _renderOpts$optionGro2;
        var row = params.row,
            column = params.column;
        var attrs = renderOpts.attrs;

        var cellValue = _xeUtils["default"].get(row, column.property);

        var props = getCellEditFilterProps(renderOpts, params, cellValue);
        var on = getEditOns(renderOpts, params);
        var nativeOn = getNativeOns(renderOpts, params);

        if (optionGroups) {
          var groupOptions = optionGroupProps.options || 'options';
          var groupLabel = optionGroupProps.label || 'label';
          return [h('el-select', {
            attrs: attrs,
            props: props,
            on: on,
            nativeOn: nativeOn
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('el-option-group', {
              key: gIndex,
              props: {
                label: group[groupLabel]
              }
            }, renderOptions(h, group[groupOptions], optionProps));
          }))];
        }

        return [h('el-select', {
          props: props,
          attrs: attrs,
          on: on,
          nativeOn: nativeOn
        }, renderOptions(h, options, optionProps))];
      },
      renderCell: function renderCell(h, renderOpts, params) {
        return cellText(h, getSelectCellValue(renderOpts, params));
      },
      renderFilter: function renderFilter(h, renderOpts, params) {
        var _renderOpts$options4 = renderOpts.options,
            options = _renderOpts$options4 === void 0 ? [] : _renderOpts$options4,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro4 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro4 === void 0 ? {} : _renderOpts$optionPro4,
            _renderOpts$optionGro3 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro3 === void 0 ? {} : _renderOpts$optionGro3;
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        var column = params.column;
        var attrs = renderOpts.attrs;
        var nativeOn = getNativeOns(renderOpts, params);
        return [h('div', {
          "class": 'vxe-table--filter-element-wrapper'
        }, optionGroups ? column.filters.map(function (option, oIndex) {
          var optionValue = option.data;
          var props = getCellEditFilterProps(renderOpts, params, optionValue);
          return h('el-select', {
            key: oIndex,
            attrs: attrs,
            props: props,
            on: getFilterOns(renderOpts, params, option, function () {
              // 处理 change 事件相关逻辑
              handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils["default"].eqNull(option.data), option);
            }),
            nativeOn: nativeOn
          }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
            return h('el-option-group', {
              key: gIndex,
              props: {
                label: group[groupLabel]
              }
            }, renderOptions(h, group[groupOptions], optionProps));
          }));
        }) : column.filters.map(function (option, oIndex) {
          var optionValue = option.data;
          var props = getCellEditFilterProps(renderOpts, params, optionValue);
          return h('el-select', {
            key: oIndex,
            attrs: attrs,
            props: props,
            on: getFilterOns(renderOpts, params, option, function () {
              // 处理 change 事件相关逻辑
              handleConfirmFilter(params, props.multiple ? option.data && option.data.length > 0 : !_xeUtils["default"].eqNull(option.data), option);
            }),
            nativeOn: nativeOn
          }, renderOptions(h, options, optionProps));
        }))];
      },
      filterMethod: function filterMethod(params) {
        var option = params.option,
            row = params.row,
            column = params.column;
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
        var _renderOpts$options5 = renderOpts.options,
            options = _renderOpts$options5 === void 0 ? [] : _renderOpts$options5,
            optionGroups = renderOpts.optionGroups,
            _renderOpts$optionPro5 = renderOpts.optionProps,
            optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
            _renderOpts$optionGro4 = renderOpts.optionGroupProps,
            optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
        var data = params.data,
            property = params.property;
        var attrs = renderOpts.attrs;

        var itemValue = _xeUtils["default"].get(data, property);

        var props = getItemProps(renderOpts, params, itemValue);
        var on = getItemOns(renderOpts, params);
        var nativeOn = getNativeOns(renderOpts, params);

        if (optionGroups) {
          var groupOptions = optionGroupProps.options || 'options';
          var groupLabel = optionGroupProps.label || 'label';
          return [h('el-select', {
            attrs: attrs,
            props: props,
            on: on,
            nativeOn: nativeOn
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
          attrs: attrs,
          props: props,
          on: on,
          nativeOn: nativeOn
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
        var attrs = renderOpts.attrs;
        var nativeOn = getNativeOns(renderOpts, params);
        return [h('div', {
          "class": 'vxe-table--filter-element-wrapper'
        }, column.filters.map(function (option, oIndex) {
          var optionValue = option.data;
          return h(renderOpts.name, {
            key: oIndex,
            attrs: attrs,
            props: getCellEditFilterProps(renderOpts, params, optionValue),
            on: getFilterOns(renderOpts, params, option, function () {
              // 处理 change 事件相关逻辑
              handleConfirmFilter(params, !!option.data, option);
            }),
            nativeOn: nativeOn
          });
        }))];
      },
      filterMethod: function filterMethod(params) {
        var option = params.option,
            row = params.row,
            column = params.column;
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
        return [getTimePickerCellValue(renderOpts, params)];
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
      renderFilter: function renderFilter(h, renderOpts, params) {
        var column = params.column;
        var name = renderOpts.name,
            attrs = renderOpts.attrs;
        var nativeOn = getNativeOns(renderOpts, params);
        return [h('div', {
          "class": 'vxe-table--filter-element-wrapper'
        }, column.filters.map(function (option, oIndex) {
          var optionValue = option.data;
          return h(name, {
            key: oIndex,
            attrs: attrs,
            props: getCellEditFilterProps(renderOpts, params, optionValue),
            on: getFilterOns(renderOpts, params, option, function () {
              // 处理 change 事件相关逻辑
              handleConfirmFilter(params, _xeUtils["default"].isBoolean(option.data), option);
            }),
            nativeOn: nativeOn
          });
        }))];
      },
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
      renderDefault: defaultButtonEditRender,
      renderItem: defaultButtonItemRender
    },
    ElButtons: {
      renderDefault: defaultButtonsEditRender,
      renderItem: defaultButtonsItemRender
    }
  };
  /**
   * 检查触发源是否属于目标节点
   */

  function getEventTargetNode(evnt, container, className) {
    var targetElem;
    var target = evnt.target;

    while (target && target.nodeType && target !== document) {
      if (className && target.className && target.className.split && target.className.split(' ').indexOf(className) > -1) {
        targetElem = target;
      } else if (target === container) {
        return {
          flag: className ? !!targetElem : true,
          container: container,
          targetElem: targetElem
        };
      }

      target = target.parentNode;
    }

    return {
      flag: false
    };
  }
  /**
   * 事件兼容性处理
   */


  function handleClearEvent(params, e) {
    var bodyElem = document.body;
    var evnt = params.$event || e;

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
    install: function install(_ref) {
      var interceptor = _ref.interceptor,
          renderer = _ref.renderer;
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