import { defineStore } from 'pinia'
import {   reactive } from 'vue';
import { getdubaoID,setdubaoID } from '@/api/storge'
interface dubaointerface {
  dubaoId: string;
  dubaoName: string;
  cover: string;
}
export const useDubaoStore = defineStore('dubao', () => {

  let dubaoId: dubaointerface[] = reactive(JSON.parse(getdubaoID() as string)||[]);
  function add(d: dubaointerface) {
    dubaoId.push(d)
    console.log(d);
    setdubaoID(JSON.stringify(dubaoId));
  }
  function getDuBao(id: string) {
    return dubaoId.find((item) => item.dubaoId === id);
  }

  return { dubaoId,add,getDuBao };

})

