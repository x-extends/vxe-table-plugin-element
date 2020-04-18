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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJ0YXJnZXRFdm50IiwiZ2V0RWRpdE9ucyIsInJvdyIsImNvbHVtbiIsInNldCIsInByb3BlcnR5IiwidXBkYXRlU3RhdHVzIiwiZ2V0RmlsdGVyT25zIiwib3B0aW9uIiwiZ2V0SXRlbU9ucyIsIm1hdGNoQ2FzY2FkZXJEYXRhIiwiaW5kZXgiLCJsaXN0IiwibGFiZWxzIiwidmFsIiwibGVuZ3RoIiwiZWFjaCIsIml0ZW0iLCJwdXNoIiwibGFiZWwiLCJjaGlsZHJlbiIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJjb2xpZCIsImlkIiwicmVzdCIsImNlbGxEYXRhIiwiZmlsdGVyYWJsZSIsImZ1bGxBbGxEYXRhUm93TWFwIiwiY2FjaGVDZWxsIiwiaGFzIiwibXVsdGlwbGUiLCJzZWxlY3RJdGVtIiwiZmluZCIsImNlbGxMYWJlbCIsImdldENhc2NhZGVyQ2VsbFZhbHVlIiwic2hvd0FsbExldmVscyIsInNsaWNlIiwiZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSIsInJhbmdlU2VwYXJhdG9yIiwiZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSIsImlzUmFuZ2UiLCJjcmVhdGVFZGl0UmVuZGVyIiwiaCIsImF0dHJzIiwib24iLCJkZWZhdWx0QnV0dG9uRWRpdFJlbmRlciIsImNlbGxUZXh0IiwiY29udGVudCIsImRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciIsImNoaWxkUmVuZGVyT3B0cyIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvSW5kZXgiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiJHBhbmVsIiwiY2hhbmdlT3B0aW9uIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsInJlbmRlck9wdGlvbnMiLCJkaXNhYmxlZFByb3AiLCJkaXNhYmxlZCIsImNyZWF0ZUZvcm1JdGVtUmVuZGVyIiwiaXRlbVZhbHVlIiwiZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIiLCJkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIiLCJjcmVhdGVFeHBvcnRNZXRob2QiLCJ2YWx1ZU1ldGhvZCIsImlzRWRpdCIsInJlbmRlclByb3BlcnR5IiwiY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyIiwicmVuZGVyTWFwIiwiRWxBdXRvY29tcGxldGUiLCJhdXRvZm9jdXMiLCJyZW5kZXJEZWZhdWx0IiwicmVuZGVyRWRpdCIsInJlbmRlckZpbHRlciIsImZpbHRlck1ldGhvZCIsInJlbmRlckl0ZW0iLCJFbElucHV0IiwiRWxJbnB1dE51bWJlciIsIkVsU2VsZWN0IiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwiZ0luZGV4IiwicmVuZGVyQ2VsbCIsImZpbHRlclJlbmRlciIsImlzQXJyYXkiLCJpbmNsdWRlQXJyYXlzIiwiaW5kZXhPZiIsImNlbGxFeHBvcnRNZXRob2QiLCJlZGl0Q2VsbEV4cG9ydE1ldGhvZCIsIkVsQ2FzY2FkZXIiLCJFbERhdGVQaWNrZXIiLCJFbFRpbWVQaWNrZXIiLCJFbFRpbWVTZWxlY3QiLCJFbFJhdGUiLCJFbFN3aXRjaCIsImlzQm9vbGVhbiIsIkVsU2xpZGVyIiwiRWxSYWRpbyIsIkVsQ2hlY2tib3giLCJFbEJ1dHRvbiIsIkVsQnV0dG9ucyIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImV2bnQiLCJjb250YWluZXIiLCJjbGFzc05hbWUiLCJ0YXJnZXRFbGVtIiwidGFyZ2V0Iiwibm9kZVR5cGUiLCJkb2N1bWVudCIsInNwbGl0IiwiZmxhZyIsInBhcmVudE5vZGUiLCJoYW5kbGVDbGVhckV2ZW50IiwiZSIsImJvZHlFbGVtIiwiYm9keSIsIiRldmVudCIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7QUFvQkE7QUFFQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsWUFBVCxDQUF1QkMsVUFBdkIsRUFBZ0Q7QUFDOUMsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsYUFBVCxDQUF3QkQsVUFBeEIsRUFBaUQ7QUFDL0MsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsY0FBVCxDQUF5QkYsVUFBekIsRUFBa0Q7QUFDaEQsTUFBSUcsSUFBSSxHQUFHLFFBQVg7O0FB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aUIsbUJBQWpCLENBQWxCLENBQXdESixJQVoxRCxFQWFFO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7OztBQUdPLElBQU1PLHFCQUFxQixHQUFHO0FBQ25DQyxFQUFBQSxPQURtQyx5QkFDZ0I7QUFBQSxRQUF4Q0MsV0FBd0MsUUFBeENBLFdBQXdDO0FBQUEsUUFBM0JDLFFBQTJCLFFBQTNCQSxRQUEyQjtBQUNqREEsSUFBQUEsUUFBUSxDQUFDQyxLQUFULENBQWVyRCxTQUFmO0FBQ0FtRCxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDVixnQkFBckM7QUFDQU8sSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1YsZ0JBQXRDO0FBQ0Q7QUFMa0MsQ0FBOUI7OztBQVFQLElBQUksT0FBT1csTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlIscUJBQXBCO0FBQ0Q7O2VBRWNBLHFCIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXHJcbmltcG9ydCB7IENyZWF0ZUVsZW1lbnQgfSBmcm9tICd2dWUnXHJcbmltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCB7XHJcbiAgVlhFVGFibGUsXHJcbiAgUmVuZGVyUGFyYW1zLFxyXG4gIE9wdGlvblByb3BzLFxyXG4gIFJlbmRlck9wdGlvbnMsXHJcbiAgSW50ZXJjZXB0b3JQYXJhbXMsXHJcbiAgVGFibGVSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlclJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMsXHJcbiAgQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcyxcclxuICBGb3JtSXRlbVJlbmRlck9wdGlvbnMsXHJcbiAgRm9ybUl0ZW1SZW5kZXJQYXJhbXNcclxufSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5cclxuZnVuY3Rpb24gaXNFbXB0eVZhbHVlIChjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNb2RlbFByb3AgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ3ZhbHVlJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNb2RlbEV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICdpbnB1dCdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2hhbmdlRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICBsZXQgdHlwZSA9ICdjaGFuZ2UnXHJcbiAgc3dpdGNoIChyZW5kZXJPcHRzLm5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICByZXR1cm4gdHlwZVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZURhdGUgKHZhbHVlOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIHZhbHVlICYmIHByb3BzLnZhbHVlRm9ybWF0ID8gWEVVdGlscy50b1N0cmluZ0RhdGUodmFsdWUsIHByb3BzLnZhbHVlRm9ybWF0KSA6IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnlbXSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlIChjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFZGl0RmlsdGVyUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogVGFibGVSZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiR0YWJsZVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1Qcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcywgdmFsdWU6IGFueSwgZGVmYXVsdFByb3BzPzogeyBbcHJvcDogc3RyaW5nXTogYW55IH0pIHtcclxuICBjb25zdCB7IHZTaXplIH0gPSBwYXJhbXMuJGZvcm1cclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogUmVuZGVyUGFyYW1zLCBpbnB1dEZ1bmM/OiBGdW5jdGlvbiwgY2hhbmdlRnVuYz86IEZ1bmN0aW9uKSB7XHJcbiAgY29uc3QgeyBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBtb2RlbEV2ZW50ID0gZ2V0TW9kZWxFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGNoYW5nZUV2ZW50ID0gZ2V0Q2hhbmdlRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBpc1NhbWVFdmVudCA9IGNoYW5nZUV2ZW50ID09PSBtb2RlbEV2ZW50XHJcbiAgY29uc3Qgb25zOiB7IFt0eXBlOiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge31cclxuICBYRVV0aWxzLm9iamVjdEVhY2goZXZlbnRzLCAoZnVuYzogRnVuY3Rpb24sIGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICBvbnNba2V5XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBmdW5jKHBhcmFtcywgLi4uYXJncylcclxuICAgIH1cclxuICB9KVxyXG4gIGlmIChpbnB1dEZ1bmMpIHtcclxuICAgIG9uc1ttb2RlbEV2ZW50XSA9IGZ1bmN0aW9uICh0YXJnZXRFdm50OiBhbnkpIHtcclxuICAgICAgaW5wdXRGdW5jKHRhcmdldEV2bnQpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW21vZGVsRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW21vZGVsRXZlbnRdKHBhcmFtcywgdGFyZ2V0RXZudClcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgICAgIGNoYW5nZUZ1bmModGFyZ2V0RXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzU2FtZUV2ZW50ICYmIGNoYW5nZUZ1bmMpIHtcclxuICAgIG9uc1tjaGFuZ2VFdmVudF0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2hhbmdlRnVuYyguLi5hcmdzKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1tjaGFuZ2VFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbY2hhbmdlRXZlbnRdKHBhcmFtcywgLi4uYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVkaXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlck9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zLCBjaGFuZ2VGdW5jOiBGdW5jdGlvbikge1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgb3B0aW9uLmRhdGEgPSB2YWx1ZVxyXG4gIH0sIGNoYW5nZUZ1bmMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1PbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRmb3JtLCBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgY29uc3QgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgJHRhYmxlOiBhbnkgPSBwYXJhbXMuJHRhYmxlXHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgY29saWQgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgY29uc3QgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGNvbnN0IGNhY2hlQ2VsbCA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlKSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnlcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbCA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignLCAnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgdmFsdWVzOiBhbnlbXSA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGNvbnN0IGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMgfCBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyB8IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGlzUmFuZ2UsIGZvcm1hdCA9ICdoaDptbTpzcycsIHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGUpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gIH1cclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgIGNsYXNzOiAndnhlLXRhYmxlLS1maWx0ZXItZWxlbWVudC13cmFwcGVyJ1xyXG4gICAgICB9LCBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBjaGVja2VkOiBib29sZWFuLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHBhbmVsIH0gPSBwYXJhbXNcclxuICAkcGFuZWwuY2hhbmdlT3B0aW9uKHt9LCBjaGVja2VkLCBvcHRpb24pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGNvbnN0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IENyZWF0ZUVsZW1lbnQsIG9wdGlvbnM6IGFueVtdLCBvcHRpb25Qcm9wczogT3B0aW9uUHJvcHMpIHtcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW0sIG9JbmRleCkgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ2VsLW9wdGlvbicsIHtcclxuICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dCAoaDogQ3JlYXRlRWxlbWVudCwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQgfHwgcHJvcHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRXhwb3J0TWV0aG9kICh2YWx1ZU1ldGhvZDogRnVuY3Rpb24sIGlzRWRpdD86IGJvb2xlYW4pIHtcclxuICBjb25zdCByZW5kZXJQcm9wZXJ0eSA9IGlzRWRpdCA/ICdlZGl0UmVuZGVyJyA6ICdjZWxsUmVuZGVyJ1xyXG4gIHJldHVybiBmdW5jdGlvbiAocGFyYW1zOiBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgbmFtZSwgb3B0aW9ucyA9IFtdLCBvcHRpb25Qcm9wcyA9IHt9LCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWVsZW1lbnQtd3JhcHBlcidcclxuICAgICAgICB9LCBvcHRpb25Hcm91cHNcclxuICAgICAgICAgID8gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgOiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgY2xhc3M6ICd2eGUtdGFibGUtLWZpbHRlci1lbGVtZW50LXdyYXBwZXInXHJcbiAgICAgICAgfSwgY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgZ2V0VGltZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRUaW1lUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10YWJsZS0tZmlsdGVyLWVsZW1lbnQtd3JhcHBlcidcclxuICAgICAgICB9LCBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBYRVV0aWxzLmlzQm9vbGVhbihvcHRpb24uZGF0YSksIG9wdGlvbilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNsaWRlcjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmFkaW86IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBFbENoZWNrYm94OiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxCdXR0b246IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXJcclxuICB9LFxyXG4gIEVsQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l6Kem5Y+R5rqQ5piv5ZCm5bGe5LqO55uu5qCH6IqC54K5XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFdmVudFRhcmdldE5vZGUgKGV2bnQ6IGFueSwgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcclxuICBsZXQgdGFyZ2V0RWxlbVxyXG4gIGxldCB0YXJnZXQgPSBldm50LnRhcmdldFxyXG4gIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0Lm5vZGVUeXBlICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgIGlmIChjbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0ICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBlOiBhbnkpIHtcclxuICBjb25zdCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBjb25zdCBldm50ID0gcGFyYW1zLiRldmVudCB8fCBlXHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtdGltZS1wYW5lbCcpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWcgfHxcclxuICAgIC8vIOminOiJslxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY29sb3ItZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsICh7IGludGVyY2VwdG9yLCByZW5kZXJlciB9OiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
