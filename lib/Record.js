//Record.js
//class for individual records read in from file

var Record = function(name_){
   this.vals = []; //array of qualitative data associated with Record
   this.sets =[]; //sets this Record is member of
   this.name = name_; //name associated with Record(first value in record)
}

//add a new numerical value to the record
Record.prototype.insert = function(val){
   this.vals.push(val);
}