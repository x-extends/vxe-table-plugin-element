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
    ons[modelEvent] = function (value) {
      inputFunc(value);

      if (events && events[modelEvent]) {
        events[modelEvent](value);
      }

      if (isSameEvent && changeFunc) {
        changeFunc();
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[changeEvent] = function () {
      changeFunc();

      if (events && events[changeEvent]) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

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
    if (className && target.className && target.className.split(' ').indexOf(className) > -1) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJnZXRFZGl0T25zIiwicm93IiwiY29sdW1uIiwic2V0IiwicHJvcGVydHkiLCJ1cGRhdGVTdGF0dXMiLCJnZXRGaWx0ZXJPbnMiLCJvcHRpb24iLCJnZXRJdGVtT25zIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0U2VsZWN0Q2VsbFZhbHVlIiwib3B0aW9ucyIsIm9wdGlvbkdyb3VwcyIsIm9wdGlvblByb3BzIiwib3B0aW9uR3JvdXBQcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImdyb3VwT3B0aW9ucyIsImdldCIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJvbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiaXNCb29sZWFuIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsIkVsQnV0dG9uIiwiRWxCdXR0b25zIiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiZXZudCIsImNvbnRhaW5lciIsImNsYXNzTmFtZSIsInRhcmdldEVsZW0iLCJ0YXJnZXQiLCJub2RlVHlwZSIsImRvY3VtZW50Iiwic3BsaXQiLCJmbGFnIiwicGFyZW50Tm9kZSIsImhhbmRsZUNsZWFyRXZlbnQiLCJib2R5RWxlbSIsImJvZHkiLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7O0FBb0JBO0FBRUEsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELE1BQUlHLElBQUksR0FBRyxRQUFYOztBQUNBLFVBQVFILFVBQVUsQ0FBQ0ksSUFBbkI7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QUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CUixxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuaW1wb3J0IHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBSZW5kZXJQYXJhbXMsXHJcbiAgT3B0aW9uUHJvcHMsXHJcbiAgUmVuZGVyT3B0aW9ucyxcclxuICBJbnRlcmNlcHRvclBhcmFtcyxcclxuICBUYWJsZVJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5Db25maWcsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkVkaXRSZW5kZXJQYXJhbXMsXHJcbiAgQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zLFxyXG4gIENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcyxcclxuICBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zLFxyXG4gIEZvcm1JdGVtUmVuZGVyT3B0aW9ucyxcclxuICBGb3JtSXRlbVJlbmRlclBhcmFtc1xyXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsUHJvcCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAndmFsdWUnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1vZGVsRXZlbnQgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMpIHtcclxuICByZXR1cm4gJ2lucHV0J1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaGFuZ2VFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIGxldCB0eXBlID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKHJlbmRlck9wdHMubmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIHJldHVybiB0eXBlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnlbXSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRWRpdEZpbHRlclByb3BzIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFRhYmxlUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kdGFibGVcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24odlNpemUgPyB7IHNpemU6IHZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCByZW5kZXJPcHRzLnByb3BzLCB7IFtnZXRNb2RlbFByb3AocmVuZGVyT3B0cyldOiB2YWx1ZSB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiRmb3JtXHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHZTaXplID8geyBzaXplOiB2U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcmVuZGVyT3B0cy5wcm9wcywgeyBbZ2V0TW9kZWxQcm9wKHJlbmRlck9wdHMpXTogdmFsdWUgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IFJlbmRlclBhcmFtcywgaW5wdXRGdW5jPzogRnVuY3Rpb24sIGNoYW5nZUZ1bmM/OiBGdW5jdGlvbikge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgbW9kZWxFdmVudCA9IGdldE1vZGVsRXZlbnQocmVuZGVyT3B0cylcclxuICBjb25zdCBjaGFuZ2VFdmVudCA9IGdldENoYW5nZUV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgaXNTYW1lRXZlbnQgPSBjaGFuZ2VFdmVudCA9PT0gbW9kZWxFdmVudFxyXG4gIGNvbnN0IG9uczogeyBbdHlwZTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgWEVVdGlscy5vYmplY3RFYWNoKGV2ZW50cywgKGZ1bmM6IEZ1bmN0aW9uLCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgb25zW2tleV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgZnVuYyhwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSlcclxuICBpZiAoaW5wdXRGdW5jKSB7XHJcbiAgICBvbnNbbW9kZWxFdmVudF0gPSBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xyXG4gICAgICBpbnB1dEZ1bmModmFsdWUpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW21vZGVsRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW21vZGVsRXZlbnRdKHZhbHVlKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICAgICAgY2hhbmdlRnVuYygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc1NhbWVFdmVudCAmJiBjaGFuZ2VGdW5jKSB7XHJcbiAgICBvbnNbY2hhbmdlRXZlbnRdID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNoYW5nZUZ1bmMoKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1tjaGFuZ2VFdmVudF0pIHtcclxuICAgICAgICBldmVudHNbY2hhbmdlRXZlbnRdKHBhcmFtcywgLi4uYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb25zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVkaXRPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlck9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMsIG9wdGlvbjogYW55LCBjaGFuZ2VGdW5jOiBGdW5jdGlvbikge1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgb3B0aW9uLmRhdGEgPSB2YWx1ZVxyXG4gIH0sIGNoYW5nZUZ1bmMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1PbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRmb3JtLCBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgY29uc3QgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiB7ICR0YWJsZTogYW55LCByb3c6IGFueSwgY29sdW1uOiBDb2x1bW5Db25maWcgfSkge1xyXG4gIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgY29saWQgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgY29uc3QgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGNvbnN0IGNhY2hlQ2VsbCA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlKSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnlcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW0pID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGNvbnN0IGNlbGxMYWJlbCA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignLCAnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgY29uc3QgdmFsdWVzOiBhbnlbXSA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIGNvbnN0IGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMgfCBDb2x1bW5FeHBvcnRDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcyB8IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGlzUmFuZ2UsIGZvcm1hdCA9ICdoaDptbTpzcycsIHJhbmdlU2VwYXJhdG9yID0gJy0nIH0gPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGUpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gIH1cclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgY2VsbFZhbHVlLCBkZWZhdWx0UHJvcHMpLFxyXG4gICAgICAgIG9uOiBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCkpXHJcbiAgXVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChwYXJhbXM6IENvbHVtbkZpbHRlclJlbmRlclBhcmFtcywgY2hlY2tlZDogYm9vbGVhbiwgb3B0aW9uOiBhbnkpIHtcclxuICBjb25zdCB7ICRwYW5lbCB9ID0gcGFyYW1zXHJcbiAgJHBhbmVsLmNoYW5nZU9wdGlvbih7fSwgY2hlY2tlZCwgb3B0aW9uKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kIChwYXJhbXM6IENvbHVtbkZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICBjb25zdCBjZWxsVmFsdWU6IHN0cmluZyA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBDcmVhdGVFbGVtZW50LCBvcHRpb25zOiBhbnlbXSwgb3B0aW9uUHJvcHM6IE9wdGlvblByb3BzKSB7XHJcbiAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBjb25zdCBkaXNhYmxlZFByb3AgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtLCBvSW5kZXgpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IENyZWF0ZUVsZW1lbnQsIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbClcclxuICByZXR1cm4gW1xyXG4gICAgaCgnZWwtYnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50IHx8IHByb3BzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGb3JtSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogRm9ybUl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogQ29sdW1uRXhwb3J0Q2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRm9ybUl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZvcm1JdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgPSBbXSwgb3B0aW9uUHJvcHMgPSB7fSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgbGFiZWxQcm9wID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgY29uc3QgZGlzYWJsZWRQcm9wID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSksXHJcbiAgICAgICAgb246IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9LCBvcHRpb25zLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGNlbGxWYWx1ZSlcclxuICAgICAgY29uc3Qgb24gPSBnZXRFZGl0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBvblxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4LFxyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG9uXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRTZWxlY3RDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENvbHVtbkZpbHRlclJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRmlsdGVyUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBjb25zdCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXgsXHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBvcHRpb24uZGF0YSAmJiBvcHRpb24uZGF0YS5sZW5ndGggPiAwLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH0gPSBjb2x1bW5cclxuICAgICAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgcHJvcGVydHkpXHJcbiAgICAgIGlmIChwcm9wcy5tdWx0aXBsZSkge1xyXG4gICAgICAgIGlmIChYRVV0aWxzLmlzQXJyYXkoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFhFVXRpbHMuaW5jbHVkZUFycmF5cyhjZWxsVmFsdWUsIGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhLmluZGV4T2YoY2VsbFZhbHVlKSA+IC0xXHJcbiAgICAgIH1cclxuICAgICAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgICAgIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW0gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEZvcm1JdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBGb3JtSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgaXRlbVZhbHVlID0gWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpXHJcbiAgICAgIGNvbnN0IHByb3BzID0gZ2V0SXRlbVByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgaXRlbVZhbHVlKVxyXG4gICAgICBjb25zdCBvbiA9IGdldEl0ZW1PbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGNvbnN0IGdyb3VwTGFiZWwgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIG9uXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cCwgZ0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgb25cclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbENhc2NhZGVyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgISFvcHRpb24uZGF0YSwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAocGFyYW1zOiBDb2x1bW5GaWx0ZXJNZXRob2RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBkYXRhIH0gPSBvcHRpb25cclxuICAgICAgY29uc3QgeyBmaWx0ZXJSZW5kZXI6IHJlbmRlck9wdHMgfSA9IGNvbHVtblxyXG4gICAgICBjb25zdCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ29sdW1uRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRUaW1lUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ29sdW1uRmlsdGVyUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5GaWx0ZXJSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IG5hbWUsIGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIGtleTogb0luZGV4LFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBwcm9wczogZ2V0Q2VsbEVkaXRGaWx0ZXJQcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvblZhbHVlKSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJPbnMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb24sICgpID0+IHtcclxuICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIFhFVXRpbHMuaXNCb29sZWFuKG9wdGlvbi5kYXRhKSwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2xpZGVyOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYWRpbzoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQ2hlY2tib3g6IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBFbEJ1dHRvbjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlclxyXG4gIH0sXHJcbiAgRWxCdXR0b25zOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIsXHJcbiAgICByZW5kZXJJdGVtOiBkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXJcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6Xop6blj5HmupDmmK/lkKblsZ7kuo7nm67moIfoioLngrlcclxuICovXHJcbmZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0Tm9kZSAoZXZudDogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xyXG4gIGxldCB0YXJnZXRFbGVtXHJcbiAgbGV0IHRhcmdldCA9IGV2bnQudGFyZ2V0XHJcbiAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQubm9kZVR5cGUgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgaWYgKGNsYXNzTmFtZSAmJiB0YXJnZXQuY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUuc3BsaXQoJyAnKS5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xyXG4gICAgICB0YXJnZXRFbGVtID0gdGFyZ2V0XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gY29udGFpbmVyKSB7XHJcbiAgICAgIHJldHVybiB7IGZsYWc6IGNsYXNzTmFtZSA/ICEhdGFyZ2V0RWxlbSA6IHRydWUsIGNvbnRhaW5lciwgdGFyZ2V0RWxlbTogdGFyZ2V0RWxlbSB9XHJcbiAgICB9XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxyXG4gIH1cclxuICByZXR1cm4geyBmbGFnOiBmYWxzZSB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogSW50ZXJjZXB0b3JQYXJhbXMsIGV2bnQ6IGFueSkge1xyXG4gIGNvbnN0IGJvZHlFbGVtID0gZG9jdW1lbnQuYm9keVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXRpbWUtcGFuZWwnKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnIHx8XHJcbiAgICAvLyDpopzoibJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNvbG9yLWRyb3Bkb3duJykuZmxhZ1xyXG4gICkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTpgILphY3mj5Lku7bvvIznlKjkuo7lhbzlrrkgZWxlbWVudC11aSDnu4Tku7blupNcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnQgPSB7XHJcbiAgaW5zdGFsbCAoeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICByZW5kZXJlci5taXhpbihyZW5kZXJNYXApXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyRmlsdGVyJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJBY3RpdmVkJywgaGFuZGxlQ2xlYXJFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRWxlbWVudClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FbGVtZW50XHJcbiJdfQ==
