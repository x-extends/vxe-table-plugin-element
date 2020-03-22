"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginElement = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsImdldE1vZGVsUHJvcCIsInJlbmRlck9wdHMiLCJnZXRNb2RlbEV2ZW50IiwiZ2V0Q2hhbmdlRXZlbnQiLCJ0eXBlIiwibmFtZSIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJnZXRDZWxsRWRpdEZpbHRlclByb3BzIiwicGFyYW1zIiwiZGVmYXVsdFByb3BzIiwidlNpemUiLCIkdGFibGUiLCJhc3NpZ24iLCJzaXplIiwiZ2V0SXRlbVByb3BzIiwiJGZvcm0iLCJnZXRPbnMiLCJpbnB1dEZ1bmMiLCJjaGFuZ2VGdW5jIiwiZXZlbnRzIiwibW9kZWxFdmVudCIsImNoYW5nZUV2ZW50IiwiaXNTYW1lRXZlbnQiLCJvbnMiLCJvYmplY3RFYWNoIiwiZnVuYyIsImtleSIsImFyZ3MiLCJnZXRFZGl0T25zIiwicm93IiwiY29sdW1uIiwic2V0IiwicHJvcGVydHkiLCJ1cGRhdGVTdGF0dXMiLCJnZXRGaWx0ZXJPbnMiLCJvcHRpb24iLCJnZXRJdGVtT25zIiwibWF0Y2hDYXNjYWRlckRhdGEiLCJpbmRleCIsImxpc3QiLCJsYWJlbHMiLCJ2YWwiLCJsZW5ndGgiLCJlYWNoIiwiaXRlbSIsInB1c2giLCJsYWJlbCIsImNoaWxkcmVuIiwiZ2V0U2VsZWN0Q2VsbFZhbHVlIiwib3B0aW9ucyIsIm9wdGlvbkdyb3VwcyIsIm9wdGlvblByb3BzIiwib3B0aW9uR3JvdXBQcm9wcyIsImxhYmVsUHJvcCIsInZhbHVlUHJvcCIsImdyb3VwT3B0aW9ucyIsImdldCIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJvbiIsImRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIiwiY2VsbFRleHQiLCJjb250ZW50IiwiZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIiwiY2hpbGRSZW5kZXJPcHRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiZmlsdGVycyIsIm9JbmRleCIsIm9wdGlvblZhbHVlIiwiaGFuZGxlQ29uZmlybUZpbHRlciIsImNoZWNrZWQiLCIkcGFuZWwiLCJjaGFuZ2VPcHRpb24iLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwiY3JlYXRlRm9ybUl0ZW1SZW5kZXIiLCJpdGVtVmFsdWUiLCJkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciIsImRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiaXNCb29sZWFuIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsIkVsQnV0dG9uIiwiRWxCdXR0b25zIiwiZ2V0RXZlbnRUYXJnZXROb2RlIiwiZXZudCIsImNvbnRhaW5lciIsImNsYXNzTmFtZSIsInRhcmdldEVsZW0iLCJ0YXJnZXQiLCJub2RlVHlwZSIsImRvY3VtZW50Iiwic3BsaXQiLCJmbGFnIiwicGFyZW50Tm9kZSIsImhhbmRsZUNsZWFyRXZlbnQiLCJib2R5RWxlbSIsImJvZHkiLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7O0FBR0EsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBdUJDLFVBQXZCLEVBQWdEO0FBQzlDLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBd0JELFVBQXhCLEVBQWlEO0FBQy9DLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVNFLGNBQVQsQ0FBeUJGLFVBQXpCLEVBQWtEO0FBQ2hELE1BQUlHLElBQUksR0FBRyxRQUFYOztBQUNBLFVBQVFILFVBQVUsQ0FBQ0ksSUFBbkI7QUFDRSxT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QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlIscUJBQXBCO0FBQ0Q7O2VBRWNBLHFCIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENyZWF0ZUVsZW1lbnQgfSBmcm9tICd2dWUnIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IHsgVlhFVGFibGUsIFJlbmRlclBhcmFtcywgT3B0aW9uUHJvcHMsIFRhYmxlUmVuZGVyUGFyYW1zLCBSZW5kZXJPcHRpb25zLCBGaWx0ZXJSZW5kZXJPcHRpb25zLCBDZWxsUmVuZGVyT3B0aW9ucywgRWRpdFJlbmRlck9wdGlvbnMsIEl0ZW1SZW5kZXJPcHRpb25zLCBDZWxsUmVuZGVyUGFyYW1zLCBFZGl0UmVuZGVyUGFyYW1zLCBGaWx0ZXJSZW5kZXJQYXJhbXMsIEZpbHRlck1ldGhvZFBhcmFtcywgSXRlbVJlbmRlclBhcmFtcywgRGF0YUV4cG9ydExhYmVsUGFyYW1zIH0gZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxQcm9wIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgcmV0dXJuICd2YWx1ZSdcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kZWxFdmVudCAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucykge1xyXG4gIHJldHVybiAnaW5wdXQnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENoYW5nZUV2ZW50IChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zKSB7XHJcbiAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAocmVuZGVyT3B0cy5uYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgcmV0dXJuIHR5cGVcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55KSB7XHJcbiAgcmV0dXJuIHZhbHVlICYmIHByb3BzLnZhbHVlRm9ybWF0ID8gWEVVdGlscy50b1N0cmluZ0RhdGUodmFsdWUsIHByb3BzLnZhbHVlRm9ybWF0KSA6IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZykge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueVtdLCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKSB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFZGl0RmlsdGVyUHJvcHMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogVGFibGVSZW5kZXJQYXJhbXMsIHZhbHVlOiBhbnksIGRlZmF1bHRQcm9wcz86IHsgW3Byb3A6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgY29uc3QgeyB2U2l6ZSB9ID0gcGFyYW1zLiR0YWJsZVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEl0ZW1Qcm9wcyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBJdGVtUmVuZGVyUGFyYW1zLCB2YWx1ZTogYW55LCBkZWZhdWx0UHJvcHM/OiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIGNvbnN0IHsgdlNpemUgfSA9IHBhcmFtcy4kZm9ybVxyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbih2U2l6ZSA/IHsgc2l6ZTogdlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHJlbmRlck9wdHMucHJvcHMsIHsgW2dldE1vZGVsUHJvcChyZW5kZXJPcHRzKV06IHZhbHVlIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9ucyAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBSZW5kZXJQYXJhbXMsIGlucHV0RnVuYz86IEZ1bmN0aW9uLCBjaGFuZ2VGdW5jPzogRnVuY3Rpb24pIHtcclxuICBjb25zdCB7IGV2ZW50cyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IG1vZGVsRXZlbnQgPSBnZXRNb2RlbEV2ZW50KHJlbmRlck9wdHMpXHJcbiAgY29uc3QgY2hhbmdlRXZlbnQgPSBnZXRDaGFuZ2VFdmVudChyZW5kZXJPcHRzKVxyXG4gIGNvbnN0IGlzU2FtZUV2ZW50ID0gY2hhbmdlRXZlbnQgPT09IG1vZGVsRXZlbnRcclxuICBjb25zdCBvbnM6IHsgW3R5cGU6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxyXG4gIFhFVXRpbHMub2JqZWN0RWFjaChldmVudHMsIChmdW5jOiBGdW5jdGlvbiwga2V5OiBzdHJpbmcpID0+IHtcclxuICAgIG9uc1trZXldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGZ1bmMocGFyYW1zLCAuLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgaWYgKGlucHV0RnVuYykge1xyXG4gICAgb25zW21vZGVsRXZlbnRdID0gZnVuY3Rpb24gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgaW5wdXRGdW5jKHZhbHVlKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1ttb2RlbEV2ZW50XSkge1xyXG4gICAgICAgIGV2ZW50c1ttb2RlbEV2ZW50XSh2YWx1ZSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgICAgIGNoYW5nZUZ1bmMoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNTYW1lRXZlbnQgJiYgY2hhbmdlRnVuYykge1xyXG4gICAgb25zW2NoYW5nZUV2ZW50XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjaGFuZ2VGdW5jKClcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbY2hhbmdlRXZlbnRdKSB7XHJcbiAgICAgICAgZXZlbnRzW2NoYW5nZUV2ZW50XShwYXJhbXMsIC4uLmFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG9uc1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZGl0T25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIHJldHVybiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zLCAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgLy8g5aSE55CGIG1vZGVsIOWAvOWPjOWQkee7keWumlxyXG4gICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gIH0sICgpID0+IHtcclxuICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJPbnMgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogRmlsdGVyUmVuZGVyUGFyYW1zLCBvcHRpb246IGFueSwgY2hhbmdlRnVuYzogRnVuY3Rpb24pIHtcclxuICByZXR1cm4gZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcywgKHZhbHVlOiBhbnkpID0+IHtcclxuICAgIC8vIOWkhOeQhiBtb2RlbCDlgLzlj4zlkJHnu5HlrppcclxuICAgIG9wdGlvbi5kYXRhID0gdmFsdWVcclxuICB9LCBjaGFuZ2VGdW5jKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJdGVtT25zIChyZW5kZXJPcHRzOiBSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7ICRmb3JtLCBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgcmV0dXJuIGdldE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAvLyDlpITnkIYgbW9kZWwg5YC85Y+M5ZCR57uR5a6aXHJcbiAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICRmb3JtLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgY29uc3QgdmFsID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBDZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBhbnkpIHtcclxuICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBjb25zdCB2YWx1ZVByb3AgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgY29uc3QgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IGNvbGlkID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGNvbnN0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBjb25zdCBjYWNoZUNlbGwgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbTogYW55XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZSkgPT4ge1xyXG4gICAgICBjb25zdCBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtKSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBjb25zdCBjZWxsTGFiZWwgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGNvbnN0IHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICBjb25zdCBsYWJlbHM6IGFueVtdID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gKHByb3BzLnNob3dBbGxMZXZlbHMgPT09IGZhbHNlID8gbGFiZWxzLnNsaWNlKGxhYmVscy5sZW5ndGggLSAxLCBsYWJlbHMubGVuZ3RoKSA6IGxhYmVscykuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDZWxsUmVuZGVyUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGlmIChjZWxsVmFsdWUgJiYgaXNSYW5nZSkge1xyXG4gICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgfVxyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogRWRpdFJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUsIGRlZmF1bHRQcm9wcyksXHJcbiAgICAgICAgb246IGdldEVkaXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgbnVsbCksXHJcbiAgICAgIG9uOiBnZXRPbnMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogRWRpdFJlbmRlck9wdGlvbnMsIHBhcmFtczogRWRpdFJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBhbnkpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgY29uc3QgeyBuYW1lLCBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uVmFsdWUgPSBvcHRpb24uZGF0YVxyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsICEhb3B0aW9uLmRhdGEsIG9wdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1GaWx0ZXIgKHBhcmFtczogRmlsdGVyUmVuZGVyUGFyYW1zLCBjaGVja2VkOiBib29sZWFuLCBvcHRpb246IGFueSkge1xyXG4gIGNvbnN0IHsgJHBhbmVsIH0gPSBwYXJhbXNcclxuICAkcGFuZWwuY2hhbmdlT3B0aW9uKHt9LCBjaGVja2VkLCBvcHRpb24pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHBhcmFtczogRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgY29uc3QgeyBvcHRpb24sIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gIGNvbnN0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IENyZWF0ZUVsZW1lbnQsIG9wdGlvbnM6IGFueVtdLCBvcHRpb25Qcm9wczogT3B0aW9uUHJvcHMpIHtcclxuICBjb25zdCBsYWJlbFByb3AgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgY29uc3QgdmFsdWVQcm9wID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGNvbnN0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW0sIG9JbmRleCkgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ2VsLW9wdGlvbicsIHtcclxuICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dCAoaDogQ3JlYXRlRWxlbWVudCwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogSXRlbVJlbmRlclBhcmFtcykge1xyXG4gICAgY29uc3QgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBjb25zdCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHM6IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIGl0ZW1WYWx1ZSwgZGVmYXVsdFByb3BzKSxcclxuICAgICAgICBvbjogZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wcyA9IGdldEl0ZW1Qcm9wcyhyZW5kZXJPcHRzLCBwYXJhbXMsIG51bGwpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0T25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCB8fCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogSXRlbVJlbmRlck9wdGlvbnMsIHBhcmFtczogSXRlbVJlbmRlclBhcmFtcykge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBhbnkpID0+IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRXhwb3J0TWV0aG9kICh2YWx1ZU1ldGhvZDogRnVuY3Rpb24sIGlzRWRpdD86IGJvb2xlYW4pIHtcclxuICBjb25zdCByZW5kZXJQcm9wZXJ0eSA9IGlzRWRpdCA/ICdlZGl0UmVuZGVyJyA6ICdjZWxsUmVuZGVyJ1xyXG4gIHJldHVybiBmdW5jdGlvbiAocGFyYW1zOiBEYXRhRXhwb3J0TGFiZWxQYXJhbXMpIHtcclxuICAgIHJldHVybiB2YWx1ZU1ldGhvZChwYXJhbXMuY29sdW1uW3JlbmRlclByb3BlcnR5XSwgcGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyICgpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEl0ZW1SZW5kZXJPcHRpb25zLCBwYXJhbXM6IEl0ZW1SZW5kZXJQYXJhbXMpIHtcclxuICAgIGNvbnN0IHsgbmFtZSwgb3B0aW9ucyA9IFtdLCBvcHRpb25Qcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGNvbnN0IGxhYmVsUHJvcCA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgIGNvbnN0IHZhbHVlUHJvcCA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICAgIGNvbnN0IGRpc2FibGVkUHJvcCA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChgJHtuYW1lfUdyb3VwYCwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzOiBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUpLFxyXG4gICAgICAgIG9uOiBnZXRJdGVtT25zKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25bZGlzYWJsZWRQcm9wXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIG9wdGlvbltsYWJlbFByb3BdKVxyXG4gICAgICB9KSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBFbEF1dG9jb21wbGV0ZToge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0OiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXROdW1iZXI6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IEVkaXRSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyBvcHRpb25zID0gW10sIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGNvbnN0IGNlbGxWYWx1ZSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBjb25zdCBwcm9wcyA9IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBjZWxsVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0RWRpdE9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleCxcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogQ3JlYXRlRWxlbWVudCwgcmVuZGVyT3B0czogQ2VsbFJlbmRlck9wdGlvbnMsIHBhcmFtczogQ2VsbFJlbmRlclBhcmFtcykge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbnMgPSBbXSwgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgY29uc3QgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKG9wdGlvbiwgb0luZGV4KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5aSE55CGIGNoYW5nZSDkuovku7bnm7jlhbPpgLvovpFcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXAsIGdJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4LFxyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChvcHRpb24sIG9JbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblZhbHVlID0gb3B0aW9uLmRhdGFcclxuICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgb3B0aW9uLmRhdGEgJiYgb3B0aW9uLmRhdGEubGVuZ3RoID4gMCwgb3B0aW9uKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHBhcmFtczogRmlsdGVyTWV0aG9kUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9uLCByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9uXHJcbiAgICAgIGNvbnN0IHsgcHJvcGVydHksIGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KVxyXG4gICAgICBpZiAocHJvcHMubXVsdGlwbGUpIHtcclxuICAgICAgICBpZiAoWEVVdGlscy5pc0FycmF5KGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBYRVV0aWxzLmluY2x1ZGVBcnJheXMoY2VsbFZhbHVlLCBkYXRhKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGNlbGxWYWx1ZSkgPiAtMVxyXG4gICAgICB9XHJcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gICAgICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBJdGVtUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBJdGVtUmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyA9IFtdLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgICAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBpdGVtVmFsdWUgPSBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSlcclxuICAgICAgY29uc3QgcHJvcHMgPSBnZXRJdGVtUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBpdGVtVmFsdWUpXHJcbiAgICAgIGNvbnN0IG9uID0gZ2V0SXRlbU9ucyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgY29uc3QgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgb25cclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwLCBnSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBvblxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIHJlbmRlck9wdHM6IENlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEVkaXRSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBFZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXREYXRlUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgICBrZXk6IG9JbmRleCxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgcHJvcHM6IGdldENlbGxFZGl0RmlsdGVyUHJvcHMocmVuZGVyT3B0cywgcGFyYW1zLCBvcHRpb25WYWx1ZSksXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyT25zKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWkhOeQhiBjaGFuZ2Ug5LqL5Lu255u45YWz6YC76L6RXHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCAhIW9wdGlvbi5kYXRhLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kIChwYXJhbXM6IEZpbHRlck1ldGhvZFBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IG9wdGlvbiwgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG9wdGlvblxyXG4gICAgICBjb25zdCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9ID0gY29sdW1uXHJcbiAgICAgIGNvbnN0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBjb25zdCBjZWxsVmFsdWUgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgICAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldERhdGVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBDZWxsUmVuZGVyT3B0aW9ucywgcGFyYW1zOiBFZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBnZXRUaW1lUGlja2VyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRUaW1lUGlja2VyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxUaW1lU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhdGU6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFN3aXRjaDoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBDcmVhdGVFbGVtZW50LCByZW5kZXJPcHRzOiBGaWx0ZXJSZW5kZXJPcHRpb25zLCBwYXJhbXM6IEZpbHRlclJlbmRlclBhcmFtcykge1xyXG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGNvbnN0IHsgbmFtZSwgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgob3B0aW9uLCBvSW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IG9wdGlvbi5kYXRhXHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAga2V5OiBvSW5kZXgsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIHByb3BzOiBnZXRDZWxsRWRpdEZpbHRlclByb3BzKHJlbmRlck9wdHMsIHBhcmFtcywgb3B0aW9uVmFsdWUpLFxyXG4gICAgICAgICAgb246IGdldEZpbHRlck9ucyhyZW5kZXJPcHRzLCBwYXJhbXMsIG9wdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDlpITnkIYgY2hhbmdlIOS6i+S7tuebuOWFs+mAu+i+kVxyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKHBhcmFtcywgWEVVdGlscy5pc0Jvb2xlYW4ob3B0aW9uLmRhdGEpLCBvcHRpb24pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQnV0dG9uOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyXHJcbiAgfSxcclxuICBFbEJ1dHRvbnM6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckl0ZW06IGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlclxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpeinpuWPkea6kOaYr+WQpuWxnuS6juebruagh+iKgueCuVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXZlbnRUYXJnZXROb2RlIChldm50OiBhbnksIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XHJcbiAgbGV0IHRhcmdldEVsZW1cclxuICBsZXQgdGFyZ2V0ID0gZXZudC50YXJnZXRcclxuICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldC5ub2RlVHlwZSAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICBpZiAoY2xhc3NOYW1lICYmIHRhcmdldC5jbGFzc05hbWUgJiYgdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdCgnICcpLmluZGV4T2YoY2xhc3NOYW1lKSA+IC0xKSB7XHJcbiAgICAgIHRhcmdldEVsZW0gPSB0YXJnZXRcclxuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09PSBjb250YWluZXIpIHtcclxuICAgICAgcmV0dXJuIHsgZmxhZzogY2xhc3NOYW1lID8gISF0YXJnZXRFbGVtIDogdHJ1ZSwgY29udGFpbmVyLCB0YXJnZXRFbGVtOiB0YXJnZXRFbGVtIH1cclxuICAgIH1cclxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlXHJcbiAgfVxyXG4gIHJldHVybiB7IGZsYWc6IGZhbHNlIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBUYWJsZVJlbmRlclBhcmFtcywgZXZudDogYW55KSB7XHJcbiAgY29uc3QgYm9keUVsZW0gPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtdGltZS1wYW5lbCcpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWcgfHxcclxuICAgIC8vIOminOiJslxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY29sb3ItZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsICh7IGludGVyY2VwdG9yLCByZW5kZXJlciB9OiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
