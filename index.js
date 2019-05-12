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

function defaultRender (h, editRender, params) {
  let { $table, row, column } = params
  let { props, events } = editRender
  if ($table.size) {
    props = Object.assign({ size: $table.size }, props)
  }
  let on = { }
  if (events) {
    Object.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
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
      on
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
      renderEdit (h, { options, props = {}, optionProps = {} }, { $table, row, column }) {
        let { label = 'label', value = 'value' } = optionProps
        if ($table.size) {
          props = XEUtils.assign({ size: $table.size }, props)
        }
        return [
          h('el-select', {
            props,
            model: {
              value: XEUtils.get(row, column.property),
              callback (value) {
                XEUtils.set(row, column.property, value)
              }
            }
          }, XEUtils.map(options, function (item, index) {
            return h('el-option', {
              props: {
                value: item[value],
                label: item[label]
              },
              key: index
            })
          }))
        ]
      },
      renderCell (h, { options, optionProps = {} }, params) {
        let { row, column } = params
        let { label = 'label', value = 'value' } = optionProps
        let cellValue = XEUtils.get(row, column.property)
        var item = XEUtils.find(options, function (item) {
          return item[value] === cellValue
        })
        return cellText(h, item ? item[label] : null)
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
