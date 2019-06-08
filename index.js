import XEUtils from 'xe-utils'

function getFormatDate (value, props, defaultFormat) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values, props, separator, defaultFormat) {
  return XEUtils.map(values, date => getFormatDate(date, props, defaultFormat)).join(separator)
}

function matchCascaderData (index, list, values, labels) {
  let val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, item => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getEvents (editRender, params) {
  let { name, events } = editRender
  let { $table } = params
  let type = 'change'
  switch (name) {
    case 'ElAutocomplete':
      type = 'select'
      break
    case 'ElInput':
    case 'ElInputNumber':
      type = 'input'
      break
  }
  let on = {
    [type]: () => $table.updateStatus(params)
  }
  if (events) {
    Object.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

function defaultRender (h, editRender, params) {
  let { $table, row, column } = params
  let { props } = editRender
  if ($table.size) {
    props = Object.assign({ size: $table.size }, props)
  }
  return [
    h(editRender.name, {
      props,
      model: {
        value: XEUtils.get(row, column.property),
        callback (value) {
          XEUtils.set(row, column.property, value)
        }
      },
      on: getEvents(editRender, params)
    })
  ]
}

function cellText (h, cellValue) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)]
}

const renderMap = {
  ElAutocomplete: {
    autofocus: 'input.el-input__inner',
    renderEdit: defaultRender
  },
  ElInput: {
    autofocus: 'input.el-input__inner',
    renderEdit: defaultRender
  },
  ElInputNumber: {
    autofocus: 'input.el-input__inner',
    renderEdit: defaultRender
  },
  ElSelect: {
    renderEdit (h, editRender, params) {
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = editRender
      let { $table, row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      if ($table.size) {
        props = XEUtils.assign({ size: $table.size }, props)
      }
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return [
          h('el-select', {
            props,
            model: {
              value: XEUtils.get(row, column.property),
              callback (cellValue) {
                XEUtils.set(row, column.property, cellValue)
              }
            },
            on: getEvents(editRender, params)
          }, XEUtils.map(optionGroups, (group, gIndex) => {
            return h('el-option-group', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, XEUtils.map(group[groupOptions], (item, index) => {
              return h('el-option', {
                props: {
                  value: item[valueProp],
                  label: item[labelProp]
                },
                key: index
              })
            }))
          }))
        ]
      }
      return [
        h('el-select', {
          props,
          model: {
            value: XEUtils.get(row, column.property),
            callback (cellValue) {
              XEUtils.set(row, column.property, cellValue)
            }
          },
          on: getEvents(editRender, params)
        }, XEUtils.map(options, (item, index) => {
          return h('el-option', {
            props: {
              value: item[valueProp],
              label: item[labelProp]
            },
            key: index
          })
        }))
      ]
    },
    renderCell (h, editRender, params) {
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = editRender
      let { row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      let groupOptions = optionGroupProps.options || 'options'
      let cellValue = XEUtils.get(row, column.property)
      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? value => {
          let selectItem
          for (let index = 0; index < optionGroups.length; index++) {
            selectItem = XEUtils.find(optionGroups[index][groupOptions], item => item[valueProp] === value)
            if (selectItem) {
              break
            }
          }
          return selectItem ? selectItem[labelProp] : null
        } : value => {
          let selectItem = XEUtils.find(options, item => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';'))
      }
      return cellText(h, '')
    }
  },
  ElCascader: {
    renderEdit: defaultRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let cellValue = XEUtils.get(row, column.property)
      var values = cellValue || []
      var labels = []
      matchCascaderData(0, props.options, values, labels)
      return cellText(h, (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `))
    }
  },
  ElDatePicker: {
    renderEdit: defaultRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let { rangeSeparator = '-' } = props
      let cellValue = XEUtils.get(row, column.property)
      switch (props.type) {
        case 'week':
          cellValue = getFormatDate(cellValue, props, 'yyyywWW')
          break
        case 'month':
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM')
          break
        case 'year':
          cellValue = getFormatDate(cellValue, props, 'yyyy')
          break
        case 'dates':
          cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd')
          break
        case 'daterange':
          cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM-dd')
          break
        case 'datetimerange':
          cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM-dd HH:ss:mm')
          break
        default:
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
      }
      return cellText(h, cellValue)
    }
  },
  ElTimePicker: {
    renderEdit: defaultRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let { isRange, format = 'hh:mm:ss', rangeSeparator = '-' } = props
      let cellValue = XEUtils.get(row, column.property)
      if (cellValue && isRange) {
        cellValue = cellValue.map(date => XEUtils.toDateString(date, format)).join(` ${rangeSeparator} `)
      }
      return XEUtils.toDateString(cellValue, format)
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
}

function hasClass (elem, cls) {
  return elem && elem.className && elem.className.split && elem.className.split(' ').indexOf(cls) > -1
}

function getEventTargetNode (evnt, container, queryCls) {
  let targetElem
  let target = evnt.target
  while (target && target.nodeType && target !== document) {
    if (queryCls && hasClass(target, queryCls)) {
      targetElem = target
    } else if (target === container) {
      return { flag: queryCls ? !!targetElem : true, container, targetElem: targetElem }
    }
    target = target.parentNode
  }
  return { flag: false }
}

/**
 * 事件兼容性处理
 */
function handleClearActivedEvent (params, evnt) {
  if (
    // 远程搜索
    getEventTargetNode(evnt, document.body, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode(evnt, document.body, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode(evnt, document.body, 'el-cascader__dropdown').flag ||
    getEventTargetNode(evnt, document.body, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode(evnt, document.body, 'el-picker-panel').flag
  ) {
    return false
  }
}

function VXETablePluginElement () {}

VXETablePluginElement.install = function ({ interceptor, renderer }) {
  // 添加到渲染器
  renderer.mixin(renderMap)
  // 处理事件冲突
  interceptor.add('event.clear_actived', handleClearActivedEvent)
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement)
}

export default VXETablePluginElement
