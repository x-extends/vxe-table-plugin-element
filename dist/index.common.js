"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getFormatDate(value, props, defaultFormat) {
  return _xeUtils["default"].toDateString(value, props.format || defaultFormat);
}

function getFormatDates(values, props, separator, defaultFormat) {
  return _xeUtils["default"].map(values, function (date) {
    return getFormatDate(date, props, defaultFormat);
  }).join(separator);
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

function defaultRender(h, editRender, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  var props = editRender.props;

  if ($table.size) {
    props = Object.assign({
      size: $table.size
    }, props);
  }

  return [h(editRender.name, {
    props: props,
    model: {
      value: _xeUtils["default"].get(row, column.property),
      callback: function callback(value) {
        _xeUtils["default"].set(row, column.property, value);
      }
    }
  })];
}

function cellText(h, cellValue) {
  return [h('span', '' + (cellValue === null || cellValue === void 0 ? '' : cellValue))];
}

var VXETablePluginElement = {
  renderMap: {
    ElInput: {
      autofocus: 'input.el-input__inner',
      renderEdit: defaultRender
    },
    ElInputNumber: {
      autofocus: 'input.el-input__inner',
      renderEdit: defaultRender
    },
    ElSelect: {
      renderEdit: function renderEdit(h, _ref, _ref2) {
        var options = _ref.options,
            _ref$props = _ref.props,
            props = _ref$props === void 0 ? {} : _ref$props,
            _ref$optionProps = _ref.optionProps,
            optionProps = _ref$optionProps === void 0 ? {} : _ref$optionProps;
        var $table = _ref2.$table,
            row = _ref2.row,
            column = _ref2.column;
        var _optionProps$label = optionProps.label,
            label = _optionProps$label === void 0 ? 'label' : _optionProps$label,
            _optionProps$value = optionProps.value,
            value = _optionProps$value === void 0 ? 'value' : _optionProps$value;

        if ($table.size) {
          props = _xeUtils["default"].assign({
            size: $table.size
          }, props);
        }

        return [h('el-select', {
          props: props,
          model: {
            value: _xeUtils["default"].get(row, column.property),
            callback: function callback(value) {
              _xeUtils["default"].set(row, column.property, value);
            }
          }
        }, _xeUtils["default"].map(options, function (item, index) {
          return h('el-option', {
            props: {
              value: item[value],
              label: item[label]
            },
            key: index
          });
        }))];
      },
      renderCell: function renderCell(h, _ref3, params) {
        var options = _ref3.options,
            _ref3$optionProps = _ref3.optionProps,
            optionProps = _ref3$optionProps === void 0 ? {} : _ref3$optionProps;
        var row = params.row,
            column = params.column;
        var _optionProps$label2 = optionProps.label,
            label = _optionProps$label2 === void 0 ? 'label' : _optionProps$label2,
            _optionProps$value2 = optionProps.value,
            value = _optionProps$value2 === void 0 ? 'value' : _optionProps$value2;

        var cellValue = _xeUtils["default"].get(row, column.property);

        var item = _xeUtils["default"].find(options, function (item) {
          return item[value] === cellValue;
        });

        return cellText(h, item ? item[label] : null);
      }
    },
    ElCascader: {
      renderEdit: defaultRender,
      renderCell: function renderCell(h, _ref4, params) {
        var _ref4$props = _ref4.props,
            props = _ref4$props === void 0 ? {} : _ref4$props;
        var row = params.row,
            column = params.column;

        var cellValue = _xeUtils["default"].get(row, column.property);

        var values = cellValue || [];
        var labels = [];
        matchCascaderData(0, props.options, values, labels);
        return cellText(h, (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" ".concat(props.separator || '/', " ")));
      }
    },
    ElDatePicker: {
      renderEdit: defaultRender,
      renderCell: function renderCell(h, _ref5, params) {
        var _ref5$props = _ref5.props,
            props = _ref5$props === void 0 ? {} : _ref5$props;
        var row = params.row,
            column = params.column;
        var rangeSeparator = props.rangeSeparator;

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
            cellValue = getFormatDates(cellValue, props, " ".concat(rangeSeparator || '-', " "), 'yyyy-MM-dd');
            break;

          case 'datetimerange':
            cellValue = getFormatDates(cellValue, props, " ".concat(rangeSeparator || '-', " "), 'yyyy-MM-dd HH:ss:mm');
            break;

          default:
            cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd');
        }

        return cellText(h, cellValue);
      }
    },
    ElTimePicker: {
      renderEdit: defaultRender
    },
    ElRate: {
      renderEdit: defaultRender
    },
    ElSwitch: {
      renderEdit: defaultRender
    }
  }
};
var _default = VXETablePluginElement;
exports["default"] = _default;