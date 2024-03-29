# CMPS 161 Final Project #

Capstone Project for CMPS 161/L: Introdution to Data Visualization @ UC Santa Cruz.

Provides an interface for generating parallel coordinate plots from multivariate
datasets. Used to analyze data relating to the graduate admissions class of UCSC.
Includes Python scripts used to pre-process the data.

To use the Parallel Coordinate Plotter, open a .csv file using the file input,
and click the load button. The program will parse the input, and display a parallel coordinate
plot of the data. By default, only the first 5 fields will be mapped to axes and displayed in
the output, and the color mapping is "None".

Expand any of the control panels on the left by clicking on them.
In the "Display Axis" panel, check the boxes to choose which axes to display in the plot.
In the "Groups" panel, choose which grouping to use to map color to the data.
In the "Legend" panel, see which colors are mapped to which sets, and choose which sets to highlight.

The plot currently supports interaction only in the form of brushing. Click and drag on an axis
to select only records that fall within that range on the axis.

Sample datasets are included in the "datasets" folder.
