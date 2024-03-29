//Record.js
//class for individual records read in from file

var Record = function(name_){
   this.vals = new Map(); //map of qualitative data associated with Record
   this.sets = new Map(); //sets this Record is member of
   this.name = name_; //name associated with Record(first value in record)
}

//add a new numerical value to the Record
Record.prototype.insert = function(key,val){
   this.vals.set(key,val);
}

//getter
Record.prototype.find = function(key){
   return this.vals.get(key);
}

//setter for set membership
Record.prototype.setInsert = function(key,val){
   this.sets.set(key,val);
}

//returns which group the record belongs to
Record.prototype.belongsTo = function(key){
   return this.sets.get(key);
}

//given an array of keys, return an array with elements of [key,value] pairs
Record.prototype.getPairs = function(keys){
   var result = [];
   for (var i = 0; i < keys.length; i++){
      result.push( [keys[i], this.find(keys[i])] );
   }
   return result;
}