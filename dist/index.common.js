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

function getFilterEvents(on, renderOpts, params, context) {
  var events = renderOpts.events;

  if (events) {
    return _xeUtils["default"].assign({}, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        params = Object.assign({
          context: context
        }, params);

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        cb.apply(null, [params].concat.apply(params, args));
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
          handleConfirmFilter(context, column, !!item.data, item);

          if (events && events[type]) {
            events[type](Object.assign({
              context: context
            }, params), evnt);
          }
        }), renderOpts, params, context)
      });
    });
  };
}

function handleConfirmFilter(context, column, checked, item) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item);
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
    var props = getFormProps(context, renderOpts, defaultProps);
    return [h(name, {
      attrs: attrs,
      props: props,
      model: {
        value: _xeUtils["default"].get(data, property),
        callback: function callback(value) {
          _xeUtils["default"].set(data, property, value);
        }
      },
      on: getFormEvents(renderOpts, params, context)
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

function getFormEvents(renderOpts, params, context) {
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
    var props = getFormProps(context, renderOpts);
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
      on: getFormEvents(renderOpts, params, context)
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
              handleConfirmFilter(context, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](Object.assign({
                  context: context
                }, params), value);
              }
            }), renderOpts, params, context)
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
              handleConfirmFilter(context, column, value && value.length > 0, item);

              if (events && events[type]) {
                events[type](Object.assign({
                  context: context
                }, params), value);
              }
            }
          }, renderOpts, params, context)
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
      var props = getFormProps(context, renderOpts);

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
          on: getFormEvents(renderOpts, params, context)
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
        on: getFormEvents(renderOpts, params, context)
      }, renderOptions(h, options, optionProps))];
    },
    editExportMethod: createExportMethod(getSelectCellValue, true),
    cellExportMethod: createExportMethod(getSelectCellValue)
  },
  ElCascader: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, renderOpts, params) {
      return cellText(h, getCascaderCellValue(renderOpts, params));
    },
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getCascaderCellValue, true),
    cellExportMethod: createExportMethod(getCascaderCellValue)
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
            handleConfirmFilter(context, column, !!value, item);

            if (events && events[type]) {
              events[type](Object.assign({
                context: context
              }, params), value);
            }
          }), renderOpts, params, context)
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
    editExportMethod: createExportMethod(getDatePickerCellValue, true),
    cellExportMethod: createExportMethod(getDatePickerCellValue)
  },
  ElTimePicker: {
    renderEdit: createEditRender(),
    renderCell: function renderCell(h, renderOpts, params) {
      return getTimePickerCellValue(renderOpts, params);
    },
    renderItem: createFormItemRender(),
    editExportMethod: createExportMethod(getTimePickerCellValue, true),
    cellExportMethod: createExportMethod(getTimePickerCellValue)
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
  var getEventTargetNode = context.getEventTargetNode;
  var bodyElem = document.body;

  if ( // 远程搜索
  getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag || // 下拉框
  getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag || // 级联
  getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag || getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag || // 日期
  getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag || getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZ2V0RmlsdGVyRXZlbnRzIiwiY29udGV4dCIsIk9iamVjdCIsImNyZWF0ZUZpbHRlclJlbmRlciIsImZpbHRlcnMiLCJvcHRpb25WYWx1ZSIsImhhbmRsZUNvbmZpcm1GaWx0ZXIiLCJjaGVja2VkIiwiZmlsdGVyTXVsdGlwbGUiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwib3B0aW9uIiwicmVuZGVyT3B0aW9ucyIsImRpc2FibGVkUHJvcCIsImRpc2FibGVkIiwia2V5IiwiY2VsbFRleHQiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1Qcm9wcyIsImdldEZvcm1FdmVudHMiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiZWRpdEV4cG9ydE1ldGhvZCIsImNlbGxFeHBvcnRNZXRob2QiLCJFbENhc2NhZGVyIiwiRWxEYXRlUGlja2VyIiwiRWxUaW1lUGlja2VyIiwiRWxUaW1lU2VsZWN0IiwiRWxSYXRlIiwiRWxTd2l0Y2giLCJFbFNsaWRlciIsIkVsUmFkaW8iLCJFbENoZWNrYm94IiwiaGFuZGxlQ2xlYXJFdmVudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsU0FBVCxDQUFvQkMsS0FBcEIsRUFBZ0NDLEtBQWhDLEVBQTBDO0FBQ3hDLFNBQU9ELEtBQUssSUFBSUMsS0FBSyxDQUFDQyxXQUFmLEdBQTZCQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0MsV0FBbEMsQ0FBN0IsR0FBOEVGLEtBQXJGO0FBQ0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF3QkwsS0FBeEIsRUFBb0NDLEtBQXBDLEVBQWdESyxhQUFoRCxFQUFxRTtBQUNuRSxTQUFPSCxvQkFBUUksWUFBUixDQUFxQlIsU0FBUyxDQUFDQyxLQUFELEVBQVFDLEtBQVIsQ0FBOUIsRUFBOENBLEtBQUssQ0FBQ08sTUFBTixJQUFnQkYsYUFBOUQsQ0FBUDtBQUNEOztBQUVELFNBQVNHLGNBQVQsQ0FBeUJDLE1BQXpCLEVBQXNDVCxLQUF0QyxFQUFrRFUsU0FBbEQsRUFBcUVMLGFBQXJFLEVBQTBGO0FBQ3hGLFNBQU9ILG9CQUFRUyxHQUFSLENBQVlGLE1BQVosRUFBb0IsVUFBQ0csSUFBRDtBQUFBLFdBQWVSLGFBQWEsQ0FBQ1EsSUFBRCxFQUFPWixLQUFQLEVBQWNLLGFBQWQsQ0FBNUI7QUFBQSxHQUFwQixFQUE4RVEsSUFBOUUsQ0FBbUZILFNB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QUFPc0csUUFBUCxFQUFpQixvQkFBakIsQ0FBbEIsQ0FBeURHLElBRnpELElBR0E7QUFDQUosRUFBQUEsa0JBQWtCLENBQUNyRyxJQUFELEVBQU9zRyxRQUFQLEVBQWlCLHVCQUFqQixDQUFsQixDQUE0REcsSUFKNUQsSUFLQUosa0JBQWtCLENBQUNyRyxJQUFELEVBQU9zRyxRQUFQLEVBQWlCLG1CQUFqQixDQUFsQixDQUF3REcsSUFMeEQsSUFNQTtBQUNBSixFQUFBQSxrQkFBa0IsQ0FBQ3JHLElBQUQsRUFBT3NHLFFBQVAsRUFBaUIsZUFBakIsQ0FBbEIsQ0FBb0RHLElBUHBELElBUUFKLGtCQUFrQixDQUFDckcsSUFBRCxFQUFPc0csUUFBUCxFQUFpQixpQkFBakIsQ0FBbEIsQ0FBc0RHLElBVnhELEVBV0U7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7O0FBR08sSUFBTUMscUJBQXFCLEdBQUc7QUFDbkNDLEVBQUFBLE9BRG1DLG1CQUMxQkMsTUFEMEIsRUFDSDtBQUFBLFFBQ3hCQyxXQUR3QixHQUNFRCxNQURGLENBQ3hCQyxXQUR3QjtBQUFBLFFBQ1hDLFFBRFcsR0FDRUYsTUFERixDQUNYRSxRQURXO0FBRTlCQSxJQUFBQSxRQUFRLENBQUNDLEtBQVQsQ0FBZTFDLFNBQWY7QUFDQXdDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gaXNFbXB0eVZhbHVlIChjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZURhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBhbnlbXSwgdmFsdWVzOiBhbnlbXSwgbGFiZWxzOiBhbnlbXSkge1xyXG4gIGxldCB2YWw6IGFueSA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMgKHsgJHRhYmxlIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgbGV0IGNvbGlkOiBzdHJpbmcgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgbGV0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBsZXQgY2FjaGVDZWxsOiBhbnkgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnlcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJzsnKVxyXG4gIH1cclxuICByZXR1cm4gbnVsbFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXNjYWRlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICB2YXIgdmFsdWVzOiBhbnlbXSA9IGNlbGxWYWx1ZSB8fCBbXVxyXG4gIHZhciBsYWJlbHM6IGFueVtdID0gW11cclxuICBtYXRjaENhc2NhZGVyRGF0YSgwLCBwcm9wcy5vcHRpb25zLCB2YWx1ZXMsIGxhYmVscylcclxuICByZXR1cm4gKHByb3BzLnNob3dBbGxMZXZlbHMgPT09IGZhbHNlID8gbGFiZWxzLnNsaWNlKGxhYmVscy5sZW5ndGggLSAxLCBsYWJlbHMubGVuZ3RoKSA6IGxhYmVscykuam9pbihgICR7cHJvcHMuc2VwYXJhdG9yIHx8ICcvJ30gYClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgeyByYW5nZVNlcGFyYXRvciA9ICctJyB9OiBhbnkgPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgY2FzZSAnd2Vlayc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXl3V1cnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5JylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVzJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgJywgJywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRldGltZXJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZXMoY2VsbFZhbHVlLCBwcm9wcywgYCAke3JhbmdlU2VwYXJhdG9yfSBgLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICB9XHJcbiAgcmV0dXJuIGNlbGxWYWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB7IGlzUmFuZ2UsIGZvcm1hdCA9ICdoaDptbTpzcycsIHJhbmdlU2VwYXJhdG9yID0gJy0nIH06IGFueSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgaWYgKGNlbGxWYWx1ZSAmJiBpc1JhbmdlKSB7XHJcbiAgICBjZWxsVmFsdWUgPSBYRVV0aWxzLm1hcChjZWxsVmFsdWUsIChkYXRlOiBhbnkpID0+IFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShkYXRlLCBwcm9wcyksIGZvcm1hdCkpLmpvaW4oYCAke3JhbmdlU2VwYXJhdG9yfSBgKVxyXG4gIH1cclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGNlbGxWYWx1ZSwgcHJvcHMpLCBmb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVkaXRSZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgocmVuZGVyT3B0cy5uYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBYRVV0aWxzLnNldChyb3csIGNvbHVtbi5wcm9wZXJ0eSwgdmFsdWUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGaWx0ZXJFdmVudHMgKG9uOiBhbnksIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gIGxldCB7IGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHsgY29udGV4dCB9LCBwYXJhbXMpXHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55LCBjb250ZXh0OiBhbnkpIHtcclxuICAgIGxldCB7IGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUsIGF0dHJzLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICByZXR1cm4gaChuYW1lLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICBbdHlwZV0gKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAoY29udGV4dDogYW55LCBjb2x1bW46IGFueSwgY2hlY2tlZDogYW55LCBpdGVtOiBhbnkpIHtcclxuICBjb250ZXh0W2NvbHVtbi5maWx0ZXJNdWx0aXBsZSA/ICdjaGFuZ2VNdWx0aXBsZU9wdGlvbicgOiAnY2hhbmdlUmFkaW9PcHRpb24nXSh7fSwgY2hlY2tlZCwgaXRlbSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gIGxldCB7IGRhdGEgfTogYW55ID0gb3B0aW9uXHJcbiAgbGV0IGNlbGxWYWx1ZTogc3RyaW5nID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXHJcbiAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnMgKGg6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnksIG9wdGlvblByb3BzOiBhbnkpIHtcclxuICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgbGV0IHZhbHVlUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMudmFsdWUgfHwgJ3ZhbHVlJ1xyXG4gIGxldCBkaXNhYmxlZFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmRpc2FibGVkIHx8ICdkaXNhYmxlZCdcclxuICByZXR1cm4gWEVVdGlscy5tYXAob3B0aW9ucywgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGgoJ2VsLW9wdGlvbicsIHtcclxuICAgICAgcHJvcHM6IHtcclxuICAgICAgICB2YWx1ZTogaXRlbVt2YWx1ZVByb3BdLFxyXG4gICAgICAgIGxhYmVsOiBpdGVtW2xhYmVsUHJvcF0sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGl0ZW1bZGlzYWJsZWRQcm9wXVxyXG4gICAgICB9LFxyXG4gICAgICBrZXk6IGluZGV4XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNlbGxUZXh0IChoOiBGdW5jdGlvbiwgY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gWycnICsgKGlzRW1wdHlWYWx1ZShjZWxsVmFsdWUpID8gJycgOiBjZWxsVmFsdWUpXVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1Qcm9wcyhjb250ZXh0LCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1Qcm9wcyAoeyAkZm9ybSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJGZvcm0udlNpemUgPyB7IHNpemU6ICRmb3JtLnZTaXplIH0gOiB7fSwgZGVmYXVsdFByb3BzLCBwcm9wcylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybUV2ZW50cyAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkZm9ybSB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJGZvcm0udXBkYXRlU3RhdHVzKHBhcmFtcylcclxuICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCBldm50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0LmFwcGx5KHBhcmFtcywgYXJncykpXHJcbiAgICB9KSwgb24pXHJcbiAgfVxyXG4gIHJldHVybiBvblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFeHBvcnRNZXRob2QgKHZhbHVlTWV0aG9kOiBGdW5jdGlvbiwgaXNFZGl0PzogYm9vbGVhbikge1xyXG4gIGNvbnN0IHJlbmRlclByb3BlcnR5ID0gaXNFZGl0ID8gJ2VkaXRSZW5kZXInIDogJ2NlbGxSZW5kZXInXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChwYXJhbXM6IGFueSkge1xyXG4gICAgcmV0dXJuIHZhbHVlTWV0aG9kKHBhcmFtcy5jb2x1bW5bcmVuZGVyUHJvcGVydHldLCBwYXJhbXMpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIgKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgbGV0IHsgbmFtZSwgb3B0aW9ucywgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKGNvbnRleHQsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBsZXQgZGlzYWJsZWRQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbjogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgICAgIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3Vwcywgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCB7IGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBsZXQgdHlwZSA9ICdjaGFuZ2UnXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsID0gb3B0aW9uR3JvdXBQcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICAgIFt0eXBlXSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihjb250ZXh0LCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0oT2JqZWN0LmFzc2lnbih7IGNvbnRleHQgfSwgcGFyYW1zKSwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMsIGNvbnRleHQpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBjaGFuZ2UgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybVByb3BzKGNvbnRleHQsIHJlbmRlck9wdHMpXHJcbiAgICAgIGlmIChvcHRpb25Hcm91cHMpIHtcclxuICAgICAgICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgICAgICAgbGV0IGdyb3VwTGFiZWw6IHN0cmluZyA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcywgY29udGV4dClcclxuICAgICAgICB9LCByZW5kZXJPcHRpb25zKGgsIG9wdGlvbnMsIG9wdGlvblByb3BzKSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIGVkaXRFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRTZWxlY3RDZWxsVmFsdWUsIHRydWUpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFNlbGVjdENlbGxWYWx1ZSlcclxuICB9LFxyXG4gIEVsQ2FzY2FkZXI6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckNlbGwgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICAgIHJldHVybiBjZWxsVGV4dChoLCBnZXRDYXNjYWRlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0Q2FzY2FkZXJDZWxsVmFsdWUsIHRydWUpLFxyXG4gICAgY2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnksIGNvbnRleHQ6IGFueSkge1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGU6IHN0cmluZyA9ICdjaGFuZ2UnXHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVDb25maXJtRmlsdGVyKGNvbnRleHQsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKE9iamVjdC5hc3NpZ24oeyBjb250ZXh0IH0sIHBhcmFtcyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zLCBjb250ZXh0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgICAgIGxldCB7IGRhdGEgfTogYW55ID0gb3B0aW9uXHJcbiAgICAgIGxldCB7IGZpbHRlclJlbmRlcjogcmVuZGVyT3B0cyB9OiBhbnkgPSBjb2x1bW5cclxuICAgICAgbGV0IHsgcHJvcHMgPSB7fSB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIHN3aXRjaCAocHJvcHMudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnZGF0ZXJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NLWRkJylcclxuICAgICAgICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICAgICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbFZhbHVlID09PSBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBlZGl0RXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSlcclxuICB9LFxyXG4gIEVsVGltZVNlbGVjdDoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxSYXRlOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTd2l0Y2g6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFNsaWRlcjoge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmFkaW86IHtcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlcigpXHJcbiAgfSxcclxuICBFbENoZWNrYm94OiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOS6i+S7tuWFvOWuueaAp+WkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlQ2xlYXJFdmVudCAocGFyYW1zOiBhbnksIGV2bnQ6IGFueSwgY29udGV4dDogYW55KSB7XHJcbiAgbGV0IHsgZ2V0RXZlbnRUYXJnZXROb2RlIH06IGFueSA9IGNvbnRleHRcclxuICBsZXQgYm9keUVsZW06IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keVxyXG4gIGlmIChcclxuICAgIC8vIOi/nOeoi+aQnOe0olxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nKS5mbGFnIHx8XHJcbiAgICAvLyDkuIvmi4nmoYZcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXNlbGVjdC1kcm9wZG93bicpLmZsYWcgfHxcclxuICAgIC8vIOe6p+iBlFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXJfX2Ryb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY2FzY2FkZXItbWVudXMnKS5mbGFnIHx8XHJcbiAgICAvLyDml6XmnJ9cclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXRpbWUtcGFuZWwnKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1waWNrZXItcGFuZWwnKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
