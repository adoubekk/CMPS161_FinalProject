// final_proj.js
// Take in a .csv (Comma Separated Values) file and provide tools to perform multivariate visualization

function main() {
   $(document).ready(function(){
      var file;
      var reader = new FileReader();
      var labels = []; //indexed array for labels to records in multivariate data
      var records_raw = []; //array of strings representing records
      var records = []; //array of Record objects
      var sets = []; //array of labels to use as subsets; qualitative data
      var tags = []; //array of names of subsets
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
         var set_str, set_str_split;
         var tempSet = new Set();
         
         for(i = 1; i < labels.length; i++){ //go through all labels
            str = records_raw[k][i];
            while (str == "") {
               str = records_raw[++k][i]; //iterate over records until a non-empty value is found
            }
            k=0;
            test = parseFloat(str); //try to parse this value as a number; returns NaN if it is text
            //console.log(labels[i] + ": " + str + ", " + test);
            if (isNaN(test)){
               sets.push(labels[i]);
               //construct arrays containing all potential tags to be used as subsets
               for (var j = 0; j < records_raw.length; j++){
                  set_str = records_raw[j][i];
                  set_str_split = set_str.split('|');
                  //console.log(set_str);
                  for (var l = 0; l < set_str_split.length; l++){
                     tempSet.add(set_str_split[l]);
                  }
               }
               tags.push(new Set(tempSet));
               tempSet.clear();
            } else {
               data.push(labels[i]);
            }
         }
         console.log("Sets: " + sets);
         console.log("Data: " + data);
         console.log(tags);
         
         //add buttons dynamically as HTML elements
         var test_add = tags[0].values();
         console.log(test_add);
         var next_elem = test_add.next();
         var txt;
         while (!next_elem.done){
            next_elem = test_add.next();
            txt = $("<p></p>").text(next_elem.value); 
            $("body").append(txt);
         }
      });
      
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         console.log(file.name);
         reader.readAsText(file); //read text file; stored in "result" property
      });
      
      var data = [1,4,6,2,22,11,19];
      var w = 500, h = 500;

      //Scales
      var x = d3.scale.linear()
         .domain([0, d3.max(data)])
         .range([0, 420]);
      //var y  = d3.scale.linear().domain([0, max]).range([h, 0]);
      
      var vis = d3.select("#plot").append("svg:svg");
      vis.attr("width",w);
      vis.attr("height",h);
      

       
   }); 
}



   
   
   