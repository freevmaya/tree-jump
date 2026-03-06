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