# vxe-table-plugin-element

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-element/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-element/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-element.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-element)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-element.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-element)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-element/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-element/dist/index.min.js)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-element/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](https://unpkg.com/vxe-table-plugin-element/dist/style.min.css)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://www.npmjs.com/package/vxe-table) 表格的适配插件，用于兼容 [element-ui](https://www.npmjs.com/package/element-ui) 组件库

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-element element-ui
```

```javascript
// ...
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'
// ...

VXETable.use(VXETablePluginElement)
```

## API

### cell-render 默认的渲染配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElAutocomplete, ElInputNumber, ElSwitch, ElRate, ElSlider, ElButton, ElButtons | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### edit-render 可编辑渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElAutocomplete, ElInputNumber, ElSelect, ElCascader, ElTimeSelect, ElTimePicker, ElDatePicker, ElSwitch, ElRate, ElSlider, ElButton, ElButtons | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### filter-render 筛选渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElInputNumber, ElAutocomplete, ElSelect, ElDatePicker, ElSwitch, ElRate, ElSlider | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

### item-render 表单-项渲染器配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElInputNumber, ElAutocomplete, ElSelect, ElDatePicker, ElSwitch, ElRate, ElSlider, ElRadio, ElCheckbox, ElButton, ElButtons | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label', disabled: 'disabled' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |
| nativeEvents | 渲染组件附加事件，参数为 ( {}, ...Component arguments ) | Object | — | — |

## Cell demo

```html
<vxe-table
  height="600"
  :data="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-table-column type="selection" width="60"></vxe-table-column>
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="ElInput" min-width="140" :edit-render="{name: 'ElInput'}"></vxe-table-column>
  <vxe-table-column field="age" title="ElInputNumber" width="160" :edit-render="{name: 'ElInputNumber', props: {max: 35, min: 18}}"></vxe-table-column>
  <vxe-table-column field="sex" title="ElSelect" width="140" :edit-render="{name: 'ElSelect', options: sexList}"></vxe-table-column>
  <vxe-table-column field="region" title="ElCascader" width="200" :edit-render="{name: 'ElCascader', props: {options: regionList}}"></vxe-table-column>
  <vxe-table-column field="date" title="ElDatePicker" width="200" :edit-render="{name: 'ElDatePicker', props: {type: 'date', format: 'yyyy/MM/dd'}}"></vxe-table-column>
  <vxe-table-column field="date1" title="DateTimePicker" width="220" :edit-render="{name: 'ElDatePicker', props: {type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss'}}"></vxe-table-column>
  <vxe-table-column field="date2" title="ElTimeSelect" width="200" :edit-render="{name: 'ElTimeSelect', props: {pickerOptions: {start: '08:30', step: '00:15', end: '18:30'}}}"></vxe-table-column>
  <vxe-table-column field="rate" title="ElRate" width="200" :edit-render="{name: 'ElRate', type: 'visible'}"></vxe-table-column>
  <vxe-table-column field="flag" title="ElSwitch" width="100" :edit-render="{name: 'ElSwitch', type: 'visible'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          sex: '1',
          region: ['shenzhen'],
          date: null,
          date1: null,
          date2: null,
          rate: 2,
          flag: true
        }
      ],
      sexList: [
        {
          'label': '男',
          'value': '1'
        },
        {
          'label': '女',
          'value': '0'
        }
      ],
      regionList: [
        {
          'label': '深圳',
          'value': 'shenzhen'
        },
        {
          'label': '广州',
          'value': 'guangzhou'
        }
      ]
    }
  }
}
```

## Filter demo

```html
<vxe-table
  border
  height="600"
  :data="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="Name"></vxe-table-column>
  <vxe-table-column field="age" title="Age"></vxe-table-column>
  <vxe-table-column field="date" title="Date" :filters="[{data: []}]" :filter-render="{name: 'ElDatePicker', props: {type: 'daterange'}}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          date: null
        }
      ]
    }
  }
}
```

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
