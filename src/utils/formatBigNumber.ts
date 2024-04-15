export default (number:number) =>{
    if (number >= 1000000) {
        return Math.floor(number / 1000000) + 'M';
    } else if (number >= 1000) {
        return Math.floor(number / 1000) + 'k';
    } else {
        return number;
    }
}
