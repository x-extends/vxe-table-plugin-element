"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

function getEvents(editRender, params) {
  var name = editRender.name,
      events = editRender.events;
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

  var on = _defineProperty({}, type, function () {
    return $table.updateStatus(params);
  });

  if (events) {
    Object.assign(on, _xeUtils["default"].objectMap(events, function (cb) {
      return function () {
        cb.apply(null, [params].concat.apply(params, arguments));
      };
    }));
  }

  return on;
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
    },
    on: getEvents(editRender, params)
  })];
}

function cellText(h, cellValue) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)];
}

var renderMap = {
  ElInput: {
    autofocus: 'input.el-input__inner',
    renderEdit: defaultRender
  },
  ElInputNumber: {
    autofocus: 'input.el-input__inner',
    renderEdit: defaultRender
  },
  ElSelect: {
    renderEdit: function renderEdit(h, editRender, params) {
      var options = editRender.options,
          optionGroups = editRender.optionGroups,
          _editRender$props = editRender.props,
          props = _editRender$props === void 0 ? {} : _editRender$props,
          _editRender$optionPro = editRender.optionProps,
          optionProps = _editRender$optionPro === void 0 ? {} : _editRender$optionPro,
          _editRender$optionGro = editRender.optionGroupProps,
          optionGroupProps = _editRender$optionGro === void 0 ? {} : _editRender$optionGro;
      var $table = params.$table,
          row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';

      if ($table.size) {
        props = _xeUtils["default"].assign({
          size: $table.size
        }, props);
      }

      if (optionGroups) {
        var groupOptions = optionGroupProps.options || 'options';
        var groupLabel = optionGroupProps.label || 'label';
        return [h('el-select', {
          props: props,
          model: {
            value: _xeUtils["default"].get(row, column.property),
            callback: function callback(cellValue) {
              _xeUtils["default"].set(row, column.property, cellValue);
            }
          },
          on: getEvents(editRender, params)
        }, _xeUtils["default"].map(optionGroups, function (group, gIndex) {
          return h('el-option-group', {
            props: {
              label: group[groupLabel]
            },
            key: gIndex
          }, _xeUtils["default"].map(group[groupOptions], function (item, index) {
            return h('el-option', {
              props: {
                value: item[valueProp],
                label: item[labelProp]
              },
              key: index
            });
          }));
        }))];
      }

      return [h('el-select', {
        props: props,
        model: {
          value: _xeUtils["default"].get(row, column.property),
          callback: function callback(cellValue) {
            _xeUtils["default"].set(row, column.property, cellValue);
          }
        },
        on: getEvents(editRender, params)
      }, _xeUtils["default"].map(options, function (item, index) {
        return h('el-option', {
          props: {
            value: item[valueProp],
            label: item[labelProp]
          },
          key: index
        });
      }))];
    },
    renderCell: function renderCell(h, editRender, params) {
      var options = editRender.options,
          optionGroups = editRender.optionGroups,
          _editRender$props2 = editRender.props,
          props = _editRender$props2 === void 0 ? {} : _editRender$props2,
          _editRender$optionPro2 = editRender.optionProps,
          optionProps = _editRender$optionPro2 === void 0 ? {} : _editRender$optionPro2,
          _editRender$optionGro2 = editRender.optionGroupProps,
          optionGroupProps = _editRender$optionGro2 === void 0 ? {} : _editRender$optionGro2;
      var row = params.row,
          column = params.column;
      var labelProp = optionProps.label || 'label';
      var valueProp = optionProps.value || 'value';
      var groupOptions = optionGroupProps.options || 'options';

      var cellValue = _xeUtils["default"].get(row, column.property);

      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, _xeUtils["default"].map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
          var selectItem;

          for (var index = 0; index < optionGroups.length; index++) {
            selectItem = _xeUtils["default"].find(optionGroups[index][groupOptions], function (item) {
              return item[valueProp] === value;
            });

            if (selectItem) {
              break;
            }
          }

          return selectItem ? selectItem[labelProp] : null;
        } : function (value) {
          var selectItem = _xeUtils["default"].find(options, function (item) {
            return item[valueProp] === value;
          });

          return selectItem ? selectItem[labelProp] : null;
        }).join(';'));
      }

      return cellText(h, '');
    }
  },
  ElCascader: {
    renderEdit: defaultRender,
    renderCell: function renderCell(h, _ref, params) {
      var _ref$props = _ref.props,
          props = _ref$props === void 0 ? {} : _ref$props;
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
    renderCell: function renderCell(h, _ref2, params) {
      var _ref2$props = _ref2.props,
          props = _ref2$props === void 0 ? {} : _ref2$props;
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

        default:
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd');
      }

      return cellText(h, cellValue);
    }
  },
  ElTimePicker: {
    renderEdit: defaultRender,
    renderCell: function renderCell(h, _ref3, params) {
      var _ref3$props = _ref3.props,
          props = _ref3$props === void 0 ? {} : _ref3$props;
      var row = params.row,
          column = params.column;
      var isRange = props.isRange,
          _props$format = props.format,
          format = _props$format === void 0 ? 'hh:mm:ss' : _props$format,
          _props$rangeSeparator2 = props.rangeSeparator,
          rangeSeparator = _props$rangeSeparator2 === void 0 ? '-' : _props$rangeSeparator2;

      var cellValue = _xeUtils["default"].get(row, column.property);

      if (isRange) {
        return cellValue ? cellValue.map(function (date) {
          return _xeUtils["default"].toDateString(date, format);
        }).join(" ".concat(rangeSeparator, " ")) : '';
      }

      return _xeUtils["default"].toDateString(cellValue, format);
    }
  },
  ElTimeSelect: {
    renderEdit: defaultRender
  },
  ElRate: {
    renderEdit: defaultRender
  },
  ElSwitch: {
    renderEdit: defaultRender
  }
};

function hasClass(elem, cls) {
  return elem && elem.className && elem.className.split && elem.className.split(' ').indexOf(cls) > -1;
}
/**
 * 检查触发源是否属于目标节点
 */


function getEventTargetNode(evnt, container, queryCls) {
  var targetElem;
  var target = evnt.target;

  while (target && target.nodeType && target !== document) {
    if (queryCls && hasClass(target, queryCls)) {
      targetElem = target;
    } else if (target === container) {
      return {
        flag: queryCls ? !!targetElem : true,
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

function clearActivedEvent(params, evnt) {
  if ( // 下拉框
  getEventTargetNode(evnt, document.body, 'el-select-dropdown').flag || // 级联
  getEventTargetNode(evnt, document.body, 'el-cascader-menus').flag || // 日期
  getEventTargetNode(evnt, document.body, 'el-picker-panel').flag) {
    return false;
  }
}

function VXETablePluginElement() {}

VXETablePluginElement.install = function (GlobalConfig, EventInterceptor, options) {
  Object.assign(GlobalConfig.renderMap, renderMap);

  if (EventInterceptor.clearActiveds.indexOf(clearActivedEvent) === -1) {
    EventInterceptor.clearActiveds.push(clearActivedEvent);
  }
};

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement);
}

var _default = VXETablePluginElement;
exports["default"] = _default;