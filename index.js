var fs = require('fs');
var csv = require ('fast-csv');

// function to get the longest consecutive days payment period for each customer
function getLongestPeriods(paidDates){
let dur=[];
let size=paidDates.length; 
let count=0;  
    
for(let i=0;i<size-1;i++){
 //get the day number for the 
 let d1=new Date(paidDates[i+1])/86400000 ;  
 let d0=new Date(paidDates[i])/86400000;
 // get the date of the month for the two consecutive days
 let date1= new Date(paidDates[i+1]).getDate();
 let date0=new Date(paidDates[i]).getDate();

if(d1-d0 < 2 && (date1-date0)==1 ){
  // payment made in consecutive days
 count++   
}else if(d1-d0 < 2 && (date1-date0)==0 ){
  // payment made twice on same day 
  count=count;   
}else{
  // more than one day break in consecutive payments -save that period and reset count
 dur.push(count);
 count=0; 
}
}    
    
//return the longest period in days of consecutive day payments
return Math.max(...dur); 
}

// function to return best n customers from the provided csv file
function getBestCustomers(filePath,n,callback){
//create an object that will hold all the customers
let customers={};
//array to hold longest periods for each customer
let longestPeriods=[];
let i=0;
var stream = fs.createReadStream(filePath);
var csvStream = csv()
    .on("data", function(data){
        //first  record is the headers so should be omitted
        if(i!=0){
        //add each of the unique customer accounts to the customers object with an array of paid dates    
         if(customers[data[0]]){
           customers[data[0]].push(data[2]);  
         }
         else{
         //initialise the array with the first date
         customers[data[0]]=[data[2]];
         
        }
        }
        
        i++;
    })
    .on("end", function(){
        
        // arrange each of the customers payments dates incrementally
       for(let customer in customers){
           customers[customer].sort(function(date1, date2){
               let a=new Date(date1);
               let b=new Date(date2);
               return a-b
               
               });
          
       }
       
      //for each customer find the longest consecutive days period
      for(let customer in customers){
         let paymentPeriod=customers[customer];
         let longestPeriod=getLongestPeriods(paymentPeriod);         
         let cust={};
         cust[customer]=longestPeriod;
         longestPeriods.push(cust) ;
      }
            
     //sort the longest periods from the highest to the lowest 
       longestPeriods.sort(function(cust1, cust2){
           // compare longest periods
           if(Object.values(cust2)[0]==Object.values(cust1)[0]){
           //sort by account numbers ascendingly by account numbers
            return Object.entries(cust1)[0][0]>Object.entries(cust2)[0][0]? 1:-1;   
           }else{
           // sort descendingly by longest periods
            return Object.values(cust2)[0]-Object.values(cust1)[0];
           }          
       });
   //create an array of account numbers from the first n elements of the longestPeriods array   
     let bestAcc=[];
     for (let i=0;i<n;i++){
      let acc=longestPeriods[i];
      bestAcc.push(Object.entries(acc)[0][0]);
     }
    //return best accounts via a callback 
    callback (bestAcc);
    });   
 
stream.pipe(csvStream);


    
}
//callback function to display the results / act on results  
function callBack(bestAccounts){
 console.log(bestAccounts) ;  
}


 getBestCustomers("transaction_data_1.csv",1,callBack);
 getBestCustomers("transaction_data_2.csv",2,callBack);
 getBestCustomers("transaction_data_3.csv",3,callBack);


