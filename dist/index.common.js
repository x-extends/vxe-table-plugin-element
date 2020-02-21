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
    }).join(';');
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
  return function (h, renderOpts, params, context) {
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
  return function (h, renderOpts, params, context) {
    var data = params.data,
        property = params.property;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormProps(params, renderOpts, defaultProps);
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

function getFormProps(_ref4, _ref5, defaultProps) {
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
  return function (h, renderOpts, params, context) {
    var name = renderOpts.name,
        options = renderOpts.options,
        _renderOpts$optionPro2 = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
    var props = getFormProps(params, renderOpts);
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
    renderFilter: function renderFilter(h, renderOpts, params, context) {
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
    renderItem: function renderItem(h, renderOpts, params, context) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro5 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormProps(params, renderOpts);

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
    renderFilter: function renderFilter(h, renderOpts, params, context) {
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
exports.VXETablePluginElement = VXETablePluginElement;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement);
}

var _default = VXETablePluginElement;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY3JlYXRlRmlsdGVyUmVuZGVyIiwiY29udGV4dCIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiJHBhbmVsIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1Qcm9wcyIsImdldEZvcm1FdmVudHMiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsImhhbmRsZUNsZWFyRXZlbnQiLCJnZXRFdmVudFRhcmdldE5vZGUiLCJib2R5RWxlbSIsImRvY3VtZW50IiwiYm9keSIsImZsYWciLCJWWEVUYWJsZVBsdWdpbkVsZW1lbnQiLCJpbnN0YWxsIiwieHRhYmxlIiwiaW50ZXJjZXB0b3IiLCJyZW5kZXJlciIsIm1peGluIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7O0FBR0EsU0FBU0EsWUFBVCxDQUF1QkMsU0FBdkIsRUFBcUM7QUFDbkMsU0FBT0EsU0FBUyxLQUFLLElBQWQsSUFBc0JBLFNBQVMsS0FBS0MsU0FBcEMsSUFBaURELFNBQVMsS0FBSyxFQUF0RTtBQUNEOztBQUVELFNBQVNFLFNBQVQsQ0FBb0JDLEtBQXBCLEVBQWdDQyxLQUFoQyxFQUEwQztBQUN4QyxTQUFPRCxLQUFLLElBQUlDLEtBQUssQ0FBQ0MsV0FBZixHQUE2QkMsb0JBQVFDLFlBQVIsQ0FBcUJKLEtBQXJCLEVBQTRCQyxLQUFLLENBQUNDLFdBQWxDLENBQTdCLEdBQThFRixLQUFyRjtBQUNEOztBQUVELFNBQVNLLGFBQVQsQ0FBd0JMLEtBQXhCLEVBQW9DQyxLQUFwQyxFQUFnREssYUFBaEQsRUFBcUU7QUFDbkUsU0FBT0gsb0JBQVFJLFlBQVIsQ0FBcUJSLFNBQVMsQ0FBQ0MsS0FBRCxFQUFRQyxLQUFSLENBQTlCLEVBQThDQSxLQUFLLENBQUNPLE1BQU4sSUFBZ0JGLGFBQTlELENBQVA7QUFDRDs7QUFFRCxTQUFTRyxjQUFULENBQXlCQyxNQUF6QixFQUFzQ1QsS0FBdEMsRUFBa0RVLFNBQWxELEVBQXFFTCxhQUFyRSxFQUEwRjtBQUN4RixTQUFPSCxvQkFBUVMsR0FBUixDQUFZRixNQUFaLEVBQW9CLFVBQUNHLElBQUQ7QUFBQSxXQUFlUixhQUFhLENBQUNRLElBQUQsRUFBT1osS0FBUCxFQUFjSyxhQUFkLENBQTVCO0FBQUEsR0FBcEIsRUFBOEVRLElBQTlFLENBQW1G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QixDQUFsQixDQUF3REcsSUFaMUQsRUFhRTtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7QUFHTyxJQUFNQyxxQkFBcUIsR0FBRztBQUNuQ0MsRUFBQUEsT0FEbUMsbUJBQzFCQyxNQUQwQixFQUNIO0FBQUEsUUFDeEJDLFdBRHdCLEdBQ0VELE1BREYsQ0FDeEJDLFdBRHdCO0FBQUEsUUFDWEMsUUFEVyxHQUNFRixNQURGLENBQ1hFLFFBRFc7QUFFOUJBLElBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlMUMsU0FBZjtBQUNBd0MsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQ1osZ0JBQXJDO0FBQ0FTLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixvQkFBaEIsRUFBc0NaLGdCQUF0QztBQUNEO0FBTmtDLENBQTlCOzs7QUFTUCxJQUFJLE9BQU9hLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JULHFCQUFwQjtBQUNEOztlQUVjQSxxQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5VmFsdWUgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PT0gbnVsbCB8fCBjZWxsVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBjZWxsVmFsdWUgPT09ICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSk6IGFueSB7XHJcbiAgcmV0dXJuIHZhbHVlICYmIHByb3BzLnZhbHVlRm9ybWF0ID8gWEVVdGlscy50b1N0cmluZ0RhdGUodmFsdWUsIHByb3BzLnZhbHVlRm9ybWF0KSA6IHZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZSh2YWx1ZSwgcHJvcHMpLCBwcm9wcy5mb3JtYXQgfHwgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZXMgKHZhbHVlczogYW55LCBwcm9wczogYW55LCBzZXBhcmF0b3I6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gWEVVdGlscy5tYXAodmFsdWVzLCAoZGF0ZTogYW55KSA9PiBnZXRGb3JtYXREYXRlKGRhdGUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSkuam9pbihzZXBhcmF0b3IpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsRGF0ZXJhbmdlIChjZWxsVmFsdWU6IGFueSwgZGF0YTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA+PSBnZXRGb3JtYXREYXRlKGRhdGFbMF0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KSAmJiBjZWxsVmFsdWUgPD0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzFdLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hDYXNjYWRlckRhdGEgKGluZGV4OiBudW1iZXIsIGxpc3Q6IGFueVtdLCB2YWx1ZXM6IGFueVtdLCBsYWJlbHM6IGFueVtdKSB7XHJcbiAgbGV0IHZhbDogYW55ID0gdmFsdWVzW2luZGV4XVxyXG4gIGlmIChsaXN0ICYmIHZhbHVlcy5sZW5ndGggPiBpbmRleCkge1xyXG4gICAgWEVVdGlscy5lYWNoKGxpc3QsIChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgaWYgKGl0ZW0udmFsdWUgPT09IHZhbCkge1xyXG4gICAgICAgIGxhYmVscy5wdXNoKGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgbWF0Y2hDYXNjYWRlckRhdGEoKytpbmRleCwgaXRlbS5jaGlsZHJlbiwgdmFsdWVzLCBsYWJlbHMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcm9wcyAoeyAkdGFibGUgfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCR0YWJsZS52U2l6ZSA/IHsgc2l6ZTogJHRhYmxlLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2VsbEV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG5hbWUsIGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkdGFibGUudXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTZWxlY3RDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIHByb3BzID0ge30sIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgJHRhYmxlLCByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBsZXQgY29saWQ6IHN0cmluZyA9IGNvbHVtbi5pZFxyXG4gIGxldCByZXN0OiBhbnlcclxuICBsZXQgY2VsbERhdGE6IGFueVxyXG4gIGlmIChwcm9wcy5maWx0ZXJhYmxlKSB7XHJcbiAgICBsZXQgZnVsbEFsbERhdGFSb3dNYXA6IE1hcDxhbnksIGFueT4gPSAkdGFibGUuZnVsbEFsbERhdGFSb3dNYXBcclxuICAgIGxldCBjYWNoZUNlbGw6IGFueSA9IGZ1bGxBbGxEYXRhUm93TWFwLmhhcyhyb3cpXHJcbiAgICBpZiAoY2FjaGVDZWxsKSB7XHJcbiAgICAgIHJlc3QgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KVxyXG4gICAgICBjZWxsRGF0YSA9IHJlc3QuY2VsbERhdGFcclxuICAgICAgaWYgKCFjZWxsRGF0YSkge1xyXG4gICAgICAgIGNlbGxEYXRhID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdykuY2VsbERhdGEgPSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdCAmJiBjZWxsRGF0YVtjb2xpZF0gJiYgY2VsbERhdGFbY29saWRdLnZhbHVlID09PSBjZWxsVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGNlbGxEYXRhW2NvbGlkXS5sYWJlbFxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIWlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5tYXAocHJvcHMubXVsdGlwbGUgPyBjZWxsVmFsdWUgOiBbY2VsbFZhbHVlXSwgb3B0aW9uR3JvdXBzID8gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueVxyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb3B0aW9uR3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHNlbGVjdEl0ZW0gPSBYRVV0aWxzLmZpbmQob3B0aW9uR3JvdXBzW2luZGV4XVtncm91cE9wdGlvbnNdLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgIGlmIChzZWxlY3RJdGVtKSB7XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0gOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbTogYW55ID0gWEVVdGlscy5maW5kKG9wdGlvbnMsIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgIGxldCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSkuam9pbignOycpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHZhciB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgdmFyIGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH06IGFueSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfTogYW55ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGU6IGFueSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgfVxyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyAob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQoYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdFbElucHV0JzpcclxuICAgICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXSAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnN0ICRwYW5lbCA9IHBhcmFtcy4kcGFuZWwgfHwgcGFyYW1zLmNvbnRleHRcclxuICAkcGFuZWxbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlOiBzdHJpbmcgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB7IGF0dHJzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChuYW1lLCB7XHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICRmb3JtIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBuYW1lLCBvcHRpb25zLCBvcHRpb25Qcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRGb3JtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gICAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChgJHtuYW1lfUdyb3VwYCwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0sIG9wdGlvbnMubWFwKChvcHRpb246IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiBvcHRpb25bdmFsdWVQcm9wXSxcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbltkaXNhYmxlZFByb3BdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgb3B0aW9uW2xhYmVsUHJvcF0pXHJcbiAgICAgIH0pKVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOa4suafk+WHveaVsFxyXG4gKi9cclxuY29uc3QgcmVuZGVyTWFwID0ge1xyXG4gIEVsQXV0b2NvbXBsZXRlOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsSW5wdXQ6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dE51bWJlcjoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgcm93LCBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldFNlbGVjdENlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgaWYgKG9wdGlvbkdyb3Vwcykge1xyXG4gICAgICAgIGxldCBncm91cE9wdGlvbnM6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbDogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgICAgfSwgWEVVdGlscy5tYXAob3B0aW9uR3JvdXBzLCAoZ3JvdXA6IGFueSwgZ0luZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2VsLW9wdGlvbi1ncm91cCcsIHtcclxuICAgICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGdyb3VwW2dyb3VwTGFiZWxdXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBrZXk6IGdJbmRleFxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIGdyb3VwW2dyb3VwT3B0aW9uc10sIG9wdGlvblByb3BzKSlcclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBYRVV0aWxzLnNldChkYXRhLCBwcm9wZXJ0eSwgY2VsbFZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUpLFxyXG4gICAgZWRpdENlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsRGF0ZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldERhdGVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKSlcclxuICAgIH0sXHJcbiAgICByZW5kZXJGaWx0ZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7blhbzlrrnmgKflpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUNsZWFyRXZlbnQgKHBhcmFtczogYW55LCBldm50OiBhbnksIGNvbnRleHQ6YW55KSB7XHJcbiAgY29uc3QgeyAkdGFibGUgfSA9IHBhcmFtc1xyXG4gIGNvbnN0IGdldEV2ZW50VGFyZ2V0Tm9kZSA9ICR0YWJsZSA/ICR0YWJsZS5nZXRFdmVudFRhcmdldE5vZGUgOiBjb250ZXh0LmdldEV2ZW50VGFyZ2V0Tm9kZVxyXG4gIGNvbnN0IGJvZHlFbGVtOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcclxuICBpZiAoXHJcbiAgICAvLyDov5znqIvmkJzntKJcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJykuZmxhZyB8fFxyXG4gICAgLy8g5LiL5ouJ5qGGXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1zZWxlY3QtZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICAvLyDnuqfogZRcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyX19kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLWNhc2NhZGVyLW1lbnVzJykuZmxhZyB8fFxyXG4gICAgLy8g5pel5pyfXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC10aW1lLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtcGlja2VyLXBhbmVsJykuZmxhZyB8fFxyXG4gICAgLy8g6aKc6ImyXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jb2xvci1kcm9wZG93bicpLmZsYWdcclxuICApIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE6YCC6YWN5o+S5Lu277yM55So5LqO5YW85a65IGVsZW1lbnQtdWkg57uE5Lu25bqTXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FbGVtZW50ID0ge1xyXG4gIGluc3RhbGwgKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBsZXQgeyBpbnRlcmNlcHRvciwgcmVuZGVyZXIgfSA9IHh0YWJsZVxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckZpbHRlcicsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgICBpbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmNsZWFyQWN0aXZlZCcsIGhhbmRsZUNsZWFyRXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkVsZW1lbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRWxlbWVudFxyXG4iXX0=
