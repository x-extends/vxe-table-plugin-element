import XEUtils from 'xe-utils/methods/xe-utils'
import dependencies from 'vxe-table/lib/utils/dependencies'

declare global {
  interface Window {
    VXETable: any
  }
}

XEUtils.mixin(dependencies)
