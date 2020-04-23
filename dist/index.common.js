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

function getOns(renderOpts, params, inputFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var isSameEvent = changeEvent === modelEvent;
  var ons = {};

  _xeUtils["default"].objectEach(events, function (func, key) {
    ons[key] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
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
      on: getEditOns(renderOpts, params)
    })];
  };
}

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  return [h('el-button', {
    attrs: attrs,
    props: getCellEditFilterProps(renderOpts, params, null),
    on: getOns(renderOpts, params)
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
        })
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
      on: getItemOns(renderOpts, params)
    })];
  };
}

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getItemProps(renderOpts, params, null);
  return [h('el-button', {
    attrs: attrs,
    props: props,
    on: getOns(renderOpts, params)
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
      on: getItemOns(renderOpts, params)
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

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('el-select', {
          attrs: attrs,
          props: props,
          on: on
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
        on: on
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
          })
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
          })
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

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('el-select', {
          attrs: attrs,
          props: props,
          on: on
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
        on: on
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
          })
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
          })
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJ0YXJnZXRFdm50IiwiZ2V0RWRpdE9ucyIsInJvdyIsImNvbHVtbiIsInNldCIsInByb3BlcnR5IiwidXBkYXRlU3RhdHVzIiwiZ2V0RmlsdGVyT25zIiwib3B0aW9uIiwiZ2V0SXRlbU9ucyIsIm1hdGNoQ2FzY2FkZXJEYXRhIiwiaW5kZXgiLCJsaXN0IiwibGFiZWxzIiwidmFsIiwibGVuZ3RoIiwiZWFjaCIsIml0ZW0iLCJwdXNoIiwibGFiZWwiLCJjaGlsZHJlbiIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImdldENhc2NhZGVyQ2VsbFZhbHVlIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSIsInJhbmdlU2VwYXJhdG9yIiwiZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSIsImlzUmFuZ2UiLCJjcmVhdGVFZGl0UmVuZGVyIiwiaCIsImF0dHJzIiwib24iLCJkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciIsImNlbGxUZXh0IiwiY29udGVudCIsImRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciIsImNoaWxkUmVuZGVyT3B0cyIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvSW5kZXgiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiJHBhbmVsIiwiY2hhbmdlT3B0aW9uIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsInJlbmRlck9wdGlvbnMiLCJkaXNhYmxlZFByb3AiLCJkaXNhYmxlZCIsImNyZWF0ZUZvcm1JdGVtUmVuZGVyIiwiaXRlbVZhbHVlIiwiZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIiLCJkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIiLCJjcmVhdGVFeHBvcnRNZXRob2QiLCJ2YWx1ZU1ldGhvZCIsImlzRWRpdCIsInJlbmRlclByb3BlcnR5IiwiY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyIiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsInJlbmRlckl0ZW0iLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0IiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImVxTnVsbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsImNlbGxFeHBvcnRNZXRob2QiLCJlZGl0Q2VsbEV4cG9ydE1ldGhvZCIsIkVsQ2FzY2FkZXIiLCJFbERhdGVQaWNrZXIiLCJFbFRpbWVQaWNrZXIiLCJFbFRpbWVTZWxlY3QiLCJFbFJhdGUiLCJFbFN3aXRjaCIsImlzQm9vbGVhbiIsIkVsU2xpZGVyIiwiRWxSYWRpbyIsIkVsQ2hlY2tib3giLCJFbEJ1dHRvbiIsIkVsQnV0dG9ucyIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImV2bnQiLCJjb250YWluZXIiLCJjbGFzc05hbWUiLCJ0YXJnZXRFbGVtIiwidGFyZ2V0Iiwibm9kZVR5cGUiLCJkb2N1bWVudCIsInNwbGl0IiwiZmxhZyIsInBhcmVudE5vZGUiLCJoYW5kbGVDbGVhckV2ZW50IiwiZSIsImJvZHlFbGVtIiwiYm9keSIsIiRldmVudCIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7QUFvQkE7QUFFQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsWUFBVCxDQUF1QkMsVUFBdkIsRUFBZ0Q7QUFDOUMsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsYUFBVCxDQUF3QkQsVUFBeEIsRUFBaUQ7QUFDL0MsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsY0FBVCxDQUF5QkYsVUFBekIsRUFBa0Q7QUFDaEQsTUFBSUcsSUFBSSxHQUFH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T1ksUUFBUCxFQUFpQixtQkFBakIsQ0FBbEIsQ0FBd0RKLElBTHhELElBTUE7QUFDQVQsRUFBQUEsa0JBQWtCLENBQUNDLElBQUQsRUFBT1ksUUFBUCxFQUFpQixlQUFqQixDQUFsQixDQUFvREosSUFQcEQsSUFRQVQsa0JBQWtCLENBQUNDLElBQUQsRUFBT1ksUUFBUCxFQUFpQixpQkFBakIsQ0FBbEIsQ0FBc0RKLElBUnRELElBU0E7QUFDQVQsRUFBQUEsa0JBQWtCLENBQUNDLElBQUQsRUFBT1ksUUFBUCxFQUFpQixtQkFBakIsQ0FBbEIsQ0FBd0RKLElBWjFELEVBYUU7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTU8scUJBQXFCLEdBQUc7QUFDbkNDLEVBQUFBLE9BRG1DLHlCQUNnQjtBQUFBLFFBQXhDQyxXQUF3QyxRQUF4Q0EsV0FBd0M7QUFBQSxRQUEzQkMsUUFBMkIsUUFBM0JBLFFBQTJCO0FBQ2pEQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZXRELFNBQWY7QUFDQW9ELElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNWLGdCQUFyQztBQUNBTyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDVixnQkFBdEM7QUFDRDtBQUxrQyxDQUE5Qjs7O0FBUVAsSUFBSSxPQUFPVyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CUixxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuaW1wb3J0IHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBSZW5kZXJQYXJhbXMsXHJcbiAgT3B0aW9uUHJvcHMsXHJcbiAgUmVuZGVyT3B0aW9ucyxcclxuICBJbnRlcmNlcHRvclBhcmFtcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBGb3JtSXRlbVJlbmRlclBhcmFtc1xyXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKHJlbmRlck9wdHMubmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiB0eXBlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gdmFsdWUgJiYgcHJvcHMudmFsdWVGb3JtYXQgPyBYRVV0aWxzLnRvU3RyaW5nRGF0ZSh2YWx1ZSwgcHJvcHMudmFsdWVGb3JtYXQpIDogdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueVtdLCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJHRhYmxlXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbVByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kZm9ybVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMsIGlucHV0RnVuYz86IEZ1bmN0aW9uLCBjaGFuZ2VGdW5jPzogRnVuY3Rpb24pIHtcclxuICBjb25zdCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG1vZGVsRXZlbnQgPSBnZXRNb2RlbEV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgY2hhbmdlRXZlbnQgPSBnZXRDaGFuZ2VFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGlzU2FtZUV2ZW50ID0gY2hhbmdlRXZlbnQgPT09IG1vZGVsRXZlbnRcclxuICBjb25zdCBvbnM6IHsgW3R5cGU6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxyXG4gIFhFVXRpbHMub2JqZWN0RWFjaChldmVudHMsIChmdW5jOiBGdW5jdGlvbiwga2V5OiBzdHJpbmcpID0+IHtcclxuICAgIG9uc1trZXldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGZ1bmMocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgaWYgKGlucHV0RnVuYykge1xyXG4gICAgb25zW21vZGVsRXZlbnRdID0gZnVuY3Rpb24gKHRhcmdldEV2bnQ6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmModGFyZ2V0RXZudClcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbbW9kZWxFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbbW9kZWxFdmVudF0ocGFyYW1zLCB0YXJnZXRFdm50KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYyh0YXJnZXRFdm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgb25zW2NoYW5nZUV2ZW50XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjaGFuZ2VGdW5jKC4uLmFyZ3MpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW2NoYW5nZUV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1tjaGFuZ2VFdmVudF0ocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBvbnNcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkdGFibGUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgb3B0aW9uOiBDb2x1bW5GaWx0ZXJQYXJhbXMsIGNoYW5nZUZ1bmM6IEZ1bmN0aW9uKSB7XHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBvcHRpb24uZGF0YSA9IHZhbHVlXHJcbiAgfSwgY2hhbmdlRnVuYylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbU9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJGZvcm0sIGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICB9LCAoKSA9PiB7XHJcbiAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogYW55W10sIHZhbHVlczogYW55W10sIGxhYmVsczogYW55W10pIHtcclxuICBjb25zdCB2YWwgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW0pID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCAkdGFibGU6IGFueSA9IHBhcmFtcy4kdGFibGVcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCBjb2xpZCA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBjb25zdCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgY29uc3QgY2FjaGVDZWxsID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWUpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWUpID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgY29uc3QgY2VsbExhYmVsID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCcsICcpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBjb25zdCB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgY29uc3QgbGFiZWxzOiBhbnlbXSA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyB8IENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zIHwgQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGlmIChjZWxsVmFsdWUgJiYgaXNSYW5nZSkge1xyXG4gICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgfVxyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbCksXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIGNoZWNrZWQ6IGJvb2xlYW4sIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkcGFuZWwgfSA9IHBhcmFtc1xyXG4gICRwYW5lbC5jaGFuZ2VPcHRpb24oe30sIGNoZWNrZWQsIG9wdGlvbilcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgY29uc3QgY2VsbFZhbHVlOiBzdHJpbmcgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogQ3JlYXRlRWxlbWVudCwgb3B0aW9uczogYW55W10sIG9wdGlvblByb3BzOiBPcHRpb25Qcm9wcykge1xyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbSwgb0luZGV4KSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBDcmVhdGVFbGVtZW50LCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCB8fCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucykgPT4gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIoaCwgY2hpbGRSZW5kZXJPcHRzLCBwYXJhbXMpWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFeHBvcnRNZXRob2QgKHZhbHVlTWV0aG9kOiBGdW5jdGlvbiwgaXNFZGl0PzogYm9vbGVhbikge1xyXG4gIGNvbnN0IHJlbmRlclByb3BlcnR5ID0gaXNFZGl0ID8gJ2VkaXRSZW5kZXInIDogJ2NlbGxSZW5kZXInXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYXJhbXM6IENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBuYW1lLCBvcHRpb25zID0gW10sIG9wdGlvblByb3BzID0ge30sIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgIGNvbnN0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChgJHtuYW1lfUdyb3VwYCwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUpLFxyXG4gICAgICAgIG9uOiBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBFbEF1dG9jb21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItZWxlbWVudC13cmFwcGVyJ1xyXG4gICAgICAgIH0sIG9wdGlvbkdyb3Vwc1xyXG4gICAgICAgICAgPyBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgcHJvcHMubXVsdGlwbGUgPyAob3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCkgOiAhWEVVdGlscy5lcU51bGwob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICA6IGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBwcm9wcy5tdWx0aXBsZSA/IChvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwKSA6ICFYRVV0aWxzLmVxTnVsbChvcHRpb24uZGF0YSksIG9wdGlvbilcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWVsZW1lbnQtd3JhcHBlcidcclxuICAgICAgICB9LCBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBnZXRUaW1lUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItZWxlbWVudC13cmFwcGVyJ1xyXG4gICAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIFhFVXRpbHMuaXNCb29sZWFuKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYWRpbzoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBFbEJ1dHRvbjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgRWxCdXR0b25zOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXJcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6Xop6blj5HmupDmmK/lkKblsZ7kuo7nm67moIfoioLngrlcclxuICovXHJcbmZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0Tm9kZSAoZXZudDogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xyXG4gIGxldCB0YXJnZXRFbGVtXHJcbiAgbGV0IHRhcmdldCA9IGV2bnQudGFyZ2V0XHJcbiAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQubm9kZVR5cGUgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgaWYgKGNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCgnICcpLmluZGV4T2YoY2xhc3NOYW1lKSA+IC0xKSB7XHJcbiAgICAgIHRhcmdldEVsZW0gPSB0YXJnZXRcclxuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09PSBjb250YWluZXIpIHtcclxuICAgICAgcmV0dXJuIHsgZmxhZzogY2xhc3NOYW1lID8gISF0YXJnZXRFbGVtIDogdHJ1ZSwgY29udGFpbmVyLCB0YXJnZXRFbGVtOiB0YXJnZXRFbGVtIH1cclxuICAgIH1cclxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlXHJcbiAgfVxyXG4gIHJldHVybiB7IGZsYWc6IGZhbHNlIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBhbnksIGU6IGFueSkge1xyXG4gIGNvbnN0IGJvZHlFbGVtID0gZG9jdW1lbnQuYm9keVxyXG4gIGNvbnN0IGV2bnQgPSBwYXJhbXMuJGV2ZW50IHx8IGVcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC10aW1lLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgLy8g6aKc6ImyXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jb2xvci1kcm9wZG93bicpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGVsZW1lbnQtdWkg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FbGVtZW50ID0ge1xyXG4gIGluc3RhbGwgKHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH06IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
