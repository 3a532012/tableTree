import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/lib/theme-chalk/index.css'
import ElementUI from 'element-plus'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
createApp(App)
    .use(VXETable)
    .use(ElementUI)
    .mount('#app')
