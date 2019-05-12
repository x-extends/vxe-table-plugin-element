import XEUtils from 'xe-utils'

function getFormatDate (value, props, defaultFormat) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values, props, separator, defaultFormat) {
  return XEUtils.map(values, function (date) {
    return getFormatDate(date, props, defaultFormat)
  }).join(separator)
}

function matchCascaderData (index, list, values, labels) {
  let val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, function (item) {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getEvents (editRender, params) {
  let { events } = editRender
  let on = { }
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
  return [
    h('span', '' + (cellValue === null || cellValue === void 0 ? '' : cellValue))
  ]
}

const VXETablePluginElement = {
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
            }, XEUtils.map(optionGroups, function (group, gIndex) {
              return h('el-option-group', {
                props: {
                  label: group[groupLabel]
                },
                key: gIndex
              }, XEUtils.map(group[groupOptions], function (item, index) {
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
          }, XEUtils.map(options, function (item, index) {
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
        let { rangeSeparator } = props
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
            cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator || '-'} `, 'yyyy-MM-dd')
            break
          case 'datetimerange':
            cellValue = getFormatDates(cellValue, props, ` ${rangeSeparator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
            break
          default:
            cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
        }
        return cellText(h, cellValue)
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
}

export default VXETablePluginElement
