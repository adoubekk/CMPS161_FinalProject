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

for row in data1:
    #add field indicating if student was admitted
    if (row[ID_index] in admitted):
        row.append("Yes")
    else:
        row.append("No")
        
    #strip rankings from research interests
        
        
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
