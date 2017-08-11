 export function validNick(nickname) {
     var regex = /^\w*$/;
     return regex.exec(nickname) !== null;
 }

 export function findIndex (arr, id) {
     var len = arr.length;

     while (len--) {
         if (arr[len].id === id) {
             return len;
         }
     }

     return -1;
 }

 export function sanitizeString( message ) {
     return message.replace(/(<([^>]+)>)/ig,'').substring(0, 35);
 }
 
 export function  twoAMTomorrow(){
     var tomorrow = new Date();
     tomorrow.setHours(24,0,0,0);
     tomorrow.setHours(tomorrow.getHours() + 2);
     return tomorrow;
 }
  export function  midnightThisMorning(){
      var yesterday = new Date();
      yesterday.setHours(0,0,0,0);
      return yesterday;
 }

 export function isNumeric(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
 }