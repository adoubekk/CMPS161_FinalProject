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
      
      //test data
      var test_data = [{x:1,y:4},{x:5,y:2},{x:19,y:11},{x:30,y:21} ];
      var test_data2 = [{x:2,y:77},{x:3,y:43},{x:7,y:12},{x:10,y:102}];
      var test_map = [];
      test_map.push(new Map([["x",1],["y",4]]));
      test_map.push(new Map([["x",5],["y",19]]));
      test_map.push(new Map([["x",7],["y",11]]));
      test_map.push(new Map([["x",9],["y",22]]));    
      updatePlot(test_map);
      
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
               for (j = 0; j < records_raw.length; j++){
                  records[j].insert(labels[i],parseInt(records_raw[j][i]));
               }
            }
         }
         console.log(records[0].vals);
         console.log("Sets: " + sets);
         console.log("Data: " + data);
         console.log(tags);
         
         //add inputs dynamically as HTML elements
         var test_add = tags[0].values();
         console.log(test_add);
         var next_elem = test_add.next();
         var txt;
         while (!next_elem.done){
            next_elem = test_add.next();
            txt = $("<p></p>").text(next_elem.value); 
            $("body").append(txt);
         }
         updatePlot(test_data2);
      });
      
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         console.log(file.name);
         reader.readAsText(file); //read text file; stored in "result" property
      });
   }); 
}

function updatePlot(plot_data){
   var margin = {top: 50, right: 50, bottom: 50, left: 50}; //conventional margins
   var vis = d3.select("svg");
   var width = vis.attr("width") - margin.left - margin.right;
   var height = vis.attr("height") - margin.top - margin.bottom;
   var width_eff = vis.attr("width");
   var height_eff = vis.attr("height");
   
   //var width = 500 - margin.left - margin.right, height = 500 - margin.left - margin.right;

   //Scales and Axes
   var xScale = d3.scaleLinear().domain([0, d3.max(plot_data, function(d){return d.get("x")})]).range([0, width]);
   var yScale  = d3.scaleLinear().domain([0, d3.max(plot_data, function(d){return d.get("y")})]).range([height,0]);
   var xAxis = d3.axisBottom(xScale);
   var yAxis = d3.axisLeft(yScale);
   
   //Erase previous content of vis
   vis.selectAll("*").remove(); 
   
   //Draw Axes
   vis.append("g") //create the group "g" and shift it over by the margin values
         .attr("transform","translate(" + 0 + "," + margin.top + ")"); 
         
   //add the x-axis
   vis.append("g")
      .attr("transform","translate(" + margin.left + "," + (height + margin.bottom ) + ")")
      .call(xAxis);
   
   //label x-axis
   vis.append("text")
      .attr("transform","translate(" + (margin.left + width/2) + "," + (height + margin.bottom + height/15) + ")")
      .style("text-anchor","middle")
      .text("X-Axis");
      
   //add the y-axis 
   vis.append("g")
    .attr("transform","translate(" + (margin.left) + "," + (margin.bottom) + ")")
      .call(yAxis);
      
   //label y-axis
   vis.append("text")
      .attr("transform","translate(" + margin.left + "," + (margin.top - height/30) +")")
      .style("text-anchor","middle")
      .text("Y-axis");
      
   //Draw the lines 
   
   //add the polyline
   var line = d3.line()
      .x(function (d) {return xScale(d.get("x"))})
      .y(function (d) {return yScale(d.get("y"))})
     
   vis.append("path")
      .datum(plot_data)
      .attr("transform","translate(" + margin.left + "," + margin.bottom +")")
      .attr("fill", "none")
      .attr("stroke", "#880088")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width",1.5)
      .attr("d",line);
}



   
   
   