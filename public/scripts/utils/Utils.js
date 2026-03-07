export function When(conditionFn, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = setInterval(() => {
      if (conditionFn()) {
        clearInterval(check);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(check);
        reject(new Error('Таймаут ожидания условия'));
      }
    }, 100);
  });
}

export function randomArray(length, density) {
  const result = new Array(length).fill(0);
  const onesCount = Math.floor(length * density);
  
  for (let i = 0; i < onesCount; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * length);
    } while (result[randomIndex]);
    
    result[randomIndex] = true;
  }
  
  return result;
}

export function enumerateTo(fromNum, toNum, totalTime, callback, finishCallBack = null) {
  let tik = 60;
  let tcount = Math.ceil(totalTime / tik);
  let i = 0;
  let timerId = setInterval(()=>{
    if (i > tcount) {
      clearInterval(timerId);
      callback(toNum);
      if (finishCallBack)
        finishCallBack();
    } else callback(fromNum + (toNum - fromNum) * i / tcount);
    i++;
  }, tik);
}

export function getOffset(length, angle) {
  return {
    x: length * Math.cos(angle),
    y: length * Math.sin(angle)
  };
}

export function sawToSine(x, t = 0.5) {
  // Нормализуем t от 0 до 1
  t = Math.max(0, Math.min(1, t));
  const saw = 2 * (x / (2 * Math.PI) - Math.floor(0.5 + x / (2 * Math.PI)));
  const sine = Math.sin(x);
  return (1 - t) * saw + t * sine;
}

export var $ = (id) => {
  return document.getElementById(id);
}