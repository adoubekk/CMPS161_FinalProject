//Record.js
//class for individual records read in from file

var Record = function(name_){
   this.vals = new Map(); //map of qualitative data associated with Record
   this.sets =[]; //sets this Record is member of
   this.name = name_; //name associated with Record(first value in record)
}

//add a new numerical value to the record
Record.prototype.insert = function(key,val){
   this.vals.set(key,val);
}

Record.prototype.find = function(key){
   return this.vals.get(key);
}