# -*- coding: utf-8 -*-
"""
process.py

@author: Aaron Doubek-Kraft, adoubekk@ucsc.edu

Takes in a the graduate admissions dataset and processes it

Merges the two csv files together
"""

import sys
import math
import csv

#given a string ranked with 1:, 2:, etc.
#strip rankings
def clean(string):
    result = ""
    if (":" not in string):
        return string
    else:
        string = string.split("|")
        for val in string:
            if (":" in val):
                val = val.split(":")
                result = result + val[1] + "|"
            else:
                result = result + val + "|"
    return result[:-1]


#try to open file in commmand line agruments
filename1 = sys.argv[1]
filename2 = sys.argv[2]
try:
    file1 = open(filename1)
    file2 = open(filename2)
except IOError:
    print("File could not be read. \n Usage: process.py filename1 filename2")
    sys.exit()

reader1 = csv.reader(file1)
reader2 = csv.reader(file2)
data1 = []
data2 = []
fields = []

#extract data from files
for row in reader1:
    data1.append(row)
    
for row in reader2:
    data2.append(row)
    
#separate fields into own array, and remove from data1
fields = data1[0] + ["Admitted"]
data1 = data1[1:]
data2 = data2[1:]
admitted_list=[]
for row in data2:
    admitted_list.append(row[0])

admitted = set(admitted_list)
ID_index = fields.index("ID")
RI_index = fields.index("Research Interests")
GREQ_index = fields.index("GREQ")
GREV_index = fields.index("GREV")
UG_GPA_index = fields.index("UG GPA")
UG_SCALE_index = fields.index("UG GPA SCALE")
GRAD_GPA_index = fields.index("GRAD GPA") + 1
GRAD_SCALE_index = fields.index("GRAD GPA SCALE") + 1

fields.insert(UG_SCALE_index + 1,"UG GPA (Normalized)")
fields.insert(GRAD_SCALE_index + 1,"GRAD GPA (Normalized)")

GPA = 0
Scale = 1
Result = 0
exclusions = set({"","Other","Don't Know","None"})

for row in data1:
    #add field indicating if student was admitted
    if (row[ID_index] in admitted):
        row.append("Yes")
    else:
        row.append("No")
        
    #strip rankings from research interests
    row[RI_index] = clean(row[RI_index])
    
    #remove out-of-bounds GRE scores
    score = row[GREQ_index].split(" ")[0]
    if (score not in exclusions):
        if (float(score) > 170):
            row[GREQ_index] = ""
            
    score = row[GREV_index].split(" ")[0]
    if (score not in exclusions):
        if (float(score) > 170):
            row[GREV_index] = ""
    
    #normalize GPAs    
    GPA = row[UG_GPA_index]
    Scale = row[UG_SCALE_index]
    if (GPA not in exclusions and Scale not in exclusions):
        result = float(GPA)/float(Scale)
        if (result <= 1):
            row.insert(UG_SCALE_index + 1,result)
        else:
            row.insert(UG_SCALE_index + 1,"")
    else:
         row.insert(UG_SCALE_index + 1,"")
         
    GPA = row[GRAD_GPA_index]
    Scale = row[GRAD_SCALE_index]
    if (GPA not in exclusions and Scale not in exclusions):
        result = float(GPA)/float(Scale)
        if (result <=1):
            row.insert(GRAD_SCALE_index + 1,result)
        else:
            row.insert(GRAD_SCALE_index + 1,"")
    else:
         row.insert(GRAD_SCALE_index + 1,"")
         
#Write to file
out_filename = filename1.split('.')[0] #extract base name of input file
out_file = open(out_filename+"_new.csv",'w',newline='')
writer = csv.writer(out_file)
#Dataset information

writer.writerow(fields)
writer.writerows(data1)

file1.close()
file2.close()
out_file.close()
