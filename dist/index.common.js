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
  }, cellText(h, renderOpts.content || props.content))];
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImlzRW1wdHlWYWx1ZSIsImNlbGxWYWx1ZSIsInVuZGVmaW5lZCIsInBhcnNlRGF0ZSIsInZhbHVlIiwicHJvcHMiLCJ2YWx1ZUZvcm1hdCIsIlhFVXRpbHMiLCJ0b1N0cmluZ0RhdGUiLCJnZXRGb3JtYXREYXRlIiwiZGVmYXVsdEZvcm1hdCIsInRvRGF0ZVN0cmluZyIsImZvcm1hdCIsImdldEZvcm1hdERhdGVzIiwidmFsdWVzIiwic2VwYXJhdG9yIiwibWFwIiwiZGF0ZSIsImpvaW4iLCJlcXVhbERhdGVyYW5nZSIsImRhdGEiLCJtYXRjaENhc2NhZGVyRGF0YSIsImluZGV4IiwibGlzdCIsImxhYmVscyIsInZhbCIsImxlbmd0aCIsImVhY2giLCJpdGVtIiwicHVzaCIsImxhYmVsIiwiY2hpbGRyZW4iLCJnZXRQcm9wcyIsImRlZmF1bHRQcm9wcyIsIiR0YWJsZSIsImFzc2lnbiIsInZTaXplIiwic2l6ZSIsImdldENlbGxFdmVudHMiLCJyZW5kZXJPcHRzIiwicGFyYW1zIiwibmFtZSIsImV2ZW50cyIsInR5cGUiLCJvbiIsImV2bnQiLCJ1cGRhdGVTdGF0dXMiLCJvYmplY3RNYXAiLCJjYiIsImFyZ3MiLCJhcHBseSIsImNvbmNhdCIsImdldFNlbGVjdENlbGxWYWx1ZSIsIm9wdGlvbnMiLCJvcHRpb25Hcm91cHMiLCJvcHRpb25Qcm9wcyIsIm9wdGlvbkdyb3VwUHJvcHMiLCJyb3ciLCJjb2x1bW4iLCJsYWJlbFByb3AiLCJ2YWx1ZVByb3AiLCJncm91cE9wdGlvbnMiLCJnZXQiLCJwcm9wZXJ0eSIsImNvbGlkIiwiaWQiLCJyZXN0IiwiY2VsbERhdGEiLCJmaWx0ZXJhYmxlIiwiZnVsbEFsbERhdGFSb3dNYXAiLCJjYWNoZUNlbGwiLCJoYXMiLCJtdWx0aXBsZSIsInNlbGVjdEl0ZW0iLCJmaW5kIiwiY2VsbExhYmVsIiwiZ2V0Q2FzY2FkZXJDZWxsVmFsdWUiLCJzaG93QWxsTGV2ZWxzIiwic2xpY2UiLCJnZXREYXRlUGlja2VyQ2VsbFZhbHVlIiwicmFuZ2VTZXBhcmF0b3IiLCJnZXRUaW1lUGlja2VyQ2VsbFZhbHVlIiwiaXNSYW5nZSIsImNyZWF0ZUVkaXRSZW5kZXIiLCJoIiwiYXR0cnMiLCJtb2RlbCIsImNhbGxiYWNrIiwic2V0IiwiZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIiLCJjZWxsVGV4dCIsImNvbnRlbnQiLCJkZWZhdWx0QnV0dG9uc0VkaXRSZW5kZXIiLCJjaGlsZFJlbmRlck9wdHMiLCJnZXRGaWx0ZXJFdmVudHMiLCJjcmVhdGVGaWx0ZXJSZW5kZXIiLCJmaWx0ZXJzIiwib3B0aW9uVmFsdWUiLCJoYW5kbGVDb25maXJtRmlsdGVyIiwiY2hlY2tlZCIsIiRwYW5lbCIsImNvbnRleHQiLCJmaWx0ZXJNdWx0aXBsZSIsImRlZmF1bHRGaWx0ZXJNZXRob2QiLCJvcHRpb24iLCJyZW5kZXJPcHRpb25zIiwiZGlzYWJsZWRQcm9wIiwiZGlzYWJsZWQiLCJrZXkiLCJjcmVhdGVGb3JtSXRlbVJlbmRlciIsImdldEZvcm1JdGVtUHJvcHMiLCJnZXRGb3JtRXZlbnRzIiwiZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIiLCJkZWZhdWx0QnV0dG9uc0l0ZW1SZW5kZXIiLCIkZm9ybSIsImNyZWF0ZUV4cG9ydE1ldGhvZCIsInZhbHVlTWV0aG9kIiwiaXNFZGl0IiwicmVuZGVyUHJvcGVydHkiLCJjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIiLCJyZW5kZXJNYXAiLCJFbEF1dG9jb21wbGV0ZSIsImF1dG9mb2N1cyIsInJlbmRlckRlZmF1bHQiLCJyZW5kZXJFZGl0IiwicmVuZGVyRmlsdGVyIiwiZmlsdGVyTWV0aG9kIiwicmVuZGVySXRlbSIsIkVsSW5wdXQiLCJFbElucHV0TnVtYmVyIiwiRWxTZWxlY3QiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJnSW5kZXgiLCJyZW5kZXJDZWxsIiwiY2hhbmdlIiwiZmlsdGVyUmVuZGVyIiwiaXNBcnJheSIsImluY2x1ZGVBcnJheXMiLCJpbmRleE9mIiwiY2VsbEV4cG9ydE1ldGhvZCIsImVkaXRDZWxsRXhwb3J0TWV0aG9kIiwiRWxDYXNjYWRlciIsIkVsRGF0ZVBpY2tlciIsIkVsVGltZVBpY2tlciIsIkVsVGltZVNlbGVjdCIsIkVsUmF0ZSIsIkVsU3dpdGNoIiwiRWxTbGlkZXIiLCJFbFJhZGlvIiwiRWxDaGVja2JveCIsIkVsQnV0dG9uIiwiRWxCdXR0b25zIiwiaGFuZGxlQ2xlYXJFdmVudCIsImdldEV2ZW50VGFyZ2V0Tm9kZSIsImJvZHlFbGVtIiwiZG9jdW1lbnQiLCJib2R5IiwiZmxhZyIsIlZYRVRhYmxlUGx1Z2luRWxlbWVudCIsImluc3RhbGwiLCJ4dGFibGUiLCJpbnRlcmNlcHRvciIsInJlbmRlcmVyIiwibWl4aW4iLCJhZGQiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFHQSxTQUFTQSxZQUFULENBQXVCQyxTQUF2QixFQUFxQztBQUNuQyxTQUFPQSxTQUFTLEtBQUssSUFBZCxJQUFzQkEsU0FBUyxLQUFLQyxTQUFwQyxJQUFpREQsU0FBUyxLQUFLLEVBQXRFO0FBQ0Q7O0FBRUQsU0FBU0UsU0FBVCxDQUFvQkMsS0FBcEIsRUFBZ0NDLEtBQWhDLEVBQTBDO0FBQ3hDLFNBQU9ELEtBQUssSUFBSUMsS0FBSyxDQUFDQyxXQUFmLEdBQTZCQyxvQkFBUUMsWUFBUixDQUFxQkosS0FBckIsRUFBNEJDLEtBQUssQ0FBQ0MsV0FBbEMsQ0FBN0IsR0FBOEVGLEtBQXJGO0FBQ0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF3QkwsS0FBeEIsRUFBb0NDLEtBQXBDLEVBQWdESyxhQUFoRCxFQUFxRTtBQUNuRSxTQUFPSCxvQkFBUUksWUFBUixDQUFxQlIsU0FBUyxDQUFDQyxLQUFELEVBQVFDLEtBQVIsQ0FBOUIsRUFBOENBLEtBQUssQ0FBQ08sTUFBTixJQUFnQkYsYUFBOUQsQ0FBUDtBQUNEOztBQUVELFNBQVNHLGNBQVQsQ0FBeUJDLE1BQXpCLEVBQXNDVCxLQUF0QyxFQUFrRFUs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LENBQUNDLEtBQVQsQ0FBZTVDLFNBQWY7QUFDQTBDLElBQUFBLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixtQkFBaEIsRUFBcUNaLGdCQUFyQztBQUNBUyxJQUFBQSxXQUFXLENBQUNHLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDWixnQkFBdEM7QUFDRDtBQU5rQyxDQUE5Qjs7O0FBU1AsSUFBSSxPQUFPYSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVCxxQkFBcEI7QUFDRDs7ZUFFY0EscUIiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5cclxuZnVuY3Rpb24gaXNFbXB0eVZhbHVlIChjZWxsVmFsdWU6IGFueSkge1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT09IG51bGwgfHwgY2VsbFZhbHVlID09PSB1bmRlZmluZWQgfHwgY2VsbFZhbHVlID09PSAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZURhdGUgKHZhbHVlOiBhbnksIHByb3BzOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wcy52YWx1ZUZvcm1hdCA/IFhFVXRpbHMudG9TdHJpbmdEYXRlKHZhbHVlLCBwcm9wcy52YWx1ZUZvcm1hdCkgOiB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtYXREYXRlICh2YWx1ZTogYW55LCBwcm9wczogYW55LCBkZWZhdWx0Rm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUodmFsdWUsIHByb3BzKSwgcHJvcHMuZm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1hdERhdGVzICh2YWx1ZXM6IGFueSwgcHJvcHM6IGFueSwgc2VwYXJhdG9yOiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKHZhbHVlcywgKGRhdGU6IGFueSkgPT4gZ2V0Rm9ybWF0RGF0ZShkYXRlLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkpLmpvaW4oc2VwYXJhdG9yKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbERhdGVyYW5nZSAoY2VsbFZhbHVlOiBhbnksIGRhdGE6IGFueSwgcHJvcHM6IGFueSwgZGVmYXVsdEZvcm1hdDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCBkZWZhdWx0Rm9ybWF0KVxyXG4gIHJldHVybiBjZWxsVmFsdWUgPj0gZ2V0Rm9ybWF0RGF0ZShkYXRhWzBdLCBwcm9wcywgZGVmYXVsdEZvcm1hdCkgJiYgY2VsbFZhbHVlIDw9IGdldEZvcm1hdERhdGUoZGF0YVsxXSwgcHJvcHMsIGRlZmF1bHRGb3JtYXQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdGNoQ2FzY2FkZXJEYXRhIChpbmRleDogbnVtYmVyLCBsaXN0OiBhbnlbXSwgdmFsdWVzOiBhbnlbXSwgbGFiZWxzOiBhbnlbXSkge1xyXG4gIGxldCB2YWw6IGFueSA9IHZhbHVlc1tpbmRleF1cclxuICBpZiAobGlzdCAmJiB2YWx1ZXMubGVuZ3RoID4gaW5kZXgpIHtcclxuICAgIFhFVXRpbHMuZWFjaChsaXN0LCAoaXRlbTogYW55KSA9PiB7XHJcbiAgICAgIGlmIChpdGVtLnZhbHVlID09PSB2YWwpIHtcclxuICAgICAgICBsYWJlbHMucHVzaChpdGVtLmxhYmVsKVxyXG4gICAgICAgIG1hdGNoQ2FzY2FkZXJEYXRhKCsraW5kZXgsIGl0ZW0uY2hpbGRyZW4sIHZhbHVlcywgbGFiZWxzKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMgKHsgJHRhYmxlIH06IGFueSwgeyBwcm9wcyB9OiBhbnksIGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBYRVV0aWxzLmFzc2lnbigkdGFibGUudlNpemUgPyB7IHNpemU6ICR0YWJsZS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGxFdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBuYW1lLCBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgdHlwZTogc3RyaW5nID0gJ2NoYW5nZSdcclxuICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgIGNhc2UgJ0VsQXV0b2NvbXBsZXRlJzpcclxuICAgICAgdHlwZSA9ICdzZWxlY3QnXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdFbElucHV0JzpcclxuICAgIGNhc2UgJ0VsSW5wdXROdW1iZXInOlxyXG4gICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICBicmVha1xyXG4gIH1cclxuICBsZXQgb24gPSB7XHJcbiAgICBbdHlwZV06IChldm50OiBhbnkpID0+IHtcclxuICAgICAgJHRhYmxlLnVwZGF0ZVN0YXR1cyhwYXJhbXMpXHJcbiAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZXZlbnRzKSB7XHJcbiAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sIFhFVXRpbHMub2JqZWN0TWFwKGV2ZW50cywgKGNiOiBGdW5jdGlvbikgPT4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgIGNiLmFwcGx5KG51bGwsIFtwYXJhbXNdLmNvbmNhdC5hcHBseShwYXJhbXMsIGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2VsZWN0Q2VsbFZhbHVlIChyZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBwcm9wcyA9IHt9LCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICR0YWJsZSwgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZ3JvdXBPcHRpb25zOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLm9wdGlvbnMgfHwgJ29wdGlvbnMnXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgbGV0IGNvbGlkOiBzdHJpbmcgPSBjb2x1bW4uaWRcclxuICBsZXQgcmVzdDogYW55XHJcbiAgbGV0IGNlbGxEYXRhOiBhbnlcclxuICBpZiAocHJvcHMuZmlsdGVyYWJsZSkge1xyXG4gICAgbGV0IGZ1bGxBbGxEYXRhUm93TWFwOiBNYXA8YW55LCBhbnk+ID0gJHRhYmxlLmZ1bGxBbGxEYXRhUm93TWFwXHJcbiAgICBsZXQgY2FjaGVDZWxsOiBhbnkgPSBmdWxsQWxsRGF0YVJvd01hcC5oYXMocm93KVxyXG4gICAgaWYgKGNhY2hlQ2VsbCkge1xyXG4gICAgICByZXN0ID0gZnVsbEFsbERhdGFSb3dNYXAuZ2V0KHJvdylcclxuICAgICAgY2VsbERhdGEgPSByZXN0LmNlbGxEYXRhXHJcbiAgICAgIGlmICghY2VsbERhdGEpIHtcclxuICAgICAgICBjZWxsRGF0YSA9IGZ1bGxBbGxEYXRhUm93TWFwLmdldChyb3cpLmNlbGxEYXRhID0ge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHJlc3QgJiYgY2VsbERhdGFbY29saWRdICYmIGNlbGxEYXRhW2NvbGlkXS52YWx1ZSA9PT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBjZWxsRGF0YVtjb2xpZF0ubGFiZWxcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCFpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMubWFwKHByb3BzLm11bHRpcGxlID8gY2VsbFZhbHVlIDogW2NlbGxWYWx1ZV0sIG9wdGlvbkdyb3VwcyA/ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIGxldCBzZWxlY3RJdGVtOiBhbnlcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9wdGlvbkdyb3Vwcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBzZWxlY3RJdGVtID0gWEVVdGlscy5maW5kKG9wdGlvbkdyb3Vwc1tpbmRleF1bZ3JvdXBPcHRpb25zXSwgKGl0ZW06IGFueSkgPT4gaXRlbVt2YWx1ZVByb3BdID09PSB2YWx1ZSlcclxuICAgICAgICBpZiAoc2VsZWN0SXRlbSkge1xyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGNlbGxMYWJlbDogYW55ID0gc2VsZWN0SXRlbSA/IHNlbGVjdEl0ZW1bbGFiZWxQcm9wXSA6IHZhbHVlXHJcbiAgICAgIGlmIChjZWxsRGF0YSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2VsbERhdGFbY29saWRdID0geyB2YWx1ZTogY2VsbFZhbHVlLCBsYWJlbDogY2VsbExhYmVsIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2VsbExhYmVsXHJcbiAgICB9IDogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgbGV0IHNlbGVjdEl0ZW06IGFueSA9IFhFVXRpbHMuZmluZChvcHRpb25zLCAoaXRlbTogYW55KSA9PiBpdGVtW3ZhbHVlUHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICBsZXQgY2VsbExhYmVsOiBhbnkgPSBzZWxlY3RJdGVtID8gc2VsZWN0SXRlbVtsYWJlbFByb3BdIDogdmFsdWVcclxuICAgICAgaWYgKGNlbGxEYXRhICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjZWxsRGF0YVtjb2xpZF0gPSB7IHZhbHVlOiBjZWxsVmFsdWUsIGxhYmVsOiBjZWxsTGFiZWwgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjZWxsTGFiZWxcclxuICAgIH0pLmpvaW4oJywgJylcclxuICB9XHJcbiAgcmV0dXJuIG51bGxcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FzY2FkZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgdmFyIHZhbHVlczogYW55W10gPSBjZWxsVmFsdWUgfHwgW11cclxuICB2YXIgbGFiZWxzOiBhbnlbXSA9IFtdXHJcbiAgbWF0Y2hDYXNjYWRlckRhdGEoMCwgcHJvcHMub3B0aW9ucywgdmFsdWVzLCBsYWJlbHMpXHJcbiAgcmV0dXJuIChwcm9wcy5zaG93QWxsTGV2ZWxzID09PSBmYWxzZSA/IGxhYmVscy5zbGljZShsYWJlbHMubGVuZ3RoIC0gMSwgbGFiZWxzLmxlbmd0aCkgOiBsYWJlbHMpLmpvaW4oYCAke3Byb3BzLnNlcGFyYXRvciB8fCAnLyd9IGApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGVQaWNrZXJDZWxsVmFsdWUgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBwcm9wcyA9IHt9IH0gPSByZW5kZXJPcHRzXHJcbiAgbGV0IHsgcm93LCBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgbGV0IHsgcmFuZ2VTZXBhcmF0b3IgPSAnLScgfTogYW55ID0gcHJvcHNcclxuICBsZXQgY2VsbFZhbHVlOiBhbnkgPSBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSlcclxuICBzd2l0Y2ggKHByb3BzLnR5cGUpIHtcclxuICAgIGNhc2UgJ3dlZWsnOlxyXG4gICAgICBjZWxsVmFsdWUgPSBnZXRGb3JtYXREYXRlKGNlbGxWYWx1ZSwgcHJvcHMsICd5eXl5d1dXJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd5ZWFyJzpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eScpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdkYXRlcyc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsICcsICcsICd5eXl5LU1NLWRkJylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2RhdGVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQnKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0tZGQgSEg6c3M6bW0nKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnbW9udGhyYW5nZSc6XHJcbiAgICAgIGNlbGxWYWx1ZSA9IGdldEZvcm1hdERhdGVzKGNlbGxWYWx1ZSwgcHJvcHMsIGAgJHtyYW5nZVNlcGFyYXRvcn0gYCwgJ3l5eXktTU0nKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY2VsbFZhbHVlID0gZ2V0Rm9ybWF0RGF0ZShjZWxsVmFsdWUsIHByb3BzLCAneXl5eS1NTS1kZCcpXHJcbiAgfVxyXG4gIHJldHVybiBjZWxsVmFsdWVcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSAocmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIGxldCB7IHByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICBsZXQgeyBpc1JhbmdlLCBmb3JtYXQgPSAnaGg6bW06c3MnLCByYW5nZVNlcGFyYXRvciA9ICctJyB9OiBhbnkgPSBwcm9wc1xyXG4gIGxldCBjZWxsVmFsdWU6IGFueSA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIGlmIChjZWxsVmFsdWUgJiYgaXNSYW5nZSkge1xyXG4gICAgY2VsbFZhbHVlID0gWEVVdGlscy5tYXAoY2VsbFZhbHVlLCAoZGF0ZTogYW55KSA9PiBYRVV0aWxzLnRvRGF0ZVN0cmluZyhwYXJzZURhdGUoZGF0ZSwgcHJvcHMpLCBmb3JtYXQpKS5qb2luKGAgJHtyYW5nZVNlcGFyYXRvcn0gYClcclxuICB9XHJcbiAgcmV0dXJuIFhFVXRpbHMudG9EYXRlU3RyaW5nKHBhcnNlRGF0ZShjZWxsVmFsdWUsIHByb3BzKSwgZm9ybWF0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFZGl0UmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyByb3csIGNvbHVtbiB9OiBhbnkgPSBwYXJhbXNcclxuICAgIGxldCB7IGF0dHJzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzLCBkZWZhdWx0UHJvcHMpXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKHJlbmRlck9wdHMubmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQocm93LCBjb2x1bW4ucHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldENlbGxFdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkVkaXRSZW5kZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgcmV0dXJuIFtcclxuICAgIGgoJ2VsLWJ1dHRvbicsIHtcclxuICAgICAgYXR0cnMsXHJcbiAgICAgIHByb3BzLFxyXG4gICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICB9LCBjZWxsVGV4dChoLCByZW5kZXJPcHRzLmNvbnRlbnQpKVxyXG4gIF1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gIHJldHVybiByZW5kZXJPcHRzLmNoaWxkcmVuLm1hcCgoY2hpbGRSZW5kZXJPcHRzOiBhbnkpID0+IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyKGgsIGNoaWxkUmVuZGVyT3B0cywgcGFyYW1zKVswXSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmlsdGVyRXZlbnRzIChvbjogYW55LCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGlmIChldmVudHMpIHtcclxuICAgIHJldHVybiBYRVV0aWxzLmFzc2lnbih7fSwgWEVVdGlscy5vYmplY3RNYXAoZXZlbnRzLCAoY2I6IEZ1bmN0aW9uKSA9PiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgY2IuYXBwbHkobnVsbCwgW3BhcmFtc10uY29uY2F0KGFyZ3MpKVxyXG4gICAgfSksIG9uKVxyXG4gIH1cclxuICByZXR1cm4gb25cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRmlsdGVyUmVuZGVyIChkZWZhdWx0UHJvcHM/OiBhbnkpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgICBsZXQgeyBjb2x1bW4gfTogYW55ID0gcGFyYW1zXHJcbiAgICBsZXQgeyBuYW1lLCBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgbGV0IHR5cGU6IHN0cmluZyA9ICdjaGFuZ2UnXHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICAgIHR5cGUgPSAnc2VsZWN0J1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgICBjYXNlICdFbElucHV0TnVtYmVyJzpcclxuICAgICAgICB0eXBlID0gJ2lucHV0J1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgaXRlbS5kYXRhID0gb3B0aW9uVmFsdWVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGaWx0ZXJFdmVudHMoe1xyXG4gICAgICAgICAgW3R5cGVdIChldm50OiBhbnkpIHtcclxuICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgISFpdGVtLmRhdGEsIGl0ZW0pXHJcbiAgICAgICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgZXZudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb25maXJtRmlsdGVyIChwYXJhbXM6IGFueSwgY29sdW1uOiBhbnksIGNoZWNrZWQ6IGFueSwgaXRlbTogYW55KSB7XHJcbiAgY29uc3QgJHBhbmVsID0gcGFyYW1zLiRwYW5lbCB8fCBwYXJhbXMuY29udGV4dFxyXG4gICRwYW5lbFtjb2x1bW4uZmlsdGVyTXVsdGlwbGUgPyAnY2hhbmdlTXVsdGlwbGVPcHRpb24nIDogJ2NoYW5nZVJhZGlvT3B0aW9uJ10oe30sIGNoZWNrZWQsIGl0ZW0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gIGxldCBjZWxsVmFsdWU6IHN0cmluZyA9IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KVxyXG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xyXG4gIHJldHVybiBjZWxsVmFsdWUgPT0gZGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJPcHRpb25zIChoOiBGdW5jdGlvbiwgb3B0aW9uczogYW55LCBvcHRpb25Qcm9wczogYW55KSB7XHJcbiAgbGV0IGxhYmVsUHJvcDogc3RyaW5nID0gb3B0aW9uUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gIGxldCB2YWx1ZVByb3A6IHN0cmluZyA9IG9wdGlvblByb3BzLnZhbHVlIHx8ICd2YWx1ZSdcclxuICBsZXQgZGlzYWJsZWRQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgcmV0dXJuIFhFVXRpbHMubWFwKG9wdGlvbnMsIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgIHJldHVybiBoKCdlbC1vcHRpb24nLCB7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW1bdmFsdWVQcm9wXSxcclxuICAgICAgICBsYWJlbDogaXRlbVtsYWJlbFByb3BdLFxyXG4gICAgICAgIGRpc2FibGVkOiBpdGVtW2Rpc2FibGVkUHJvcF1cclxuICAgICAgfSxcclxuICAgICAga2V5OiBpbmRleFxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBjZWxsVGV4dCAoaDogRnVuY3Rpb24sIGNlbGxWYWx1ZTogYW55KSB7XHJcbiAgcmV0dXJuIFsnJyArIChpc0VtcHR5VmFsdWUoY2VsbFZhbHVlKSA/ICcnIDogY2VsbFZhbHVlKV1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9ybUl0ZW1SZW5kZXIgKGRlZmF1bHRQcm9wcz86IGFueSkge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgIGxldCB7IGRhdGEsIHByb3BlcnR5IH0gPSBwYXJhbXNcclxuICAgIGxldCB7IG5hbWUgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCB7IGF0dHJzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybUl0ZW1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMsIGRlZmF1bHRQcm9wcylcclxuICAgIHJldHVybiBbXHJcbiAgICAgIGgobmFtZSwge1xyXG4gICAgICAgIGF0dHJzLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICB2YWx1ZTogWEVVdGlscy5nZXQoZGF0YSwgcHJvcGVydHkpLFxyXG4gICAgICAgICAgY2FsbGJhY2sgKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIHZhbHVlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGdldEZvcm1FdmVudHMocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXIgKGg6IEZ1bmN0aW9uLCByZW5kZXJPcHRzOiBhbnksIHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gIGNvbnN0IHByb3BzOiBhbnkgPSBnZXRGb3JtSXRlbVByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICByZXR1cm4gW1xyXG4gICAgaCgnZWwtYnV0dG9uJywge1xyXG4gICAgICBhdHRycyxcclxuICAgICAgcHJvcHMsXHJcbiAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgIH0sIGNlbGxUZXh0KGgsIHJlbmRlck9wdHMuY29udGVudCB8fCBwcm9wcy5jb250ZW50KSlcclxuICBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRCdXR0b25zSXRlbVJlbmRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICByZXR1cm4gcmVuZGVyT3B0cy5jaGlsZHJlbi5tYXAoKGNoaWxkUmVuZGVyT3B0czogYW55KSA9PiBkZWZhdWx0QnV0dG9uSXRlbVJlbmRlcihoLCBjaGlsZFJlbmRlck9wdHMsIHBhcmFtcylbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1JdGVtUHJvcHMgKHsgJGZvcm0gfTogYW55LCB7IHByb3BzIH06IGFueSwgZGVmYXVsdFByb3BzPzogYW55KSB7XHJcbiAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKCRmb3JtLnZTaXplID8geyBzaXplOiAkZm9ybS52U2l6ZSB9IDoge30sIGRlZmF1bHRQcm9wcywgcHJvcHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvcm1FdmVudHMgKHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICBsZXQgeyBldmVudHMgfTogYW55ID0gcmVuZGVyT3B0c1xyXG4gIGxldCB7ICRmb3JtIH06IGFueSA9IHBhcmFtc1xyXG4gIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gIHN3aXRjaCAobmFtZSkge1xyXG4gICAgY2FzZSAnRWxBdXRvY29tcGxldGUnOlxyXG4gICAgICB0eXBlID0gJ3NlbGVjdCdcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ0VsSW5wdXQnOlxyXG4gICAgY2FzZSAnRWxJbnB1dE51bWJlcic6XHJcbiAgICAgIHR5cGUgPSAnaW5wdXQnXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG4gIGxldCBvbiA9IHtcclxuICAgIFt0eXBlXTogKGV2bnQ6IGFueSkgPT4ge1xyXG4gICAgICAkZm9ybS51cGRhdGVTdGF0dXMocGFyYW1zKVxyXG4gICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIGV2bnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGV2ZW50cykge1xyXG4gICAgcmV0dXJuIFhFVXRpbHMuYXNzaWduKHt9LCBYRVV0aWxzLm9iamVjdE1hcChldmVudHMsIChjYjogRnVuY3Rpb24pID0+IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICBjYi5hcHBseShudWxsLCBbcGFyYW1zXS5jb25jYXQuYXBwbHkocGFyYW1zLCBhcmdzKSlcclxuICAgIH0pLCBvbilcclxuICB9XHJcbiAgcmV0dXJuIG9uXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydE1ldGhvZCAodmFsdWVNZXRob2Q6IEZ1bmN0aW9uLCBpc0VkaXQ/OiBib29sZWFuKSB7XHJcbiAgY29uc3QgcmVuZGVyUHJvcGVydHkgPSBpc0VkaXQgPyAnZWRpdFJlbmRlcicgOiAnY2VsbFJlbmRlcidcclxuICByZXR1cm4gZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICByZXR1cm4gdmFsdWVNZXRob2QocGFyYW1zLmNvbHVtbltyZW5kZXJQcm9wZXJ0eV0sIHBhcmFtcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1JdGVtUmFkaW9BbmRDaGVja2JveFJlbmRlciAoKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgbGV0IHsgbmFtZSwgb3B0aW9ucywgb3B0aW9uUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgbGV0IHsgYXR0cnMgfSA9IHJlbmRlck9wdHNcclxuICAgIGxldCBwcm9wczogYW55ID0gZ2V0Rm9ybUl0ZW1Qcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICBsZXQgbGFiZWxQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5sYWJlbCB8fCAnbGFiZWwnXHJcbiAgICBsZXQgdmFsdWVQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy52YWx1ZSB8fCAndmFsdWUnXHJcbiAgICBsZXQgZGlzYWJsZWRQcm9wOiBzdHJpbmcgPSBvcHRpb25Qcm9wcy5kaXNhYmxlZCB8fCAnZGlzYWJsZWQnXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBoKGAke25hbWV9R3JvdXBgLCB7XHJcbiAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgWEVVdGlscy5zZXQoZGF0YSwgcHJvcGVydHksIGNlbGxWYWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBnZXRGb3JtRXZlbnRzKHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgfSwgb3B0aW9ucy5tYXAoKG9wdGlvbjogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGgobmFtZSwge1xyXG4gICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6IG9wdGlvblt2YWx1ZVByb3BdLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogb3B0aW9uW2Rpc2FibGVkUHJvcF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBvcHRpb25bbGFiZWxQcm9wXSlcclxuICAgICAgfSkpXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5riy5p+T5Ye95pWwXHJcbiAqL1xyXG5jb25zdCByZW5kZXJNYXAgPSB7XHJcbiAgRWxBdXRvY29tcGxldGU6IHtcclxuICAgIGF1dG9mb2N1czogJ2lucHV0LmVsLWlucHV0X19pbm5lcicsXHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxJbnB1dDoge1xyXG4gICAgYXV0b2ZvY3VzOiAnaW5wdXQuZWwtaW5wdXRfX2lubmVyJyxcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbElucHV0TnVtYmVyOiB7XHJcbiAgICBhdXRvZm9jdXM6ICdpbnB1dC5lbC1pbnB1dF9faW5uZXInLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU2VsZWN0OiB7XHJcbiAgICByZW5kZXJFZGl0IChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIGxldCB7IGF0dHJzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wczogYW55ID0gZ2V0UHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KHJvdywgY29sdW1uLnByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KHJvdywgY29sdW1uLnByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Q2VsbEV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0U2VsZWN0Q2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyRmlsdGVyIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICBsZXQgeyBvcHRpb25zLCBvcHRpb25Hcm91cHMsIG9wdGlvblByb3BzID0ge30sIG9wdGlvbkdyb3VwUHJvcHMgPSB7fSB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgeyBjb2x1bW4gfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH0gPSByZW5kZXJPcHRzXHJcbiAgICAgIGxldCBwcm9wcyA9IGdldFByb3BzKHBhcmFtcywgcmVuZGVyT3B0cylcclxuICAgICAgbGV0IHR5cGUgPSAnY2hhbmdlJ1xyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9ucyA9IG9wdGlvbkdyb3VwUHJvcHMub3B0aW9ucyB8fCAnb3B0aW9ucydcclxuICAgICAgICBsZXQgZ3JvdXBMYWJlbCA9IG9wdGlvbkdyb3VwUHJvcHMubGFiZWwgfHwgJ2xhYmVsJ1xyXG4gICAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGgoJ2VsLXNlbGVjdCcsIHtcclxuICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGEsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgICBbdHlwZV0gKHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICBldmVudHNbdHlwZV0ocGFyYW1zLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdHMsIHBhcmFtcylcclxuICAgICAgICAgIH0sIFhFVXRpbHMubWFwKG9wdGlvbkdyb3VwcywgKGdyb3VwOiBhbnksIGdJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdlbC1vcHRpb24tZ3JvdXAnLCB7XHJcbiAgICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBncm91cFtncm91cExhYmVsXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAga2V5OiBnSW5kZXhcclxuICAgICAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBncm91cFtncm91cE9wdGlvbnNdLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZmlsdGVycy5tYXAoKGl0ZW06IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBoKCdlbC1zZWxlY3QnLCB7XHJcbiAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgIGF0dHJzLFxyXG4gICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZGF0YSxcclxuICAgICAgICAgICAgY2FsbGJhY2sgKG9wdGlvblZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBvcHRpb25WYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb246IGdldEZpbHRlckV2ZW50cyh7XHJcbiAgICAgICAgICAgIGNoYW5nZSAodmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGhhbmRsZUNvbmZpcm1GaWx0ZXIocGFyYW1zLCBjb2x1bW4sIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAsIGl0ZW0pXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50cyAmJiBldmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0eXBlXShwYXJhbXMsIHZhbHVlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgcmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgb3B0aW9ucywgb3B0aW9uUHJvcHMpKVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGZpbHRlck1ldGhvZCAoeyBvcHRpb24sIHJvdywgY29sdW1uIH06IGFueSkge1xyXG4gICAgICBsZXQgeyBkYXRhIH06IGFueSA9IG9wdGlvblxyXG4gICAgICBsZXQgeyBwcm9wZXJ0eSwgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBwcm9wZXJ0eSlcclxuICAgICAgaWYgKHByb3BzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgaWYgKFhFVXRpbHMuaXNBcnJheShjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gWEVVdGlscy5pbmNsdWRlQXJyYXlzKGNlbGxWYWx1ZSwgZGF0YSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihjZWxsVmFsdWUpID4gLTFcclxuICAgICAgfVxyXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cclxuICAgICAgcmV0dXJuIGNlbGxWYWx1ZSA9PSBkYXRhXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbSAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgb3B0aW9ucywgb3B0aW9uR3JvdXBzLCBvcHRpb25Qcm9wcyA9IHt9LCBvcHRpb25Hcm91cFByb3BzID0ge30gfSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHsgZGF0YSwgcHJvcGVydHkgfSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycyB9ID0gcmVuZGVyT3B0c1xyXG4gICAgICBsZXQgcHJvcHM6IGFueSA9IGdldEZvcm1JdGVtUHJvcHMocGFyYW1zLCByZW5kZXJPcHRzKVxyXG4gICAgICBpZiAob3B0aW9uR3JvdXBzKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwT3B0aW9uczogc3RyaW5nID0gb3B0aW9uR3JvdXBQcm9wcy5vcHRpb25zIHx8ICdvcHRpb25zJ1xyXG4gICAgICAgIGxldCBncm91cExhYmVsOiBzdHJpbmcgPSBvcHRpb25Hcm91cFByb3BzLmxhYmVsIHx8ICdsYWJlbCdcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IFhFVXRpbHMuZ2V0KGRhdGEsIHByb3BlcnR5KSxcclxuICAgICAgICAgICAgICBjYWxsYmFjayAoY2VsbFZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgICB9LCBYRVV0aWxzLm1hcChvcHRpb25Hcm91cHMsIChncm91cDogYW55LCBnSW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZWwtb3B0aW9uLWdyb3VwJywge1xyXG4gICAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZ3JvdXBbZ3JvdXBMYWJlbF1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleTogZ0luZGV4XHJcbiAgICAgICAgICAgIH0sIHJlbmRlck9wdGlvbnMoaCwgZ3JvdXBbZ3JvdXBPcHRpb25zXSwgb3B0aW9uUHJvcHMpKVxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnZWwtc2VsZWN0Jywge1xyXG4gICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICBhdHRycyxcclxuICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBYRVV0aWxzLmdldChkYXRhLCBwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrIChjZWxsVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIFhFVXRpbHMuc2V0KGRhdGEsIHByb3BlcnR5LCBjZWxsVmFsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0Rm9ybUV2ZW50cyhyZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSwgcmVuZGVyT3B0aW9ucyhoLCBvcHRpb25zLCBvcHRpb25Qcm9wcykpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0U2VsZWN0Q2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxDYXNjYWRlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGNlbGxUZXh0KGgsIGdldENhc2NhZGVyQ2VsbFZhbHVlKHJlbmRlck9wdHMsIHBhcmFtcykpXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXRDYXNjYWRlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldENhc2NhZGVyQ2VsbFZhbHVlLCB0cnVlKVxyXG4gIH0sXHJcbiAgRWxEYXRlUGlja2VyOiB7XHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJDZWxsIChoOiBGdW5jdGlvbiwgcmVuZGVyT3B0czogYW55LCBwYXJhbXM6IGFueSkge1xyXG4gICAgICByZXR1cm4gY2VsbFRleHQoaCwgZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZShyZW5kZXJPcHRzLCBwYXJhbXMpKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckZpbHRlciAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgbGV0IHsgY29sdW1uIH06IGFueSA9IHBhcmFtc1xyXG4gICAgICBsZXQgeyBhdHRycywgZXZlbnRzIH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IHByb3BzOiBhbnkgPSBnZXRQcm9wcyhwYXJhbXMsIHJlbmRlck9wdHMpXHJcbiAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSAnY2hhbmdlJ1xyXG4gICAgICByZXR1cm4gY29sdW1uLmZpbHRlcnMubWFwKChpdGVtOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gaChyZW5kZXJPcHRzLm5hbWUsIHtcclxuICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgYXR0cnMsXHJcbiAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogaXRlbS5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsYmFjayAob3B0aW9uVmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IG9wdGlvblZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvbjogZ2V0RmlsdGVyRXZlbnRzKHtcclxuICAgICAgICAgICAgW3R5cGVdICh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlQ29uZmlybUZpbHRlcihwYXJhbXMsIGNvbHVtbiwgISF2YWx1ZSwgaXRlbSlcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRzICYmIGV2ZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3R5cGVdKHBhcmFtcywgdmFsdWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCByZW5kZXJPcHRzLCBwYXJhbXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBmaWx0ZXJNZXRob2QgKHsgb3B0aW9uLCByb3csIGNvbHVtbiB9OiBhbnkpIHtcclxuICAgICAgbGV0IHsgZGF0YSB9OiBhbnkgPSBvcHRpb25cclxuICAgICAgbGV0IHsgZmlsdGVyUmVuZGVyOiByZW5kZXJPcHRzIH06IGFueSA9IGNvbHVtblxyXG4gICAgICBsZXQgeyBwcm9wcyA9IHt9IH06IGFueSA9IHJlbmRlck9wdHNcclxuICAgICAgbGV0IGNlbGxWYWx1ZTogYW55ID0gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpXHJcbiAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgc3dpdGNoIChwcm9wcy50eXBlKSB7XHJcbiAgICAgICAgICBjYXNlICdkYXRlcmFuZ2UnOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxEYXRlcmFuZ2UoY2VsbFZhbHVlLCBkYXRhLCBwcm9wcywgJ3l5eXktTU0tZGQnKVxyXG4gICAgICAgICAgY2FzZSAnZGF0ZXRpbWVyYW5nZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbERhdGVyYW5nZShjZWxsVmFsdWUsIGRhdGEsIHByb3BzLCAneXl5eS1NTS1kZCBISDpzczptbScpXHJcbiAgICAgICAgICBjYXNlICdtb250aHJhbmdlJzpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsRGF0ZXJhbmdlKGNlbGxWYWx1ZSwgZGF0YSwgcHJvcHMsICd5eXl5LU1NJylcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBjZWxsVmFsdWUgPT09IGRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9LFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKSxcclxuICAgIGNlbGxFeHBvcnRNZXRob2Q6IGNyZWF0ZUV4cG9ydE1ldGhvZChnZXREYXRlUGlja2VyQ2VsbFZhbHVlKSxcclxuICAgIGVkaXRDZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0RGF0ZVBpY2tlckNlbGxWYWx1ZSwgdHJ1ZSlcclxuICB9LFxyXG4gIEVsVGltZVBpY2tlcjoge1xyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyQ2VsbCAoaDogRnVuY3Rpb24sIHJlbmRlck9wdHM6IGFueSwgcGFyYW1zOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIGdldFRpbWVQaWNrZXJDZWxsVmFsdWUocmVuZGVyT3B0cywgcGFyYW1zKVxyXG4gICAgfSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKCksXHJcbiAgICBjZWxsRXhwb3J0TWV0aG9kOiBjcmVhdGVFeHBvcnRNZXRob2QoZ2V0VGltZVBpY2tlckNlbGxWYWx1ZSksXHJcbiAgICBlZGl0Q2VsbEV4cG9ydE1ldGhvZDogY3JlYXRlRXhwb3J0TWV0aG9kKGdldFRpbWVQaWNrZXJDZWxsVmFsdWUsIHRydWUpXHJcbiAgfSxcclxuICBFbFRpbWVTZWxlY3Q6IHtcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsUmF0ZToge1xyXG4gICAgcmVuZGVyRGVmYXVsdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRWRpdDogY3JlYXRlRWRpdFJlbmRlcigpLFxyXG4gICAgcmVuZGVyRmlsdGVyOiBjcmVhdGVGaWx0ZXJSZW5kZXIoKSxcclxuICAgIGZpbHRlck1ldGhvZDogZGVmYXVsdEZpbHRlck1ldGhvZCxcclxuICAgIHJlbmRlckl0ZW06IGNyZWF0ZUZvcm1JdGVtUmVuZGVyKClcclxuICB9LFxyXG4gIEVsU3dpdGNoOiB7XHJcbiAgICByZW5kZXJEZWZhdWx0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJFZGl0OiBjcmVhdGVFZGl0UmVuZGVyKCksXHJcbiAgICByZW5kZXJGaWx0ZXI6IGNyZWF0ZUZpbHRlclJlbmRlcigpLFxyXG4gICAgZmlsdGVyTWV0aG9kOiBkZWZhdWx0RmlsdGVyTWV0aG9kLFxyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxTbGlkZXI6IHtcclxuICAgIHJlbmRlckRlZmF1bHQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckVkaXQ6IGNyZWF0ZUVkaXRSZW5kZXIoKSxcclxuICAgIHJlbmRlckZpbHRlcjogY3JlYXRlRmlsdGVyUmVuZGVyKCksXHJcbiAgICBmaWx0ZXJNZXRob2Q6IGRlZmF1bHRGaWx0ZXJNZXRob2QsXHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJlbmRlcigpXHJcbiAgfSxcclxuICBFbFJhZGlvOiB7XHJcbiAgICByZW5kZXJJdGVtOiBjcmVhdGVGb3JtSXRlbVJhZGlvQW5kQ2hlY2tib3hSZW5kZXIoKVxyXG4gIH0sXHJcbiAgRWxDaGVja2JveDoge1xyXG4gICAgcmVuZGVySXRlbTogY3JlYXRlRm9ybUl0ZW1SYWRpb0FuZENoZWNrYm94UmVuZGVyKClcclxuICB9LFxyXG4gIEVsQnV0dG9uOiB7XHJcbiAgICByZW5kZXJFZGl0OiBkZWZhdWx0QnV0dG9uRWRpdFJlbmRlcixcclxuICAgIHJlbmRlckRlZmF1bHQ6IGRlZmF1bHRCdXR0b25FZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbkl0ZW1SZW5kZXJcclxuICB9LFxyXG4gIEVsQnV0dG9uczoge1xyXG4gICAgcmVuZGVyRWRpdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVyRGVmYXVsdDogZGVmYXVsdEJ1dHRvbnNFZGl0UmVuZGVyLFxyXG4gICAgcmVuZGVySXRlbTogZGVmYXVsdEJ1dHRvbnNJdGVtUmVuZGVyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu25YW85a655oCn5aSE55CGXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVDbGVhckV2ZW50IChwYXJhbXM6IGFueSwgZXZudDogYW55LCBjb250ZXh0OmFueSkge1xyXG4gIGNvbnN0IHsgJHRhYmxlIH0gPSBwYXJhbXNcclxuICBjb25zdCBnZXRFdmVudFRhcmdldE5vZGUgPSAkdGFibGUgPyAkdGFibGUuZ2V0RXZlbnRUYXJnZXROb2RlIDogY29udGV4dC5nZXRFdmVudFRhcmdldE5vZGVcclxuICBjb25zdCBib2R5RWxlbTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XHJcbiAgaWYgKFxyXG4gICAgLy8g6L+c56iL5pCc57SiXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbicpLmZsYWcgfHxcclxuICAgIC8vIOS4i+aLieahhlxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtc2VsZWN0LWRyb3Bkb3duJykuZmxhZyB8fFxyXG4gICAgLy8g57qn6IGUXHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlcl9fZHJvcGRvd24nKS5mbGFnIHx8XHJcbiAgICBnZXRFdmVudFRhcmdldE5vZGUoZXZudCwgYm9keUVsZW0sICdlbC1jYXNjYWRlci1tZW51cycpLmZsYWcgfHxcclxuICAgIC8vIOaXpeacn1xyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtdGltZS1wYW5lbCcpLmZsYWcgfHxcclxuICAgIGdldEV2ZW50VGFyZ2V0Tm9kZShldm50LCBib2R5RWxlbSwgJ2VsLXBpY2tlci1wYW5lbCcpLmZsYWcgfHxcclxuICAgIC8vIOminOiJslxyXG4gICAgZ2V0RXZlbnRUYXJnZXROb2RlKGV2bnQsIGJvZHlFbGVtLCAnZWwtY29sb3ItZHJvcGRvd24nKS5mbGFnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOmAgumFjeaPkuS7tu+8jOeUqOS6juWFvOWuuSBlbGVtZW50LXVpIOe7hOS7tuW6k1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRWxlbWVudCA9IHtcclxuICBpbnN0YWxsICh4dGFibGU6IHR5cGVvZiBWWEVUYWJsZSkge1xyXG4gICAgbGV0IHsgaW50ZXJjZXB0b3IsIHJlbmRlcmVyIH0gPSB4dGFibGVcclxuICAgIHJlbmRlcmVyLm1peGluKHJlbmRlck1hcClcclxuICAgIGludGVyY2VwdG9yLmFkZCgnZXZlbnQuY2xlYXJGaWx0ZXInLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gICAgaW50ZXJjZXB0b3IuYWRkKCdldmVudC5jbGVhckFjdGl2ZWQnLCBoYW5kbGVDbGVhckV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FbGVtZW50KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkVsZW1lbnRcclxuIl19
