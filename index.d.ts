import VXETable from 'vxe-table'

export interface VXETablePluginStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * 基于 vxe-table 表格的适配插件，用于兼容 element-ui 组件库
 */
declare var VXETablePluginElement: VXETablePluginStatic;

export default VXETablePluginElement;