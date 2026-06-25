const dumainfo = 'dumainfo';
export function getUserData() {
  if (!window.localStorage) {
    return null
  }
  return localStorage.getItem(dumainfo)
}

export function setUserData (data:string) {
  if (!window.localStorage) {
    return false
  }
  localStorage.setItem(dumainfo, data)
  console.log('设置成功')
  return true
}

export function removeUserData () {
  localStorage.removeItem(dumainfo)
}

const dubaoID = 'dubaoID';

export function getdubaoID () {
  if (!window.localStorage) {
    return null
  }
  return localStorage.getItem(dubaoID)
}

export function setdubaoID (data:string) {
  if (!window.localStorage) {
    return false
  }
  localStorage.setItem(dubaoID, data)
  console.log('设置成功')
  return true
}
export function removedubaoID () {
  localStorage.removeItem(dubaoID)
}
export function clearData () {
  localStorage.clear()
}
