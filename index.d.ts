export interface VXETablePluginElementStatic {
  install(vue: typeof Vue): void;
}

/**
 * vxe-table renderer plugins for element-ui.
 */
declare var VXETablePluginElement: VXETablePluginElementStatic;

export default VXETablePluginElement;