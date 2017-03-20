# -*- coding: utf-8 -*-
"""
process.py

@author: Aaron Doubek-Kraft, adoubekk@ucsc.edu

Takes in a the graduate admissions dataset and processes it

Merges the two csv files together
"""

import sys
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
data_final = []
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

GREQ_index = fields.index("GREQ")
GREV_index = fields.index("GREV")
GREA_index = fields.index("GREA")
FD_index = fields.index("For/Dom")
countries = []
name = ""
include = True
GREV = 0
GREQ = 0
GREA = 0
GREs = dict()
GRE_avgs = dict()
exclusions = set({"","Other","Don't Know","None"})

for row in data1:
    name = row[FD_index]
    include = True
    if (name not in countries):
        countries.append(name)
        GREs[name] = []
        
    GREV = row[GREV_index].split(" ")[0]
    if (GREV not in exclusions):
        if (float(GREV) > 170):
            row[GREV_index] = ""
            include = False
    else:
        include = False
    
    #remove out-of-bounds GRE scores
    GREQ = row[GREQ_index].split(" ")[0]
    if (GREQ not in exclusions):
        if (float(GREQ) > 170):
            row[GREQ_index] = ""
            include = False
    else:
        inlcude = False
            
            
    GREA = row[GREA_index].split(" ")[0]
    if (GREA in exclusions):
        include = False
    
    if (include):
        GREs[name].append([float(GREV),float(GREQ),float(GREA)])

for country in countries:
    total = [0,0,0]
    n = 0
    for data in GREs[country]:
        n += 1
        total[0] += data[0]
        total[1] += data[1]
        total[2] += data[2]
    if (n > 0):
        total[0] = 1/n * total[0]
        total[1] = 1/n * total[1]
        total[2] = 1/n * total[2]
    GRE_avgs[country] = total
    
print(GRE_avgs)

admitted = set(admitted_list)
ID_index = fields.index("ID")
RI_index = fields.index("Research Interests")
UG_GPA_index = fields.index("UG GPA")
UG_SCALE_index = fields.index("UG GPA SCALE")
Tags_index = fields.index("Tags")
GRAD_GPA_index = fields.index("GRAD GPA") + 1
GRAD_SCALE_index = fields.index("GRAD GPA SCALE") + 1
GREV_index = fields.index("GREV") + 2
GREQ_index = fields.index("GREQ") + 3
GREA_index = fields.index("GREA") + 4
TOEFL_index = fields.index("TOEFL") + 5
IELTS_index = fields.index("IELTS") + 5

fields.insert(UG_SCALE_index + 1,"UG GPA (N)")
fields.insert(GRAD_SCALE_index + 1,"GRAD GPA (N)")
fields.insert(GREV_index + 2,"GREV (N)")
fields.insert(GREQ_index + 2,"GREQ (N)")
fields.insert(GREA_index + 2,"GREA (N)")
fields.insert(IELTS_index + 1, "EFL (N)")

GPA = 0
Scale = 1
IELTS_score = 0
IELTS_scale = 9
TOEFL_score = 0
TOEFL_scale = 120
score = 0
EFL_score = -1
result = 0
country = ""
GREV = 0
GREQ = 0
GREA = 0
include = False

for row in data1:
    
    country = row[FD_index]   
    EFL_score = -1
    include = False
    
    #add field indicating if student was admitted
    if (row[ID_index] in admitted):
        row.append("Yes")
    else:
        row.append("No")
        
    #strip rankings from research interests
    row[RI_index] = clean(row[RI_index])
    
    #remove FAIL FIRST FILTER applicants
    if ("FAIL FIRST FILTER" not in row[Tags_index]):
        include = True
    
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
        
    #test score normalization
    GREV = row[GREV_index].split(" ")[0]
    if (GREV not in exclusions):
        row.insert(GREV_index+2,float(GREV) - GRE_avgs[country][0])   
    else:
        row.insert(GREV_index+2,"")
    
    GREQ = row[GREQ_index].split(" ")[0]
    if (GREQ not in exclusions):    
        row.insert(GREQ_index+2,float(GREQ) - GRE_avgs[country][1])
    else:
        row.insert(GREQ_index+2,"")
        
    GREA = row[GREA_index].split(" ")[0]
    if (GREA not in exclusions):
        row.insert(GREA_index+2,float(GREA) - GRE_avgs[country][2])
    else:
        row.insert(GREA_index+2,"")
    
    #normalize English as a Foreign Language tests
    IELTS_score = row[IELTS_index].split(" ")[0]
    if (IELTS_score not in exclusions):
        EFL_score = float(IELTS_score)/IELTS_scale
    TOEFL_score = row[TOEFL_index].split(" ")[0]
    if (TOEFL_score not in exclusions):
        EFL_score = float(TOEFL_score)/TOEFL_scale
    if (EFL_score >= 0):
        row.insert(IELTS_index + 1, EFL_score)
    else:
        row.insert(IELTS_index + 1, "")
        
    if (include):
        data_final.append(row)
    
#Write to file
out_filename = filename1.split('.')[0] #extract base name of input fill

#write full dataset
out_file = open(out_filename+"_new.csv",'w',newline='')
writer = csv.writer(out_file)
writer.writerow(fields)
writer.writerows(data1)

#write reduced dataset
out_file = open(out_filename+"_reduced.csv",'w',newline='')
writer = csv.writer(out_file)
writer.writerow(fields)
writer.writerows(data_final)

file1.close()
file2.close()
out_file.close()
