<template>
    <div class="block">
        <el-date-picker
            v-model="dateTime.data"
            type="daterange"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            :disabled-date="disabledDate"
            :default-time="[new Date(), new Date()]"
        >
        </el-date-picker>
        <input type="button" @click="submitData" value="送出" />
    </div>
    <vxe-table
        :data="tableData[0]"
        :tree-config="{ children: 'children' }"
        :checkbox-config="{ labelField: tableConfig.titleMaster }"
        @checkbox-change="checkboxCheckUp"
        @checkbox-all="checkboxAllCheckUp"
    >
        <vxe-column type="checkbox" :title="tableConfig.titleMaster" tree-node></vxe-column>
        <vxeColumn v-for="item in tableConfig.titleLabel" :field="item" :title="item" :key="item"> </vxeColumn>
    </vxe-table>
</template>

<script>
import axios from 'axios'
import { reactive, onMounted } from 'vue'

export default {
    name: 'tableTree',
    emits: ['getCheckedList'],
    /**
     * object props ,接收參數的物件
     * url 限定字串,用來取外部api資料的網址
     * pageSize 限定數字,頁面顯示筆數大小
     * titleMaster 限定字串,為表格的主欄位
     * titleLabel 限定陣列字串,為表格的副欄位
     * */
    props: {
        url: {
            type: String,
            default: '',
        },
        data: {
            type: Array,
        },
        titleMaster: {
            type: String,
            required: true,
        },
        titleLabel: {
            type: Array,
        },
        smallestUnit: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
        //儲存表格資料的載體
        let tableData = reactive([])

        //設定表格的物件
        const tableConfig = reactive({
            url: props.url,
            data: props.data,
            titleLabel: props.titleLabel,
            titleMaster: props.titleMaster,
            smallestUnit: props.smallestUnit,
        })

        //取得資料可選api或者json資料
        const getApiData = async () => {
            if (tableConfig.url !== '') {
                await axios.get(tableConfig.url).then((resp) => {
                    tableData.length = 0
                    tableData.push(resp.data)
                })
            } else {
                tableData.length = 0
                tableData.push(tableConfig.data)
            }
        }

        //紀錄選定時間
        const dateTime = reactive({ data: '' })

        //紀錄勾選紀錄資料陣列
        const recordsList = reactive([])

        //選擇非最上層時，將勾選list記錄下來
        const checkboxCheckUp = ({ records = [] }) => {
            recordsList.length = 0
            records.forEach((element) => {
                if (element.type === tableConfig.smallestUnit) {
                    recordsList.push(element)
                }
            })
        }

        //選擇樹結點的最上層
        const checkboxAllCheckUp = ({ checked }) => {
            if (checked) {
                recordsList.length = 0
                tableData[0].filter((item) => {
                    handlerRecursive(item)
                })
            } else {
                recordsList.length = 0
            }
        }

        //在樹狀資料中搜尋最小單位資料,沒有children就回傳
        const handlerRecursive = (item) => {
            if (item.children.length !== 0) {
                item.children.filter((value) => {
                    handlerRecursive(value)
                })
            } else {
                recordsList.push(item)
            }
        }

        //設定datePicker的可選日期
        const disabledDate = (time) => {
            return time.getTime() > Date.now()
        }

        //送出資料給父元件
        const submitData = () => {
            //將資料格式轉為timestamp
            let data = []
            dateTime.data.forEach((item) => {
                data.push(new Date(item).getTime())
            })
            //超過31天發出警報
            if ((data[1] - data[0]) / (3600 * 24 * 1000) > 30) {
                window.alert('日期選擇不得超過31天')
                console.log(`Error,日期選擇超過31天`)
            } else {
                //emit將資料丟回父原件
                emit('getCheckedList', { checkedUpList: recordsList, selectedDate: data })
            }
        }

        onMounted(async () => {
            await getApiData()
        })
        return {
            checkboxCheckUp,
            checkboxAllCheckUp,
            tableData,
            tableConfig,
            dateTime,
            disabledDate,
            submitData,
        }
    },
}
</script>
