import { defineStore } from 'pinia'
import { computed, ref, reactive } from 'vue';
import { getdubaoID,setdubaoID } from '@/api/storge'
export const useDubaoStore = defineStore('dubao', () => {

  let name = ref('鲫鱼');
  let num = ref(0);
  let dubaoId = reactive(JSON.parse(getdubaoID() as string)||[]);
  function add(d: any) {
    dubaoId.push(d)
    num = dubaoId.length;
    console.log(d);
    setdubaoID(JSON.stringify(dubaoId));
  }
  let calcPrice = computed(() => {
    return num.value * 2;

  })
  return { name, num,dubaoId,add,calcPrice };

})

