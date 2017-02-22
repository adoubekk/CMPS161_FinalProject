// final_proj.js
// Take in a .csv (Comma Separated Values) file and provide tools to perform multivariate visualization

function main() {
   $(document).ready(function(){
      var file;
      var reader = new FileReader();
      var labels = []; //indexed array for labels to records in multivariate data
      var records_raw = []; //array of strings representing records
      var records = []; //array of Record objects
      var sets = []; //array of labels to use as sets; qualitative data
      var data = []; //array of labels resenting quantitative data
      
      //get data from FileReader object and parse it into appropriate data structures
      $("#Load").click(function(){
         var lineBreak,line,input,line_arr;
         if (reader.readyState == 2){ //if file has been read into result of reader
            var input = reader.result; //get result as text
         } else { //else, the reader hasn't read the file (0) or is currently reading the file (1)
            console.log("File is not ready: readyState " + reader.readyState);
         }
         //read in first line of labels for variables in records
         lineBreak = input.indexOf("\n"); //get index of first line break
         line = input.slice(0,lineBreak); //get next line
         input = input.slice(lineBreak+1); //get get remaining string after line break
         labels = line.split(',') //split into array of data values
         console.log(labels);
         //read in records
         while(input.length > 0){
            lineBreak = input.indexOf("\n");
            line = input.slice(0,lineBreak);
            input = input.slice(lineBreak+1);
            records_raw.push(line.split(','));
         }
         //Analyze records to distinguish between qualitative and quantitative data
         //First value will be used as record name
         var k = 0;
         var str = "";
         var test;
         var split_set
         for(i = 1; i < labels.length; i++){ //go through all labels
            str = records_raw[k][i];
            while (str == "") {
               str = records_raw[++k][i]; //iterate over records until a non-empty value is found
            }
            k=0;
            test = parseFloat(str); //try to parse this value as a number; returns NaN if it is text
            //console.log(labels[i] + ": " + str + ", " + test);
            if (isNaN(test)){
               //if (labels[i].indexOf('|') != -1){ //there is more than one tag in this label
               //   split_set = labels[i].split('|'); //split them up and push them individually
               //   for (j = 0; j < split_set.length; j++){
               //      sets.push(split_set[j]);
               //   }
               //} else {
                  sets.push(labels[i]);
               //} // NOTE TO SELF: This approach isn't complete, because any record may have multiple values at a given label. Need to iterative over ALL
                   // records for qualitative data in order to identify all possible sets. (Maybe for quantitative data as well? Though unclear what multiple data points would mean..)
            } else {
               data.push(labels[i]);
            }
         }
         console.log("Sets: " + sets);
         console.log("Data: " + data);
      })
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         console.log(file.name);
         reader.readAsText(file); //read text file; stored in "result" property
      });
   });
}
   
   
   