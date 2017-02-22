// final_proj.js
// Take in a .csv (Comma Separated Values) file and provide tools to perform multivariate visualization

function main() {
   $(document).ready(function(){
      var file;
      var reader = new FileReader();
      var labels = []; //indexed array for labels to records in multivariate data
      var records = []; //array of arrays representing records
      
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
            console.log(input.length);
            line = input.slice(0,lineBreak);
            input = input.slice(lineBreak+1);
            records.push(line.split(','));
        }
      })
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         console.log(file.name);
         reader.readAsText(file); //read text file; stored in "result" property
      });
   });
}
   
   
   