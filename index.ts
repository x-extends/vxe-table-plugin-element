import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'

function isEmptyValue (cellValue: any) {
  return cellValue === null || cellValue === undefined || cellValue === ''
}

function parseDate (value: any, props: any): any {
  return value && props.valueFormat ? XEUtils.toStringDate(value, props.valueFormat) : value
}

function getFormatDate (value: any, props: any, defaultFormat: string): string {
  return XEUtils.toDateString(parseDate(value, props), props.format || defaultFormat)
}

function getFormatDates (values: any, props: any, separator: string, defaultFormat: string): string {
  return XEUtils.map(values, (date: any) => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange (cellValue: any, data: any, props: any, defaultFormat: string): boolean {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function matchCascaderData (index: number, list: any[], values: any[], labels: any[]) {
  let val: any = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, (item: any) => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getProps ({ $table }: any, { props }: any, defaultProps?: any) {
  return XEUtils.assign($table.vSize ? { size: $table.vSize } : {}, defaultProps, props)
}

function getCellEvents (renderOpts: any, params: any) {
  let { name, events }: any = renderOpts
  let { $table }: any = params
  let type: string = 'change'
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
    [type]: (evnt: any) => {
      $table.updateStatus(params)
      if (events && events[type]) {
        events[type](params, evnt)
      }
    }
  }
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function getSelectCellValue (renderOpts: any, params: any) {
  let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} }: any = renderOpts
  let { $table, row, column }: any = params
  let labelProp: string = optionProps.label || 'label'
  let valueProp: string = optionProps.value || 'value'
  let groupOptions: string = optionGroupProps.options || 'options'
  let cellValue: any = XEUtils.get(row, column.property)
  let colid: string = column.id
  let rest: any
  let cellData: any
  if (props.filterable) {
    let fullAllDataRowMap: Map<any, any> = $table.fullAllDataRowMap
    let cacheCell: any = fullAllDataRowMap.has(row)
    if (cacheCell) {
      rest = fullAllDataRowMap.get(row)
      cellData = rest.cellData
      if (!cellData) {
        cellData = fullAllDataRowMap.get(row).cellData = {}
      }
    }
    if (rest && cellData[colid] && cellData[colid].value === cellValue) {
      return cellData[colid].label
    }
  }
  if (!isEmptyValue(cellValue)) {
    return XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? (value: any) => {
      let selectItem: any
      for (let index = 0; index < optionGroups.length; index++) {
        selectItem = XEUtils.find(optionGroups[index][groupOptions], (item: any) => item[valueProp] === value)
        if (selectItem) {
          break
        }
      }
      let cellLabel: any = selectItem ? selectItem[labelProp] : value
      if (cellData && options && options.length) {
        cellData[colid] = { value: cellValue, label: cellLabel }
      }
      return cellLabel
    } : (value: any) => {
      let selectItem: any = XEUtils.find(options, (item: any) => item[valueProp] === value)
      let cellLabel: any = selectItem ? selectItem[labelProp] : value
      if (cellData && options && options.length) {
        cellData[colid] = { value: cellValue, label: cellLabel }
      }
      return cellLabel
    }).join(', ')
  }
  return null
}

function getCascaderCellValue (renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { row, column }: any = params
  let cellValue: any = XEUtils.get(row, column.property)
  var values: any[] = cellValue || []
  var labels: any[] = []
  matchCascaderData(0, props.options, values, labels)
  return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `)
}

function getDatePickerCellValue (renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { row, column }: any = params
  let { rangeSeparator = '-' }: any = props
  let cellValue: any = XEUtils.get(row, column.property)
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
    case 'monthrange':
      cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator} `, 'yyyy-MM')
      break
    default:
      cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
  }
  return cellValue
}

function getTimePickerCellValue (renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { row, column }: any = params
  let { isRange, format = 'hh:mm:ss', rangeSeparator = '-' }: any = props
  let cellValue: any = XEUtils.get(row, column.property)
  if (cellValue && isRange) {
    cellValue = XEUtils.map(cellValue, (date: any) => XEUtils.toDateString(parseDate(date, props), format)).join(` ${rangeSeparator} `)
  }
  return XEUtils.toDateString(parseDate(cellValue, props), format)
}

function createEditRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any) {
    let { row, column }: any = params
    let { attrs }: any = renderOpts
    let props: any = getProps(params, renderOpts, defaultProps)
    return [
      h(renderOpts.name, {
        props,
        attrs,
        model: {
          value: XEUtils.get(row, column.property),
          callback (value: any) {
            XEUtils.set(row, column.property, value)
          }
        },
        on: getCellEvents(renderOpts, params)
      })
    ]
  }
}

function defaultButtonEditRender (h: Function, renderOpts: any, params: any) {
  const { attrs } = renderOpts
  const props: any = getProps(params, renderOpts)
  return [
    h('el-button', {
      attrs,
      props,
      on: getCellEvents(renderOpts, params)
    }, cellText(h, renderOpts.content))
  ]
}

function defaultButtonsEditRender (h: Function, renderOpts: any, params: any) {
  return renderOpts.children.map((childRenderOpts: any) => defaultButtonEditRender(h, childRenderOpts, params)[0])
}

function getFilterEvents (on: any, renderOpts: any, params: any) {
  const { events }: any = renderOpts
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat(args))
    }), on)
  }
  return on
}

function createFilterRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any) {
    let { column }: any = params
    let { name, attrs, events }: any = renderOpts
    let props: any = getProps(params, renderOpts)
    let type: string = 'change'
    switch (name) {
      case 'ElAutocomplete':
        type = 'select'
        break
      case 'ElInput':
      case 'ElInputNumber':
        type = 'input'
        break
    }
    return column.filters.map((item: any) => {
      return h(name, {
        props,
        attrs,
        model: {
          value: item.data,
          callback (optionValue: any) {
            item.data = optionValue
          }
        },
        on: getFilterEvents({
          [type] (evnt: any) {
            handleConfirmFilter(params, column, !!item.data, item)
            if (events && events[type]) {
              events[type](params, evnt)
            }
          }
        }, renderOpts, params)
      })
    })
  }
}

function handleConfirmFilter (params: any, column: any, checked: any, item: any) {
  const $panel = params.$panel || params.context
  $panel[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item)
}

function defaultFilterMethod ({ option, row, column }: any) {
  let { data }: any = option
  let cellValue: string = XEUtils.get(row, column.property)
  /* eslint-disable eqeqeq */
  return cellValue == data
}

function renderOptions (h: Function, options: any, optionProps: any) {
  let labelProp: string = optionProps.label || 'label'
  let valueProp: string = optionProps.value || 'value'
  let disabledProp: string = optionProps.disabled || 'disabled'
  return XEUtils.map(options, (item: any, index: number) => {
    return h('el-option', {
      props: {
        value: item[valueProp],
        label: item[labelProp],
        disabled: item[disabledProp]
      },
      key: index
    })
  })
}

function cellText (h: Function, cellValue: any) {
  return ['' + (isEmptyValue(cellValue) ? '' : cellValue)]
}

function createFormItemRender (defaultProps?: any) {
  return function (h: Function, renderOpts: any, params: any) {
    let { data, property } = params
    let { name } = renderOpts
    let { attrs }: any = renderOpts
    let props: any = getFormItemProps(params, renderOpts, defaultProps)
    return [
      h(name, {
        attrs,
        props,
        model: {
          value: XEUtils.get(data, property),
          callback (value: any) {
            XEUtils.set(data, property, value)
          }
        },
        on: getFormEvents(renderOpts, params)
      })
    ]
  }
}

function defaultButtonItemRender (h: Function, renderOpts: any, params: any) {
  const { attrs } = renderOpts
  const props: any = getFormItemProps(params, renderOpts)
  return [
    h('el-button', {
      attrs,
      props,
      on: getFormEvents(renderOpts, params)
    }, cellText(h, renderOpts.content || props.content))
  ]
}

function defaultButtonsItemRender (h: Function, renderOpts: any, params: any) {
  return renderOpts.children.map((childRenderOpts: any) => defaultButtonItemRender(h, childRenderOpts, params)[0])
}

function getFormItemProps ({ $form }: any, { props }: any, defaultProps?: any) {
  return XEUtils.assign($form.vSize ? { size: $form.vSize } : {}, defaultProps, props)
}

function getFormEvents (renderOpts: any, params: any) {
  let { events }: any = renderOpts
  let { $form }: any = params
  let type: string = 'change'
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
    [type]: (evnt: any) => {
      $form.updateStatus(params)
      if (events && events[type]) {
        events[type](params, evnt)
      }
    }
  }
  if (events) {
    return XEUtils.assign({}, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
    }), on)
  }
  return on
}

function createExportMethod (valueMethod: Function, isEdit?: boolean) {
  const renderProperty = isEdit ? 'editRender' : 'cellRender'
  return function (params: any) {
    return valueMethod(params.column[renderProperty], params)
  }
}

function createFormItemRadioAndCheckboxRender () {
  return function (h: Function, renderOpts: any, params: any) {
    let { name, options, optionProps = {} } = renderOpts
    let { data, property } = params
    let { attrs } = renderOpts
    let props: any = getFormItemProps(params, renderOpts)
    let labelProp: string = optionProps.label || 'label'
    let valueProp: string = optionProps.value || 'value'
    let disabledProp: string = optionProps.disabled || 'disabled'
    return [
      h(`${name}Group`, {
        props,
        attrs,
        model: {
          value: XEUtils.get(data, property),
          callback (cellValue: any) {
            XEUtils.set(data, property, cellValue)
          }
        },
        on: getFormEvents(renderOpts, params)
      }, options.map((option: any) => {
        return h(name, {
          props: {
            label: option[valueProp],
            disabled: option[disabledProp]
          }
        }, option[labelProp])
      }))
    ]
  }
}

/**
 * 渲染函数
 */
const renderMap = {
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
    renderEdit (h: Function, renderOpts: any, params: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { row, column } = params
      let { attrs } = renderOpts
      let props: any = getProps(params, renderOpts)
      if (optionGroups) {
        let groupOptions: string = optionGroupProps.options || 'options'
        let groupLabel: string = optionGroupProps.label || 'label'
        return [
          h('el-select', {
            props,
            attrs,
            model: {
              value: XEUtils.get(row, column.property),
              callback (cellValue: any) {
                XEUtils.set(row, column.property, cellValue)
              }
            },
            on: getCellEvents(renderOpts, params)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('el-option-group', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        ]
      }
      return [
        h('el-select', {
          props,
          attrs,
          model: {
            value: XEUtils.get(row, column.property),
            callback (cellValue: any) {
              XEUtils.set(row, column.property, cellValue)
            }
          },
          on: getCellEvents(renderOpts, params)
        }, renderOptions(h, options, optionProps))
      ]
    },
    renderCell (h: Function, renderOpts: any, params: any) {
      return cellText(h, getSelectCellValue(renderOpts, params))
    },
    renderFilter (h: Function, renderOpts: any, params: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { column } = params
      let { attrs, events } = renderOpts
      let props = getProps(params, renderOpts)
      let type = 'change'
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return column.filters.map((item: any) => {
          return h('el-select', {
            props,
            attrs,
            model: {
              value: item.data,
              callback (optionValue: any) {
                item.data = optionValue
              }
            },
            on: getFilterEvents({
              [type] (value: any) {
                handleConfirmFilter(params, column, value && value.length > 0, item)
                if (events && events[type]) {
                  events[type](params, value)
                }
              }
            }, renderOpts, params)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('el-option-group', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        })
      }
      return column.filters.map((item: any) => {
        return h('el-select', {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue: any) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            change (value: any) {
              handleConfirmFilter(params, column, value && value.length > 0, item)
              if (events && events[type]) {
                events[type](params, value)
              }
            }
          }, renderOpts, params)
        }, renderOptions(h, options, optionProps))
      })
    },
    filterMethod ({ option, row, column }: any) {
      let { data }: any = option
      let { property, filterRender: renderOpts }: any = column
      let { props = {} }: any = renderOpts
      let cellValue: any = XEUtils.get(row, property)
      if (props.multiple) {
        if (XEUtils.isArray(cellValue)) {
          return XEUtils.includeArrays(cellValue, data)
        }
        return data.indexOf(cellValue) > -1
      }
      /* eslint-disable eqeqeq */
      return cellValue == data
    },
    renderItem (h: Function, renderOpts: any, params: any) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = renderOpts
      let { data, property } = params
      let { attrs } = renderOpts
      let props: any = getFormItemProps(params, renderOpts)
      if (optionGroups) {
        let groupOptions: string = optionGroupProps.options || 'options'
        let groupLabel: string = optionGroupProps.label || 'label'
        return [
          h('el-select', {
            props,
            attrs,
            model: {
              value: XEUtils.get(data, property),
              callback (cellValue: any) {
                XEUtils.set(data, property, cellValue)
              }
            },
            on: getFormEvents(renderOpts, params)
          }, XEUtils.map(optionGroups, (group: any, gIndex: number) => {
            return h('el-option-group', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        ]
      }
      return [
        h('el-select', {
          props,
          attrs,
          model: {
            value: XEUtils.get(data, property),
            callback (cellValue: any) {
              XEUtils.set(data, property, cellValue)
            }
          },
          on: getFormEvents(renderOpts, params)
        }, renderOptions(h, options, optionProps))
      ]
    },
    cellExportMethod: createExportMethod(getSelectCellValue),
    editCellExportMethod: createExportMethod(getSelectCellValue, true)
  },
  ElCascader: {
    renderEdit: createEditRender(),
    renderCell (h: Function, renderOpts: any, params: any) {
      return cellText(h, getCascaderCellValue(renderOpts, params))
    },
    renderItem: createFormItemRender(),
    cellExportMethod: createExportMethod(getCascaderCellValue),
    editCellExportMethod: createExportMethod(getCascaderCellValue, true)
  },
  ElDatePicker: {
    renderEdit: createEditRender(),
    renderCell (h: Function, renderOpts: any, params: any) {
      return cellText(h, getDatePickerCellValue(renderOpts, params))
    },
    renderFilter (h: Function, renderOpts: any, params: any) {
      let { column }: any = params
      let { attrs, events }: any = renderOpts
      let props: any = getProps(params, renderOpts)
      let type: string = 'change'
      return column.filters.map((item: any) => {
        return h(renderOpts.name, {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue: any) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            [type] (value: any) {
              handleConfirmFilter(params, column, !!value, item)
              if (events && events[type]) {
                events[type](params, value)
              }
            }
          }, renderOpts, params)
        })
      })
    },
    filterMethod ({ option, row, column }: any) {
      let { data }: any = option
      let { filterRender: renderOpts }: any = column
      let { props = {} }: any = renderOpts
      let cellValue: any = XEUtils.get(row, column.property)
      if (data) {
        switch (props.type) {
          case 'daterange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd')
          case 'datetimerange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm')
          case 'monthrange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM')
          default:
            return cellValue === data
        }
      }
      return false
    },
    renderItem: createFormItemRender(),
    cellExportMethod: createExportMethod(getDatePickerCellValue),
    editCellExportMethod: createExportMethod(getDatePickerCellValue, true)
  },
  ElTimePicker: {
    renderEdit: createEditRender(),
    renderCell (h: Function, renderOpts: any, params: any) {
      return getTimePickerCellValue(renderOpts, params)
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
}

/**
 * 事件兼容性处理
 */
function handleClearEvent (params: any, evnt: any, context:any) {
  const { $table } = params
  const getEventTargetNode = $table ? $table.getEventTargetNode : context.getEventTargetNode
  const bodyElem: HTMLElement = document.body
  if (
    // 远程搜索
    getEventTargetNode(evnt, bodyElem, 'el-autocomplete-suggestion').flag ||
    // 下拉框
    getEventTargetNode(evnt, bodyElem, 'el-select-dropdown').flag ||
    // 级联
    getEventTargetNode(evnt, bodyElem, 'el-cascader__dropdown').flag ||
    getEventTargetNode(evnt, bodyElem, 'el-cascader-menus').flag ||
    // 日期
    getEventTargetNode(evnt, bodyElem, 'el-time-panel').flag ||
    getEventTargetNode(evnt, bodyElem, 'el-picker-panel').flag ||
    // 颜色
    getEventTargetNode(evnt, bodyElem, 'el-color-dropdown').flag
  ) {
    return false
  }
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */
export const VXETablePluginElement = {
  install (xtable: typeof VXETable) {
    let { interceptor, renderer } = xtable
    renderer.mixin(renderMap)
    interceptor.add('event.clearFilter', handleClearEvent)
    interceptor.add('event.clearActived', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginElement)
}

export default VXETablePluginElement
