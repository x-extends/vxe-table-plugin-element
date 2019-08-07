# vxe-table-plugin-element

[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-element.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-element)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-element.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-element)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-element/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-element/dist/index.min.js)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-element/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](https://unpkg.com/vxe-table-plugin-element/dist/style.min.css)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-element/blob/master/LICENSE)

该插件用于在 vxe-table 表格中适配 element-ui 组件的渲染

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-element
```

```javascript
import Vue from 'vue'
import VXETable from 'vxe-table'
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'

Vue.use(VXETable)
VXETable.use(VXETablePluginElement)
```

## API

### edit-render 单元格渲染配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElAutocomplete, ElInputNumber, ElSelect, ElCascader, ElTimeSelect, ElTimePicker, ElDatePicker, ElSwitch, ElRate, ElColorPicker, ElSlider | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

### filter-render 筛选渲染配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | ElInput, ElInputNumber, ElAutocomplete, ElDatePicker, ElSelect | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

## Cell demo

默认直接使用 class=vxe-table-element 既可，当然你也可以不引入默认样式，自行实现样式也是可以的。

```html
<vxe-table
  border
  class="vxe-table-element"
  height="600"
  :data.sync="tableData"
  :edit-config="{key: 'id', trigger: 'click', mode: 'cell'}">
  <vxe-table-column type="selection" width="60" fixed="left"></vxe-table-column>
  <vxe-table-column type="index" width="60" fixed="left"></vxe-table-column>
  <vxe-table-column prop="name" label="ElInput" min-width="140" :edit-render="{name: 'ElInput'}"></vxe-table-column>
  <vxe-table-column prop="age" label="ElInputNumber" width="160" :edit-render="{name: 'ElInputNumber', props: {max: 35, min: 18}}"></vxe-table-column>
  <vxe-table-column prop="sex" label="ElSelect" width="140" :edit-render="{name: 'ElSelect', options: sexList}"></vxe-table-column>
  <vxe-table-column prop="region" label="ElCascader" width="200" :edit-render="{name: 'ElCascader', props: {options: regionList}}"></vxe-table-column>
  <vxe-table-column prop="date" label="ElDatePicker" width="200" :edit-render="{name: 'ElDatePicker', props: {type: 'date', format: 'yyyy/MM/dd'}}"></vxe-table-column>
  <vxe-table-column prop="date1" label="DateTimePicker" width="220" :edit-render="{name: 'ElDatePicker', props: {type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss'}}"></vxe-table-column>
  <vxe-table-column prop="date2" label="ElTimeSelect" width="200" :edit-render="{name: 'ElTimeSelect', props: {pickerOptions: {start: '08:30', step: '00:15', end: '18:30'}}}"></vxe-table-column>
  <vxe-table-column prop="rate" label="ElRate" width="200" :edit-render="{name: 'ElRate', type: 'visible'}"></vxe-table-column>
  <vxe-table-column prop="flag" label="ElSwitch" width="100" fixed="right" :edit-render="{name: 'ElSwitch', type: 'visible'}"></vxe-table-column>
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
  :data.sync="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column prop="name" label="Name"></vxe-table-column>
  <vxe-table-column prop="age" label="Age"></vxe-table-column>
  <vxe-table-column prop="date" label="Date" :filters="[{data: []}]" :filter-render="{name: 'ElDatePicker', props: {type: 'daterange'}}"></vxe-table-column>
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

Copyright (c) 2019-present, Xu Liangzhan
