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
    ons[modelEvent] = function (args1) {
      inputFunc(args1);

      if (events && events[modelEvent]) {
        events[modelEvent](args1);
      }

      if (isSameEvent && changeFunc) {
        changeFunc(args1);
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
        return h('el-select', {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, option.data && option.data.length > 0, option);
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
        return h('el-select', {
          key: oIndex,
          attrs: attrs,
          props: getCellEditFilterProps(renderOpts, params, optionValue),
          on: getFilterOns(renderOpts, params, option, function () {
            // 处理 change 事件相关逻辑
            handleConfirmFilter(params, option.data && option.data.length > 0, option);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJhcmdzMSIsImdldEVkaXRPbnMiLCJyb3ciLCJjb2x1bW4iLCJzZXQiLCJwcm9wZXJ0eSIsInVwZGF0ZVN0YXR1cyIsImdldEZpbHRlck9ucyIsIm9wdGlvbiIsImdldEl0ZW1PbnMiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRTZWxlY3RDZWxsVmFsdWUiLCJvcHRpb25zIiwib3B0aW9uR3JvdXBzIiwib3B0aW9uUHJvcHMiLCJvcHRpb25Hcm91cFByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZ3JvdXBPcHRpb25zIiwiZ2V0IiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsImZpbHRlcmFibGUiLCJmdWxsQWxsRGF0YVJvd01hcCIsImNhY2hlQ2VsbCIsImhhcyIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjZWxsTGFiZWwiLCJnZXRDYXNjYWRlckNlbGxWYWx1ZSIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsImdldERhdGVQaWNrZXJDZWxsVmFsdWUiLCJyYW5nZVNlcGFyYXRvciIsImdldFRpbWVQaWNrZXJDZWxsVmFsdWUiLCJpc1JhbmdlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm9uIiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib0luZGV4Iiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNoYW5nZU9wdGlvbiIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsIml0ZW1WYWx1ZSIsImRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIiwiZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIiwiY3JlYXRlRXhwb3J0TWV0aG9kIiwidmFsdWVNZXRob2QiLCJpc0VkaXQiLCJyZW5kZXJQcm9wZXJ0eSIsImNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJyZW5kZXJJdGVtIiwiRWxJbnB1dCIsIkVsSW5wdXROdW1iZXIiLCJFbFNlbGVjdCIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJjZWxsRXhwb3J0TWV0aG9kIiwiZWRpdENlbGxFeHBvcnRNZXRob2QiLCJFbENhc2NhZGVyIiwiRWxEYXRlUGlja2VyIiwiRWxUaW1lUGlja2VyIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJpc0Jvb2xlYW4iLCJFbFNsaWRlciIsIkVsUmFkaW8iLCJFbENoZWNrYm94IiwiRWxCdXR0b24iLCJFbEJ1dHRvbnMiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJldm50IiwiY29udGFpbmVyIiwiY2xhc3NOYW1lIiwidGFyZ2V0RWxlbSIsInRhcmdldCIsIm5vZGVUeXBlIiwiZG9jdW1lbnQiLCJzcGxpdCIsImZsYWciLCJwYXJlbnROb2RlIiwiaGFuZGxlQ2xlYXJFdmVudCIsImUiLCJib2R5RWxlbSIsImJvZHkiLCIkZXZlbnQiLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7O0FBb0JBO0FBRUEsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELE1BQUlHLElBQUksR0FBRyxRQUFYOztBQUNBLFVB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d0RKLElBWjFELEVBYUU7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTU8scUJBQXFCLEdBQUc7QUFDbkNDLEVBQUFBLE9BRG1DLHlCQUNnQjtBQUFBLFFBQXhDQyxXQUF3QyxRQUF4Q0EsV0FBd0M7QUFBQSxRQUEzQkMsUUFBMkIsUUFBM0JBLFFBQTJCO0FBQ2pEQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZXJELFNBQWY7QUFDQW1ELElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNWLGdCQUFyQztBQUNBTyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDVixnQkFBdEM7QUFDRDtBQUxrQyxDQUE5Qjs7O0FBUVAsSUFBSSxPQUFPVyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CUixxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuaW1wb3J0IHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBSZW5kZXJQYXJhbXMsXHJcbiAgT3B0aW9uUHJvcHMsXHJcbiAgUmVuZGVyT3B0aW9ucyxcclxuICBJbnRlcmNlcHRvclBhcmFtcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBGb3JtSXRlbVJlbmRlclBhcmFtc1xyXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKHJlbmRlck9wdHMubmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiB0eXBlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gdmFsdWUgJiYgcHJvcHMudmFsdWVGb3JtYXQgPyBYRVV0aWxzLnRvU3RyaW5nRGF0ZSh2YWx1ZSwgcHJvcHMudmFsdWVGb3JtYXQpIDogdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueVtdLCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJHRhYmxlXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SXRlbVByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kZm9ybVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMsIGlucHV0RnVuYz86IEZ1bmN0aW9uLCBjaGFuZ2VGdW5jPzogRnVuY3Rpb24pIHtcclxuICBjb25zdCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG1vZGVsRXZlbnQgPSBnZXRNb2RlbEV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgY2hhbmdlRXZlbnQgPSBnZXRDaGFuZ2VFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGlzU2FtZUV2ZW50ID0gY2hhbmdlRXZlbnQgPT09IG1vZGVsRXZlbnRcclxuICBjb25zdCBvbnM6IHsgW3R5cGU6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxyXG4gIFhFVXRpbHMub2JqZWN0RWFjaChldmVudHMsIChmdW5jOiBGdW5jdGlvbiwga2V5OiBzdHJpbmcpID0+IHtcclxuICAgIG9uc1trZXldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGZ1bmMocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgaWYgKGlucHV0RnVuYykge1xyXG4gICAgb25zW21vZGVsRXZlbnRdID0gZnVuY3Rpb24gKGFyZ3MxOiBhbnkpIHtcclxuICAgICAgaW5wdXRGdW5jKGFyZ3MxKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1ttb2RlbEV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1ttb2RlbEV2ZW50XShhcmdzMSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgICAgIGNoYW5nZUZ1bmMoYXJnczEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoLi4uYXJncylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbY2hhbmdlRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW2NoYW5nZUV2ZW50XShwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG9uc1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZGl0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcywgY2hhbmdlRnVuYzogRnVuY3Rpb24pIHtcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIG9wdGlvbi5kYXRhID0gdmFsdWVcclxuICB9LCBjaGFuZ2VGdW5jKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyAkZm9ybSwgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBhbnlbXSwgdmFsdWVzOiBhbnlbXSwgbGFiZWxzOiBhbnlbXSkge1xyXG4gIGNvbnN0IHZhbCA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0ICR0YWJsZTogYW55ID0gcGFyYW1zLiR0YWJsZVxyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IGNvbGlkID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGNvbnN0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBjb25zdCBjYWNoZUNlbGwgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbTogYW55XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBjb25zdCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWwgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICBjb25zdCBsYWJlbHM6IGFueVtdID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gKHByb3BzLnNob3dBbGxMZXZlbHMgPT09IGZhbHNlID8gbGFiZWxzLnNsaWNlKGxhYmVscy5sZW5ndGggLSAxLCBsYWJlbHMubGVuZ3RoKSA6IGxhYmVscykuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zIHwgQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMgfCBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgaWYgKGNlbGxWYWx1ZSAmJiBpc1JhbmdlKSB7XHJcbiAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlKSA9PiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoZGF0ZSwgcHJvcHMpLCBmb3JtYXQpKS5qb2luKGAgJHtyYW5nZVNlcGFyYXRvcn0gYClcclxuICB9XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShjZWxsVmFsdWUsIHByb3BzKSwgZm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICByZXR1cm4gW1xyXG4gICAgaCgnZWwtYnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKSxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgcmV0dXJuIHJlbmRlck9wdHMuY2hpbGRyZW4ubWFwKChjaGlsZFJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWVsZW1lbnQtd3JhcHBlcidcclxuICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgY2hlY2tlZDogYm9vbGVhbiwgb3B0aW9uOiBDb2x1bW5GaWx0ZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRwYW5lbCB9ID0gcGFyYW1zXHJcbiAgJHBhbmVsLmNoYW5nZU9wdGlvbih7fSwgY2hlY2tlZCwgb3B0aW9uKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICBjb25zdCBjZWxsVmFsdWU6IHN0cmluZyA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbClcclxuICByZXR1cm4gW1xyXG4gICAgaCgnZWwtYnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50IHx8IHByb3BzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zKSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9LCBvcHRpb25zLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4LFxyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG9uXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgICAgfSwgb3B0aW9uR3JvdXBzXHJcbiAgICAgICAgICA/IGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDAsIG9wdGlvbilcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICAgIGtleTogZ0luZGV4LFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIDogY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIG9uXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0Q2FzY2FkZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbERhdGVQaWNrZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItZWxlbWVudC13cmFwcGVyJ1xyXG4gICAgICAgIH0sIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRUaW1lUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQnV0dG9uOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyXHJcbiAgfSxcclxuICBFbEJ1dHRvbnM6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlclxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpeinpuWPkea6kOaYr+WQpuWxnuS6juebruagh+iKgueCuVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXZlbnRUYXJnZXROb2RlIChldm50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XHJcbiAgbGV0IHRhcmdldEVsZW1cclxuICBsZXQgdGFyZ2V0ID0gZXZudC50YXJnZXRcclxuICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldC5ub2RlVHlwZSAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICBpZiAoY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0KCcgJykuaW5kZXhPZihjbGFzc05hbWUpID4gLTEpIHtcclxuICAgICAgdGFyZ2V0RWxlbSA9IHRhcmdldFxyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09IGNvbnRhaW5lcikge1xyXG4gICAgICByZXR1cm4geyBmbGFnOiBjbGFzc05hbWUgPyAhIXRhcmdldEVsZW0gOiB0cnVlLCBjb250YWluZXIsIHRhcmdldEVsZW06IHRhcmdldEVsZW0gfVxyXG4gICAgfVxyXG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcclxuICB9XHJcbiAgcmV0dXJuIHsgZmxhZzogZmFsc2UgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZTogYW55KSB7XHJcbiAgY29uc3QgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgY29uc3QgZXZudCA9IHBhcmFtcy4kZXZlbnQgfHwgZVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXRpbWUtcGFuZWwnKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnIHx8XHJcbiAgICAvLyDpopzoibJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNvbG9yLWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
