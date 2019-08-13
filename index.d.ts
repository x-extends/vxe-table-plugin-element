import VXETable from 'vxe-table'

export interface VXETablePluginElementStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * vxe-table renderer plugins for element-ui.
 */
declare var VXETablePluginElement: VXETablePluginElementStatic;

export default VXETablePluginElement;