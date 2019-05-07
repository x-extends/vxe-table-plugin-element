(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "xe-utils"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils);
    global.index = mod.exports;
  }
})(this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

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

  var VXETablePluginElement = {
    renderMap: {
      ElInput: {
        autofocus: 'input.el-input__inner'
      },
      ElInputNumber: {
        autofocus: 'input.el-input__inner'
      },
      ElSelect: {
        render: function render(h, _ref, _ref2) {
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
        formatLabel: function formatLabel(cellValue, _ref3) {
          var options = _ref3.options,
              _ref3$optionProps = _ref3.optionProps,
              optionProps = _ref3$optionProps === void 0 ? {} : _ref3$optionProps;
          var _optionProps$label2 = optionProps.label,
              label = _optionProps$label2 === void 0 ? 'label' : _optionProps$label2,
              _optionProps$value2 = optionProps.value,
              value = _optionProps$value2 === void 0 ? 'value' : _optionProps$value2;

          var item = _xeUtils["default"].find(options, function (item) {
            return item[value] === cellValue;
          });

          return item ? item[label] : null;
        }
      },
      ElCascader: {
        formatLabel: function formatLabel(cellValue, _ref4) {
          var _ref4$props = _ref4.props,
              props = _ref4$props === void 0 ? {} : _ref4$props;
          var values = cellValue || [];
          var labels = [];
          matchCascaderData(0, props.options, values, labels);
          return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(" ".concat(props.separator || '/', " "));
        }
      },
      ElDatePicker: {
        formatLabel: function formatLabel(cellValue, _ref5) {
          var _ref5$props = _ref5.props,
              props = _ref5$props === void 0 ? {} : _ref5$props;
          var rangeSeparator = props.rangeSeparator;

          switch (props.type) {
            case 'week':
              return getFormatDate(cellValue, props, 'yyyywWW');

            case 'month':
              return getFormatDate(cellValue, props, 'yyyy-MM');

            case 'year':
              return getFormatDate(cellValue, props, 'yyyy');

            case 'dates':
              return getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd');

            case 'daterange':
              return getFormatDates(cellValue, props, " ".concat(rangeSeparator || '-', " "), 'yyyy-MM-dd');

            case 'datetimerange':
              return getFormatDates(cellValue, props, " ".concat(rangeSeparator || '-', " "), 'yyyy-MM-dd HH:ss:mm');
          }

          return getFormatDate(cellValue, props, 'yyyy-MM-dd');
        }
      },
      ElTimePicker: {},
      ElRate: {},
      ElSwitch: {}
    }
  };
  var _default = VXETablePluginElement;
  _exports["default"] = _default;
});