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

function defaultButtonEditRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getProps(params, renderOpts);
  return [h('el-button', {
    attrs: attrs,
    props: props,
    on: getCellEvents(renderOpts, params)
  }, cellText(h, renderOpts.content))];
}

function defaultButtonsEditRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonEditRender(h, childRenderOpts, params)[0];
  });
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
  return function (h, renderOpts, params) {
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
  return function (h, renderOpts, params) {
    var data = params.data,
        property = params.property;
    var name = renderOpts.name;
    var attrs = renderOpts.attrs;
    var props = getFormItemProps(params, renderOpts, defaultProps);
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

function defaultButtonItemRender(h, renderOpts, params) {
  var attrs = renderOpts.attrs;
  var props = getFormItemProps(params, renderOpts);
  return [h('el-button', {
    attrs: attrs,
    props: props,
    on: getFormEvents(renderOpts, params)
  }, cellText(h, props.content))];
}

function defaultButtonsItemRender(h, renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonItemRender(h, childRenderOpts, params)[0];
  });
}

function getFormItemProps(_ref4, _ref5, defaultProps) {
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
  return function (h, renderOpts, params) {
    var name = renderOpts.name,
        options = renderOpts.options,
        _renderOpts$optionPro2 = renderOpts.optionProps,
        optionProps = _renderOpts$optionPro2 === void 0 ? {} : _renderOpts$optionPro2;
    var data = params.data,
        property = params.property;
    var attrs = renderOpts.attrs;
    var props = getFormItemProps(params, renderOpts);
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
    renderFilter: function renderFilter(h, renderOpts, params) {
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
    renderItem: function renderItem(h, renderOpts, params) {
      var options = renderOpts.options,
          optionGroups = renderOpts.optionGroups,
          _renderOpts$optionPro5 = renderOpts.optionProps,
          optionProps = _renderOpts$optionPro5 === void 0 ? {} : _renderOpts$optionPro5,
          _renderOpts$optionGro4 = renderOpts.optionGroupProps,
          optionGroupProps = _renderOpts$optionGro4 === void 0 ? {} : _renderOpts$optionGro4;
      var data = params.data,
          property = params.property;
      var attrs = renderOpts.attrs;
      var props = getFormItemProps(params, renderOpts);

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
    renderFilter: function renderFilter(h, renderOpts, params) {
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
  },
  ElButton: {
    renderEdit: defaultButtonEditRender,
    renderDefault: defaultButtonEditRender,
    renderItem: defaultButtonItemRender
  },
  ElButtons: {
    renderEdit: defaultButtonsEditRender,
    renderDefault: defaultButtonsEditRender,
    renderItem: defaultButtonsItemRender
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJnZXRGaWx0ZXJFdmVudHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNvbnRleHQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1JdGVtUHJvcHMiLCJnZXRGb3JtRXZlbnRzIiwiZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIiLCJkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsIkVsQnV0dG9uIiwiRWxCdXR0b25zIiwiaGFuZGxlQ2xlYXJFdmVudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsU0FBVCxDQUFvQkMsS0FBcEIsRUFBZ0NDLEtBQWhDLEVBQTBDO0FBQ3hDLFNBQU9ELEtBQUssSUFBSUMsS0FBSyxDQUFDQyxXQUFmLEdBQTZCQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0MsV0FBbEMsQ0FBN0IsR0FBOEVGLEtBQXJGO0FBQ0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF3QkwsS0FBeEIsRUFBb0NDLEtBQXBDLEVBQWdESyxhQUFoRCxFQUFxRTtBQUNuRSxTQUFPSCxvQkFBUUksWUFBUixDQUFxQlIsU0FBUyxDQUFDQyxLQUFELEVBQVFDLEtBQVIsQ0FBOUIsRUFBOENBLEtBQUssQ0FBQ08sTUFBTixJQUFnQkYsYUFBOUQsQ0FBUDtBQUNEOztBQUVELFNBQVNHLGNBQVQsQ0FBeUJDLE1BQXpCLEVBQXNDVCxLQUF0QyxFQUFrRFUs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Q0EwQyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDWixnQkFBckM7QUFDQVMsSUFBQUEsV0FBVyxDQUFDRyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQ1osZ0JBQXRDO0FBQ0Q7QUFOa0MsQ0FBOUI7OztBQVNQLElBQUksT0FBT2EsTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlQscUJBQXBCO0FBQ0Q7O2VBRWNBLHFCIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYRVV0aWxzIGZyb20gJ3hlLXV0aWxzL21ldGhvZHMveGUtdXRpbHMnXHJcbmltcG9ydCBWWEVUYWJsZSBmcm9tICd2eGUtdGFibGUvbGliL3Z4ZS10YWJsZSdcclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlWYWx1ZSAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICByZXR1cm4gY2VsbFZhbHVlID09PSBudWxsIHx8IGNlbGxWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGNlbGxWYWx1ZSA9PT0gJydcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VEYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55KTogYW55IHtcclxuICByZXR1cm4gdmFsdWUgJiYgcHJvcHMudmFsdWVGb3JtYXQgPyBYRVV0aWxzLnRvU3RyaW5nRGF0ZSh2YWx1ZSwgcHJvcHMudmFsdWVGb3JtYXQpIDogdmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0RGF0ZSAodmFsdWU6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKHZhbHVlLCBwcm9wcyksIHByb3BzLmZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlcyAodmFsdWVzOiBhbnksIHByb3BzOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nLCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcCh2YWx1ZXMsIChkYXRlOiBhbnkpID0+IGdldEZvcm1hdERhdGUoZGF0ZSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpKS5qb2luKHNlcGFyYXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxEYXRlcmFuZ2UgKGNlbGxWYWx1ZTogYW55LCBkYXRhOiBhbnksIHByb3BzOiBhbnksIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgZGVmYXVsdEZvcm1hdClcclxuICByZXR1cm4gY2VsbFZhbHVlID49IGdldEZvcm1hdERhdGUoZGF0YVswXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpICYmIGNlbGxWYWx1ZSA8PSBnZXRGb3JtYXREYXRlKGRhdGFbMV0sIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRjaENhc2NhZGVyRGF0YSAoaW5kZXg6IG51bWJlciwgbGlzdDogYW55W10sIHZhbHVlczogYW55W10sIGxhYmVsczogYW55W10pIHtcclxuICBsZXQgdmFsOiBhbnkgPSB2YWx1ZXNbaW5kZXhdXHJcbiAgaWYgKGxpc3QgJiYgdmFsdWVzLmxlbmd0aCA+IGluZGV4KSB7XHJcbiAgICBYRVV0aWxzLmVhY2gobGlzdCwgKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICBpZiAoaXRlbS52YWx1ZSA9PT0gdmFsKSB7XHJcbiAgICAgICAgbGFiZWxzLnB1c2goaXRlbS5sYWJlbClcclxuICAgICAgICBtYXRjaENhc2NhZGVyRGF0YSgrK2luZGV4LCBpdGVtLmNoaWxkcmVuLCB2YWx1ZXMsIGxhYmVscylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByb3BzICh7ICR0YWJsZSB9OiBhbnksIHsgcHJvcHMgfTogYW55LCBkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gWEVVdGlscy5hc3NpZ24oJHRhYmxlLnZTaXplID8geyBzaXplOiAkdGFibGUudlNpemUgfSA6IHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsRXZlbnRzIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgbmFtZSwgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUgfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IHR5cGU6IHN0cmluZyA9ICdjaGFuZ2UnXHJcbiAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICBjYXNlICdFbEF1dG9jb21wbGV0ZSc6XHJcbiAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnRWxJbnB1dCc6XHJcbiAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgYnJlYWtcclxuICB9XHJcbiAgbGV0IG9uID0ge1xyXG4gICAgW3R5cGVdOiAoZXZudDogYW55KSA9PiB7XHJcbiAgICAgICR0YWJsZS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNlbGVjdENlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IG9wdGlvbnMsIG9wdGlvbkdyb3VwcywgcHJvcHMgPSB7fSwgb3B0aW9uUHJvcHMgPSB7fSwgb3B0aW9uR3JvdXBQcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyAkdGFibGUsIHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGxldCBjb2xpZDogc3RyaW5nID0gY29sdW1uLmlkXHJcbiAgbGV0IHJlc3Q6IGFueVxyXG4gIGxldCBjZWxsRGF0YTogYW55XHJcbiAgaWYgKHByb3BzLmZpbHRlcmFibGUpIHtcclxuICAgIGxldCBmdWxsQWxsRGF0YVJvd01hcDogTWFwPGFueSwgYW55PiA9ICR0YWJsZS5mdWxsQWxsRGF0YVJvd01hcFxyXG4gICAgbGV0IGNhY2hlQ2VsbDogYW55ID0gZnVsbEFsbERhdGFSb3dNYXAuaGFzKHJvdylcclxuICAgIGlmIChjYWNoZUNlbGwpIHtcclxuICAgICAgcmVzdCA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpXHJcbiAgICAgIGNlbGxEYXRhID0gcmVzdC5jZWxsRGF0YVxyXG4gICAgICBpZiAoIWNlbGxEYXRhKSB7XHJcbiAgICAgICAgY2VsbERhdGEgPSBmdWxsQWxsRGF0YVJvd01hcC5nZXQocm93KS5jZWxsRGF0YSA9IHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXN0ICYmIGNlbGxEYXRhW2NvbGlkXSAmJiBjZWxsRGF0YVtjb2xpZF0udmFsdWUgPT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gY2VsbERhdGFbY29saWRdLmxhYmVsXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICghaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLm1hcChwcm9wcy5tdWx0aXBsZSA/IGNlbGxWYWx1ZSA6IFtjZWxsVmFsdWVdLCBvcHRpb25Hcm91cHMgPyAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0SXRlbTogYW55XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvcHRpb25Hcm91cHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgc2VsZWN0SXRlbSA9IFhFVXRpbHMuZmluZChvcHRpb25Hcm91cHNbaW5kZXhdW2dyb3VwT3B0aW9uc10sIChpdGVtOiBhbnkpID0+IGl0ZW1bdmFsdWVQcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgaWYgKHNlbGVjdEl0ZW0pIHtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjZWxsTGFiZWw6IGFueSA9IHNlbGVjdEl0ZW0gPyBzZWxlY3RJdGVtW2xhYmVsUHJvcF0gOiB2YWx1ZVxyXG4gICAgICBpZiAoY2VsbERhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNlbGxEYXRhW2NvbGlkXSA9IHsgdmFsdWU6IGNlbGxWYWx1ZSwgbGFiZWw6IGNlbGxMYWJlbCB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNlbGxMYWJlbFxyXG4gICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnkgPSBYRVV0aWxzLmZpbmQob3B0aW9ucywgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9KS5qb2luKCcsICcpXHJcbiAgfVxyXG4gIHJldHVybiBudWxsXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhc2NhZGVyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIHZhciB2YWx1ZXM6IGFueVtdID0gY2VsbFZhbHVlIHx8IFtdXHJcbiAgdmFyIGxhYmVsczogYW55W10gPSBbXVxyXG4gIG1hdGNoQ2FzY2FkZXJEYXRhKDAsIHByb3BzLm9wdGlvbnMsIHZhbHVlcywgbGFiZWxzKVxyXG4gIHJldHVybiAocHJvcHMuc2hvd0FsbExldmVscyA9PT0gZmFsc2UgPyBsYWJlbHMuc2xpY2UobGFiZWxzLmxlbmd0aCAtIDEsIGxhYmVscy5sZW5ndGgpIDogbGFiZWxzKS5qb2luKGAgJHtwcm9wcy5zZXBhcmF0b3IgfHwgJy8nfSBgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRlUGlja2VyQ2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgcHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7IHJvdywgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB7IHJhbmdlU2VwYXJhdG9yID0gJy0nIH06IGFueSA9IHByb3BzXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICBjYXNlICd3ZWVrJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eXdXVycpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdtb250aCc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAneWVhcic6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXknKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXMnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCAnLCAnLCAneXl5eS1NTS1kZCcpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGV0aW1lcmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NLWRkIEhIOnNzOm1tJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRocmFuZ2UnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlcyhjZWxsVmFsdWUsIHByb3BzLCBgICR7cmFuZ2VTZXBhcmF0b3J9IGAsICd5eXl5LU1NJylcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGUoY2VsbFZhbHVlLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gIH1cclxuICByZXR1cm4gY2VsbFZhbHVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IHsgaXNSYW5nZSwgZm9ybWF0ID0gJ2hoOm1tOnNzJywgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfTogYW55ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBpZiAoY2VsbFZhbHVlICYmIGlzUmFuZ2UpIHtcclxuICAgIGNlbGxWYWx1ZSA9IFhFVXRpbHMubWFwKGNlbGxWYWx1ZSwgKGRhdGU6IGFueSkgPT4gWEVVdGlscy50b0RhdGVTdHJpbmcocGFyc2VEYXRlKGRhdGUsIHByb3BzKSwgZm9ybWF0KSkuam9pbihgICR7cmFuZ2VTZXBhcmF0b3J9IGApXHJcbiAgfVxyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoY2VsbFZhbHVlLCBwcm9wcyksIGZvcm1hdClcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWRpdFJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cywgZGVmYXVsdFByb3BzKVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRDZWxsRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gIHJldHVybiBbXHJcbiAgICBoKCdlbC1idXR0b24nLCB7XHJcbiAgICAgIGF0dHJzLFxyXG4gICAgICBwcm9wcyxcclxuICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSwgY2VsbFRleHQoaCwgcmVuZGVyT3B0cy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zRWRpdFJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbHRlckV2ZW50cyAob246IGFueSwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdChhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZpbHRlclJlbmRlciAoZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgbmFtZSwgYXR0cnMsIGV2ZW50cyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdFbElucHV0JzpcclxuICAgICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgICAgdHlwZSA9ICdpbnB1dCdcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvbHVtbi5maWx0ZXJzLm1hcCgoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIHJldHVybiBoKG5hbWUsIHtcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgIGNhbGxiYWNrIChvcHRpb25WYWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgIFt0eXBlXSAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sICEhaXRlbS5kYXRhLCBpdGVtKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29uZmlybUZpbHRlciAocGFyYW1zOiBhbnksIGNvbHVtbjogYW55LCBjaGVja2VkOiBhbnksIGl0ZW06IGFueSkge1xyXG4gIGNvbnN0ICRwYW5lbCA9IHBhcmFtcy4kcGFuZWwgfHwgcGFyYW1zLmNvbnRleHRcclxuICAkcGFuZWxbY29sdW1uLmZpbHRlck11bHRpcGxlID8gJ2NoYW5nZU11bHRpcGxlT3B0aW9uJyA6ICdjaGFuZ2VSYWRpb09wdGlvbiddKHt9LCBjaGVja2VkLCBpdGVtKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyTWV0aG9kICh7IG9wdGlvbiwgcm93LCBjb2x1bW4gfTogYW55KSB7XHJcbiAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICBsZXQgY2VsbFZhbHVlOiBzdHJpbmcgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICByZXR1cm4gY2VsbFZhbHVlID09IGRhdGFcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyAoaDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSwgb3B0aW9uUHJvcHM6IGFueSkge1xyXG4gIGxldCBsYWJlbFByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgbGV0IGRpc2FibGVkUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMuZGlzYWJsZWQgfHwgJ2Rpc2FibGVkJ1xyXG4gIHJldHVybiBYRVV0aWxzLm1hcChvcHRpb25zLCAoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICByZXR1cm4gaCgnZWwtb3B0aW9uJywge1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHZhbHVlOiBpdGVtW3ZhbHVlUHJvcF0sXHJcbiAgICAgICAgbGFiZWw6IGl0ZW1bbGFiZWxQcm9wXSxcclxuICAgICAgICBkaXNhYmxlZDogaXRlbVtkaXNhYmxlZFByb3BdXHJcbiAgICAgIH0sXHJcbiAgICAgIGtleTogaW5kZXhcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gY2VsbFRleHQgKGg6IEZ1bmN0aW9uLCBjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBbJycgKyAoaXNFbXB0eVZhbHVlKGNlbGxWYWx1ZSkgPyAnJyA6IGNlbGxWYWx1ZSldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyBkYXRhLCBwcm9wZXJ0eSB9ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lIH0gPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgeyBhdHRycyB9OiBhbnkgPSByZW5kZXJPcHRzXHJcbiAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1JdGVtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKG5hbWUsIHtcclxuICAgICAgICBhdHRycyxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgIGNhbGxiYWNrICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25JdGVtUmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICBjb25zdCBwcm9wczogYW55ID0gZ2V0Rm9ybUl0ZW1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1JdGVtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICRmb3JtIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgbmFtZSwgb3B0aW9ucywgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybUl0ZW1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBsZXQgZGlzYWJsZWRQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbjogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1JdGVtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQnV0dG9uOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXJcclxuICB9LFxyXG4gIEVsQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OmFueSkge1xyXG4gIGNvbnN0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBjb25zdCBnZXRFdmVudFRhcmdldE5vZGUgPSAkdGFibGUgPyAkdGFibGUuZ2V0RXZlbnRUYXJnZXROb2RlIDogY29udGV4dC5nZXRFdmVudFRhcmdldE5vZGVcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtdGltZS1wYW5lbCcpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWcgfHxcclxuICAgIC8vIOminOiJslxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY29sb3ItZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
