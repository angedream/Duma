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
    for (let i = 0; i < dubaoId.length; i++) {
      if (dubaoId[i]?.dubaoId === d.dubaoId) {
        return false;
      }
    }
    dubaoId.push(d)
    console.log(d);
    setdubaoID(JSON.stringify(dubaoId));
    return true;
  }
  function getDuBao(id: string) {
    return dubaoId.find((item) => item.dubaoId === id);
  }
  function remove(id: string) {
    const index = dubaoId.findIndex((item) => item.dubaoId === id);
    if (index !== -1) {
      dubaoId.splice(index, 1);
      setdubaoID(JSON.stringify(dubaoId));
      return true;
    }
    return false;
  }
  function unbind(id: string) {
    return remove(id);
  }
  function checkaddrepeat(d: dubaointerface) {
    for (let i = 0; i < dubaoId.length; i++) {
      if (dubaoId[i]?.dubaoId === d.dubaoId) {
        return true;
      }
    }
    return false;
  }
  return { dubaoId,add,getDuBao,remove,unbind,checkaddrepeat };

})

