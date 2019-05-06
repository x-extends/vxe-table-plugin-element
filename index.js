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

const VXETablePluginElement = {
  renderMap: {
    ElInput: {
      autofocus: 'input.el-input__inner'
    },
    ElInputNumber: {
      autofocus: 'input.el-input__inner'
    },
    ElSelect: {
      render (h, { options, props = {}, optionProps = {} }, { $table, row, column }) {
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
      formatLabel (cellValue, { options, optionProps = {} }) {
        let { label = 'label', value = 'value' } = optionProps
        var item = XEUtils.find(options, function (item) {
          return item[value] === cellValue
        })
        return item ? item[label] : null
      }
    },
    ElCascader: {
      formatLabel (cellValue, { props = {} }) {
        var values = cellValue || []
        var labels = []
        matchCascaderData(0, props.options, values, labels)
        return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `)
      }
    },
    ElDatePicker: {
      formatLabel (cellValue, { props = {} }) {
        let { rangeSeparator } = props
        switch (props.type) {
          case 'week':
            return getFormatDate(cellValue, props, 'yyyywWW')
          case 'month':
            return getFormatDate(cellValue, props, 'yyyy-MM')
          case 'year':
            return getFormatDate(cellValue, props, 'yyyy')
          case 'dates':
            return getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd')
          case 'daterange':
            return getFormatDates(cellValue, props, ` ${rangeSeparator || '-'} `, 'yyyy-MM-dd')
          case 'datetimerange':
            return getFormatDates(cellValue, props, ` ${rangeSeparator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
        }
        return getFormatDate(cellValue, props, 'yyyy-MM-dd')
      }
    },
    ElTimePicker: {},
    ElRate: {},
    ElSwitch: {}
  }
}

export default VXETablePluginElement
