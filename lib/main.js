// final_proj.js
// Take in a .csv (Comma Separated Values) file and provide tools to perform multivariate visualization

function main() {
   $(document).ready(function(){
      var file;
      var reader = new FileReader();
      var labels; //indexed array for labels to records in multivariate data
      var records_raw; //array of strings representing records
      var records; //array of Record objects
      var sets //array of labels to use as subsets; qualitative data
      var tags; //map of sets to subsets
      var data; //array of labels resenting quantitative data
      
      //get data from FileReader object and parse it into appropriate data structures
      $("#Load").click(function(){
         labels = [];
         records_raw = [];
         records = [];
         sets = [];
         tags = new Map();
         data = [];
         
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
         labels = clean(labels); //remove extra quotation marks from strings
         //read in records
         while(input.length > 0){
            lineBreak = input.indexOf("\n");
            line = input.slice(0,lineBreak);
            input = input.slice(lineBreak+1);
            records_raw.push(clean(line.split(',')));
         }
         
         //Analyze records to distinguish between qualitative and quantitative data
         //First value will be used as record name
         var i = 0 ,j = 0,k = 0;
         var str = "";
         var test;
         var set_str, set_str_split;
         var tempSet = new Set();
         
         //create an array of Records
         for (i = 0; i < records_raw.length; i++){
            records.push(new Record(records_raw[i][0]));
         }
         
         for(i = 1; i < labels.length; i++){ //go through all labels
            str = records_raw[k][i];
            while (str == "") {
               str = records_raw[++k][i]; //iterate over records until a non-empty value is found
            }
            k=0;
            test = parseFloat(str); //try to parse this value as a number; returns NaN if it is text
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
               tags.set(labels[i],Array.from(tempSet));
               tempSet.clear();
            } else {
               data.push(labels[i]);
               for (j = 0; j < records_raw.length; j++){
                  records[j].insert(labels[i],parseFloat(records_raw[j][i]));
               }
            }
         }
         console.log(records[0].vals);
         console.log("Sets: " + sets);
         console.log("Data: " + data);
         console.log(tags);
         
         //Add inputs dynamically as HTML elements
         $("#Selectors").empty();
         $("#SetSelectors").empty(); //clear input areas
         for (var i = 0; i < data.length; i++){
            $("#Selectors").append("<p>" +
                                   "<input class=\"w3-check w3-left\" type=\"checkbox\" id = \"cbox" + (i) + "\"" + (i<5 ? "checked=\"checked\"":"") + "\">" +
                                   "<label class=\"w3-validate\" for = \"cbox" + (i) + "\">" + data[i] + "</label>" +
                                   "</p>");
         }
         for (var i = 0; i < sets.length; i++){
            $("#SetSelectors").append("<p>" +
                                   "<input name = \"setSelecs\" class=\"w3-radio w3-left\" type=\"radio\" id = \"rad" + (i) + "\"" + (i==0 ? "checked=\"checked\"":"") + "\">" +
                                   "<label class=\"w3-validate\" for = \"rad" + (i) + "\">" + sets[i] + "</label>" +
                                   "</p>");            
         }
         updatePlot(records,data);
      });
      
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         console.log(file.name);
         reader.readAsText(file); //read text file; stored in "result" property
      });
      
      $("#Selectors").change(function(){
         updatePlot(records,data);
      });
      
      $("#displayAxes").click(function(){
         $("#Selectors").toggle();
         $("#SetSelectors").hide();
      });
      $("#Groups").click(function(){
         $("#SetSelectors").toggle();
         $("#Selectors").hide();
      });
   }); 
}

function updatePlot(plot_data,data){
   var margin = {top: 100, right: 50, bottom: 50, left: 50}; //conventional margins
   var vis = d3.select("svg");
   var width = vis.attr("width") - margin.left - margin.right;
   var height = vis.attr("height") - margin.top - margin.bottom;
   var range_Points = [];
   var showAxis = [];
   var showData = [];
   var dataSel;
   for (var i = 0; i < data.length; i++){
      dataSel = $("#cbox" + i);
      if (dataSel.prop("checked") == true){
         showAxis.push(true);
         showData.push(data[i]);
      } else {
         showAxis.push(false);
      }
   }

   //Scales and Axes
   var yScales = [];
   var yAxes = [];
   for (var i = 0; i < data.length; i++){
      if (showAxis[i]){
         yScales.push(d3.scaleLinear()
            .domain([d3.min(plot_data, function(d){return d.find(data[i])}), d3.max(plot_data, function(d){return d.find(data[i])})])
            .range([height,0]));
         yAxes.push(d3.axisLeft(yScales[yScales.length-1]));
      }
   }
   var n = yAxes.length;
   for (var i = 0; i < n; i++){
      range_Points.push( (i/(n-1)) * width);
   } 
   var xScale = d3.scaleOrdinal().domain(showData).range(range_Points);
   var xAxis = d3.axisTop(xScale)
                  .tickSize(0)
                  .tickPadding(margin.bottom+20);
   
   //Erase previous content of vis
   vis.selectAll("*").remove(); 
   
   //Draw Axes
   vis.append("g") //create the group "g" and shift it over by the margin values
         .attr("transform","translate(" + 0 + "," + margin.top + ")"); 
         
   //add the x-axis
   vis.append("g")
      .attr("transform","translate(" + margin.left + "," + (height + margin.top + margin.bottom) + ")")
      .call(xAxis);
      
   //add the y-axes
   for (var j = 0; j < n; j++){
      vis.append("g")
         .attr("transform","translate(" + (margin.left + (j/(n-1)) * width) + "," + (margin.bottom) + ")")
         .call(yAxes[j]);
   }
   
   //Draw the polylines
   //Create polyline function
   var line = d3.line()
      .defined(function (d,i) {return (!isNaN(d[1])) }) //remove undefined points (this causes breaks in lines, need to find better soln.)
      .x(function(d,i) { return range_Points[i%n]; } )
      .y(function (d,i) { return yScales[i%n]( d[1] ) })
   
   //Plot polylines with SVG
   for (var i = 0; i < plot_data.length; i++){
      vis.append("path")
         .datum(plot_data[i].getPairs(showData) )
         .attr("transform","translate(" + margin.left + "," + margin.bottom +")")
         .attr("fill", "none")
         .attr("stroke", "#880088")
         .attr("stroke-linejoin", "round")
         .attr("stroke-linecap", "round")
         .attr("stroke-width",1.5)
         .attr("stroke-opacity",.7)
         .attr("d",line);
   }
}

//given array of strings, strips leading and trailing quotation marks
function clean(arr){
   var result = Array.from(arr);
   for (var i = 0; i < arr.length; i++){
      while (result[i].startsWith("\"")){
         result[i] = result[i].slice(1);
      }
      while (result[i].endsWith("\"")){
         result[i] = result[i].slice(0,-1);
      }
   }
   return result;
}



   
   
   