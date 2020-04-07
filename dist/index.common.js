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
    return column.filters.map(function (option, oIndex) {
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
    });
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
      var column = params.column;
      var attrs = renderOpts.attrs;

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return column.filters.map(function (option, oIndex) {
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
        });
      }

      return column.filters.map(function (option, oIndex) {
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
      });
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
      return column.filters.map(function (option, oIndex) {
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
      });
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
      return column.filters.map(function (option, oIndex) {
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
      });
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


function handleClearEvent(params, evnt) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJhcmdzMSIsImdldEVkaXRPbnMiLCJyb3ciLCJjb2x1bW4iLCJzZXQiLCJwcm9wZXJ0eSIsInVwZGF0ZVN0YXR1cyIsImdldEZpbHRlck9ucyIsIm9wdGlvbiIsImdldEl0ZW1PbnMiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRTZWxlY3RDZWxsVmFsdWUiLCJvcHRpb25zIiwib3B0aW9uR3JvdXBzIiwib3B0aW9uUHJvcHMiLCJvcHRpb25Hcm91cFByb3BzIiwibGFiZWxQcm9wIiwidmFsdWVQcm9wIiwiZ3JvdXBPcHRpb25zIiwiZ2V0IiwiY29saWQiLCJpZCIsInJlc3QiLCJjZWxsRGF0YSIsImZpbHRlcmFibGUiLCJmdWxsQWxsRGF0YVJvd01hcCIsImNhY2hlQ2VsbCIsImhhcyIsIm11bHRpcGxlIiwic2VsZWN0SXRlbSIsImZpbmQiLCJjZWxsTGFiZWwiLCJnZXRDYXNjYWRlckNlbGxWYWx1ZSIsInNob3dBbGxMZXZlbHMiLCJzbGljZSIsImdldERhdGVQaWNrZXJDZWxsVmFsdWUiLCJyYW5nZVNlcGFyYXRvciIsImdldFRpbWVQaWNrZXJDZWxsVmFsdWUiLCJpc1JhbmdlIiwiY3JlYXRlRWRpdFJlbmRlciIsImgiLCJhdHRycyIsIm9uIiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib0luZGV4Iiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNoYW5nZU9wdGlvbiIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsIml0ZW1WYWx1ZSIsImRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIiwiZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIiwiY3JlYXRlRXhwb3J0TWV0aG9kIiwidmFsdWVNZXRob2QiLCJpc0VkaXQiLCJyZW5kZXJQcm9wZXJ0eSIsImNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciIsInJlbmRlck1hcCIsIkVsQXV0b2NvbXBsZXRlIiwiYXV0b2ZvY3VzIiwicmVuZGVyRGVmYXVsdCIsInJlbmRlckVkaXQiLCJyZW5kZXJGaWx0ZXIiLCJmaWx0ZXJNZXRob2QiLCJyZW5kZXJJdGVtIiwiRWxJbnB1dCIsIkVsSW5wdXROdW1iZXIiLCJFbFNlbGVjdCIsImdyb3VwTGFiZWwiLCJncm91cCIsImdJbmRleCIsInJlbmRlckNlbGwiLCJmaWx0ZXJSZW5kZXIiLCJpc0FycmF5IiwiaW5jbHVkZUFycmF5cyIsImluZGV4T2YiLCJjZWxsRXhwb3J0TWV0aG9kIiwiZWRpdENlbGxFeHBvcnRNZXRob2QiLCJFbENhc2NhZGVyIiwiRWxEYXRlUGlja2VyIiwiRWxUaW1lUGlja2VyIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJpc0Jvb2xlYW4iLCJFbFNsaWRlciIsIkVsUmFkaW8iLCJFbENoZWNrYm94IiwiRWxCdXR0b24iLCJFbEJ1dHRvbnMiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJldm50IiwiY29udGFpbmVyIiwiY2xhc3NOYW1lIiwidGFyZ2V0RWxlbSIsInRhcmdldCIsIm5vZGVUeXBlIiwiZG9jdW1lbnQiLCJzcGxpdCIsImZsYWciLCJwYXJlbnROb2RlIiwiaGFuZGxlQ2xlYXJFdmVudCIsImJvZHlFbGVtIiwiYm9keSIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7QUFvQkE7QUFFQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsWUFBVCxDQUF1QkMsVUFBdkIsRUFBZ0Q7QUFDOUMsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsYUFBVCxDQUF3QkQsVUFBeEIsRUFBaUQ7QUFDL0MsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsY0FBVCxDQUF5QkYsVUFBekIsRUFBa0Q7QUFDaEQsTUFBSUcsSUFBSSxHQUFHLFFBQVg7O0FBQ0EsVUFBUUgsVUFBVSxDQUFD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aEIsRUFBc0NSLGdCQUF0QztBQUNEO0FBTGtDLENBQTlCOzs7QUFRUCxJQUFJLE9BQU9TLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JSLHFCQUFwQjtBQUNEOztlQUVjQSxxQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5pbXBvcnQgeyBDcmVhdGVFbGVtZW50IH0gZnJvbSAndnVlJ1xyXG5pbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQge1xyXG4gIFZYRVRhYmxlLFxyXG4gIFJlbmRlclBhcmFtcyxcclxuICBPcHRpb25Qcm9wcyxcclxuICBSZW5kZXJPcHRpb25zLFxyXG4gIEludGVyY2VwdG9yUGFyYW1zLFxyXG4gIFRhYmxlUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLFxyXG4gIENvbHVtbkNlbGxSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zLFxyXG4gIENvbHVtbkV4cG9ydENlbGxSZW5kZXJQYXJhbXMsXHJcbiAgRm9ybUl0ZW1SZW5kZXJPcHRpb25zLFxyXG4gIEZvcm1JdGVtUmVuZGVyUGFyYW1zXHJcbn0gZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxQcm9wIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICd2YWx1ZSdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnaW5wdXQnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENoYW5nZUV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAocmVuZGVyT3B0cy5uYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIHR5cGVcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlICh2YWx1ZTogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZSh2YWx1ZSwgcHJvcHMpLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55W10sIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0sIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRWRpdEZpbHRlclByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFRhYmxlUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kdGFibGVcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiRmb3JtXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcywgaW5wdXRGdW5jPzogRnVuY3Rpb24sIGNoYW5nZUZ1bmM/OiBGdW5jdGlvbikge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbW9kZWxFdmVudCA9IGdldE1vZGVsRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBjaGFuZ2VFdmVudCA9IGdldENoYW5nZUV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgaXNTYW1lRXZlbnQgPSBjaGFuZ2VFdmVudCA9PT0gbW9kZWxFdmVudFxyXG4gIGNvbnN0IG9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKGV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgb25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICBpZiAoaW5wdXRGdW5jKSB7XHJcbiAgICBvbnNbbW9kZWxFdmVudF0gPSBmdW5jdGlvbiAoYXJnczE6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmMoYXJnczEpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW21vZGVsRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW21vZGVsRXZlbnRdKGFyZ3MxKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYyhhcmdzMSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzU2FtZUV2ZW50ICYmIGNoYW5nZUZ1bmMpIHtcclxuICAgIG9uc1tjaGFuZ2VFdmVudF0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2hhbmdlRnVuYyguLi5hcmdzKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1tjaGFuZ2VFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbY2hhbmdlRXZlbnRdKHBhcmFtcywgLi4uYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVkaXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlck9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIG9wdGlvbjogQ29sdW1uRmlsdGVyUGFyYW1zLCBjaGFuZ2VGdW5jOiBGdW5jdGlvbikge1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgb3B0aW9uLmRhdGEgPSB2YWx1ZVxyXG4gIH0sIGNoYW5nZUZ1bmMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1PbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRmb3JtLCBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgY29uc3QgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgJHRhYmxlOiBhbnkgPSBwYXJhbXMuJHRhYmxlXHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgY29saWQgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgY29uc3QgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGNvbnN0IGNhY2hlQ2VsbCA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlKSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnlcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbCA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignLCAnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgdmFsdWVzOiBhbnlbXSA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGNvbnN0IGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMgfCBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyB8IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGlzUmFuZ2UsIGZvcm1hdCA9ICdoaDptbTpzcycsIHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGUpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gIH1cclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLCBjaGVja2VkOiBib29sZWFuLCBvcHRpb246IENvbHVtbkZpbHRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHBhbmVsIH0gPSBwYXJhbXNcclxuICAkcGFuZWwuY2hhbmdlT3B0aW9uKHt9LCBjaGVja2VkLCBvcHRpb24pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHBhcmFtczogQ29sdW1uRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGNvbnN0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IENyZWF0ZUVsZW1lbnQsIG9wdGlvbnM6IGFueVtdLCBvcHRpb25Qcm9wczogT3B0aW9uUHJvcHMpIHtcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW0sIG9JbmRleCkgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ2VsLW9wdGlvbicsIHtcclxuICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dCAoaDogQ3JlYXRlRWxlbWVudCwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBudWxsKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQgfHwgcHJvcHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMpID0+IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRXhwb3J0TWV0aG9kICh2YWx1ZU1ldGhvZDogRnVuY3Rpb24sIGlzRWRpdD86IGJvb2xlYW4pIHtcclxuICBjb25zdCByZW5kZXJQcm9wZXJ0eSA9IGlzRWRpdCA/ICdlZGl0UmVuZGVyJyA6ICdjZWxsUmVuZGVyJ1xyXG4gIHJldHVybiBmdW5jdGlvbiAocGFyYW1zOiBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgbmFtZSwgb3B0aW9ucyA9IFtdLCBvcHRpb25Qcm9wcyA9IHt9LCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgoYCR7bmFtZX1Hcm91cGAsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wczogZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDAsIG9wdGlvbilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIG9wdGlvbi5kYXRhICYmIG9wdGlvbi5kYXRhLmxlbmd0aCA+IDAsIG9wdGlvbilcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IHByb3BlcnR5LCBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgZ2V0VGltZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRUaW1lUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5GaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQnV0dG9uOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyXHJcbiAgfSxcclxuICBFbEJ1dHRvbnM6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlclxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpeinpuWPkea6kOaYr+WQpuWxnuS6juebruagh+iKgueCuVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXZlbnRUYXJnZXROb2RlIChldm50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XHJcbiAgbGV0IHRhcmdldEVsZW1cclxuICBsZXQgdGFyZ2V0ID0gZXZudC50YXJnZXRcclxuICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldC5ub2RlVHlwZSAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICBpZiAoY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCAmJiB0YXJnZXQuY2xhc3NOYW1lLnNwbGl0KCcgJykuaW5kZXhPZihjbGFzc05hbWUpID4gLTEpIHtcclxuICAgICAgdGFyZ2V0RWxlbSA9IHRhcmdldFxyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09IGNvbnRhaW5lcikge1xyXG4gICAgICByZXR1cm4geyBmbGFnOiBjbGFzc05hbWUgPyAhIXRhcmdldEVsZW0gOiB0cnVlLCBjb250YWluZXIsIHRhcmdldEVsZW06IHRhcmdldEVsZW0gfVxyXG4gICAgfVxyXG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcclxuICB9XHJcbiAgcmV0dXJuIHsgZmxhZzogZmFsc2UgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IEludGVyY2VwdG9yUGFyYW1zLCBldm50OiBhbnkpIHtcclxuICBjb25zdCBib2R5RWxlbSA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC10aW1lLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgLy8g6aKc6ImyXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jb2xvci1kcm9wZG93bicpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGVsZW1lbnQtdWkg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FbGVtZW50ID0ge1xyXG4gIGluc3RhbGwgKHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH06IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
