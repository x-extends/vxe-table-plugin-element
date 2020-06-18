"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginElement = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

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
exports.VXETablePluginElement = VXETablePluginElement;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement);
}

var _default = VXETablePluginElement;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXROYXRpdmVPbnMiLCJuYXRpdmVFdmVudHMiLCJuYXRpdmVPbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJ0YXJnZXRFdm50IiwiZ2V0RWRpdE9ucyIsInJvdyIsImNvbHVtbiIsInNldCIsInByb3BlcnR5IiwidXBkYXRlU3RhdHVzIiwiZ2V0RmlsdGVyT25zIiwib3B0aW9uIiwiZ2V0SXRlbU9ucyIsIm1hdGNoQ2FzY2FkZXJEYXRhIiwiaW5kZXgiLCJsaXN0IiwibGFiZWxzIiwidmFsIiwibGVuZ3RoIiwiZWFjaCIsIml0ZW0iLCJwdXNoIiwibGFiZWwiLCJjaGlsZHJlbiIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImdldENhc2NhZGVyQ2VsbFZhbHVlIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSIsInJhbmdlU2VwYXJhdG9yIiwiZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSIsImlzUmFuZ2UiLCJjcmVhdGVFZGl0UmVuZGVyIiwiaCIsImF0dHJzIiwib24iLCJuYXRpdmVPbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZXFOdWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiaXNCb29sZWFuIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsIkVsQnV0dG9uIiwiRWxCdXR0b25zIiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiZXZudCIsImNvbnRhaW5lciIsImNsYXNzTmFtZSIsInRhcmdldEVsZW0iLCJ0YXJnZXQiLCJub2RlVHlwZSIsImRvY3VtZW50Iiwic3BsaXQiLCJmbGFnIiwicGFyZW50Tm9kZSIsImhhbmRsZUNsZWFyRXZlbnQiLCJlIiwiYm9keUVsZW0iLCJib2R5IiwiJGV2ZW50IiwiVlhFVGFibGVQbHVnaW5FbGVtZW50IiwiaW5zdGFsbCIsImludGVyY2VwdG9yIiwicmVuZGVyZXIiLCJtaXhpbiIsImFkZCIsIndpbmRvdyIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7Ozs7OztBQW9CQTtBQUVBLFNBQVNBLFlBQVQsQ0FBdUJDLFNBQXZCLEVBQXFDO0FBQ25DLFNBQU9BLFNBQVMsS0FBSyxJQUFkLElBQXNCQSxTQUFTLEtBQUtDLFNBQXBDLElBQWlERCxTQUFTLEtBQUssRUFBdEU7QUFDRDs7QUFFRCxTQUFTRSxZQUFULENBQXVCQyxVQUF2QixFQUFnRDtBQUM5QyxTQUFPLE9BQVA7QUFDRDs7QUFFRCxTQUFTQyxhQUFULENBQXdCRCxVQUF4QixFQUFpRDtBQUMvQyxTQUFPLE9BQVA7QUFDRDs7QUFF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LFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNWLGdCQUFyQztBQUNBTyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDVixnQkFBdEM7QUFDRDtBQUxrQyxDQUE5Qjs7O0FBUVAsSUFBSSxPQUFPVyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CUixxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuaW1wb3J0IHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBSZW5kZXJQYXJhbXMsXHJcbiAgT3B0aW9uUHJvcHMsXHJcbiAgUmVuZGVyT3B0aW9ucyxcclxuICBJbnRlcmNlcHRvclBhcmFtcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBGb3JtSXRlbVJlbmRlclBhcmFtc1xyXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKHJlbmRlck9wdHMubmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiB0eXBlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gdmFsdWUgJiYgcHJvcHMudmFsdWVGb3JtYXQgPyBYRVV0aWxzLnRvU3RyaW5nRGF0ZSh2YWx1ZSwgcHJvcHMudmFsdWVGb3JtYXQpIDogdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueVtdLCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJHRhYmxlXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbVByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kZm9ybVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5hdGl2ZU9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IG5hdGl2ZUV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG5hdGl2ZU9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKG5hdGl2ZUV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgbmF0aXZlT25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICByZXR1cm4gbmF0aXZlT25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMsIGlucHV0RnVuYz86IEZ1bmN0aW9uLCBjaGFuZ2VGdW5jPzogRnVuY3Rpb24pIHtcclxuICBjb25zdCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG1vZGVsRXZlbnQgPSBnZXRNb2RlbEV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgY2hhbmdlRXZlbnQgPSBnZXRDaGFuZ2VFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGlzU2FtZUV2ZW50ID0gY2hhbmdlRXZlbnQgPT09IG1vZGVsRXZlbnRcclxuICBjb25zdCBvbnM6IHsgW3R5cGU6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxyXG4gIFhFVXRpbHMub2JqZWN0RWFjaChldmVudHMsIChmdW5jOiBGdW5jdGlvbiwga2V5OiBzdHJpbmcpID0+IHtcclxuICAgIG9uc1trZXldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGZ1bmMocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgaWYgKGlucHV0RnVuYykge1xyXG4gICAgb25zW21vZGVsRXZlbnRdID0gZnVuY3Rpb24gKHRhcmdldEV2bnQ6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmModGFyZ2V0RXZudClcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbbW9kZWxFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbbW9kZWxFdmVudF0ocGFyYW1zLCB0YXJnZXRFdm50KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYyh0YXJnZXRFdm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgb25zW2NoYW5nZUV2ZW50XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjaGFuZ2VGdW5jKC4uLmFyZ3MpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW2NoYW5nZUV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1tjaGFuZ2VFdmVudF0ocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBvbnNcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgb3B0aW9uOiBDb2x1bW5GaWx0ZXJQYXJhbXMsIGNoYW5nZUZ1bmM6IEZ1bmN0aW9uKSB7XHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBvcHRpb24uZGF0YSA9IHZhbHVlXHJcbiAgfSwgY2hhbmdlRnVuYylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbU9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJGZvcm0sIGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogYW55W10sIHZhbHVlczogYW55W10sIGxhYmVsczogYW55W10pIHtcclxuICBjb25zdCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW0pID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCAkdGFibGU6IGFueSA9IHBhcmFtcy4kdGFibGVcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCBjb2xpZCA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBjb25zdCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgY29uc3QgY2FjaGVDZWxsID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWUpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWUpID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgY29uc3QgY2VsbExhYmVsID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCcsICcpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgY29uc3QgbGFiZWxzOiBhbnlbXSA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyB8IENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zIHwgQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGlmIChjZWxsVmFsdWUgJiYgaXNSYW5nZSkge1xyXG4gICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgfVxyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKSxcclxuICAgICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcyksXHJcbiAgICAgIG5hdGl2ZU9uOiBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBuYXRpdmVPbiA9IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgfSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgY2hlY2tlZDogYm9vbGVhbiwgb3B0aW9uOiBDb2x1bW5GaWx0ZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRwYW5lbCB9ID0gcGFyYW1zXHJcbiAgJHBhbmVsLmNoYW5nZU9wdGlvbih7fSwgY2hlY2tlZCwgb3B0aW9uKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICBjb25zdCBjZWxsVmFsdWU6IHN0cmluZyA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpLFxyXG4gICAgICAgIG5hdGl2ZU9uOiBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcyksXHJcbiAgICAgIG5hdGl2ZU9uOiBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50IHx8IHByb3BzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKSxcclxuICAgICAgICBuYXRpdmVPbjogZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBFbEF1dG9jb21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGNvbnN0IG5hdGl2ZU9uID0gZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvbixcclxuICAgICAgICAgICAgbmF0aXZlT25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBvbixcclxuICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IG5hdGl2ZU9uID0gZ2V0TmF0aXZlT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWVsZW1lbnQtd3JhcHBlcidcclxuICAgICAgICB9LCBvcHRpb25Hcm91cHNcclxuICAgICAgICAgID8gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIHByb3BzLm11bHRpcGxlID8gKG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDApIDogIVhFVXRpbHMuZXFOdWxsKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgOiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgcHJvcHMubXVsdGlwbGUgPyAob3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCkgOiAhWEVVdGlscy5lcU51bGwob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgbmF0aXZlT25cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBjb25zdCBuYXRpdmVPbiA9IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb24sXHJcbiAgICAgICAgICAgIG5hdGl2ZU9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgb24sXHJcbiAgICAgICAgICBuYXRpdmVPblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgbmF0aXZlT24gPSBnZXROYXRpdmVPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItZWxlbWVudC13cmFwcGVyJ1xyXG4gICAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgbmF0aXZlT25cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBnZXRUaW1lUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBuYXRpdmVPbiA9IGdldE5hdGl2ZU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBuYXRpdmVPblxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYWRpbzoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBFbEJ1dHRvbjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgRWxCdXR0b25zOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXJcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6Xop6blj5HmupDmmK/lkKblsZ7kuo7nm67moIfoioLngrlcclxuICovXHJcbmZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0Tm9kZSAoZXZudDogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xyXG4gIGxldCB0YXJnZXRFbGVtXHJcbiAgbGV0IHRhcmdldCA9IGV2bnQudGFyZ2V0XHJcbiAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQubm9kZVR5cGUgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgaWYgKGNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCgnICcpLmluZGV4T2YoY2xhc3NOYW1lKSA+IC0xKSB7XHJcbiAgICAgIHRhcmdldEVsZW0gPSB0YXJnZXRcclxuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09PSBjb250YWluZXIpIHtcclxuICAgICAgcmV0dXJuIHsgZmxhZzogY2xhc3NOYW1lID8gISF0YXJnZXRFbGVtIDogdHJ1ZSwgY29udGFpbmVyLCB0YXJnZXRFbGVtOiB0YXJnZXRFbGVtIH1cclxuICAgIH1cclxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlXHJcbiAgfVxyXG4gIHJldHVybiB7IGZsYWc6IGZhbHNlIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBJbnRlcmNlcHRvclBhcmFtcywgZTogYW55KSB7XHJcbiAgY29uc3QgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgY29uc3QgZXZudCA9IHBhcmFtcy4kZXZlbnQgfHwgZVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXRpbWUtcGFuZWwnKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnIHx8XHJcbiAgICAvLyDpopzoibJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNvbG9yLWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
