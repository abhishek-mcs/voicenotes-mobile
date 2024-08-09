export default (number:number) =>{
    if (number >= 1000000) {
        return Math.floor(number / 1000000) + 'M';
    } else if (number >= 1000) {
        return Math.floor(number / 1000) + 'k';
    } else {
        return number;
    }
}

export const generateRandomIdentifier = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };