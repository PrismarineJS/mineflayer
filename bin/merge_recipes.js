#!/usr/bin/env node
if(process.argv.length!=5)
{
	console.log("Usage : ./merge_recipes.js <oldRecipes.json> <recipes2.json> <newRecipes.json>");
	process.exit(1);
}

var fs=require('fs');
var output_file=process.argv[4];

function print(o,file)
{
  fs.writeFile(file, JSON.stringify(o,null,2), function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

var oldRecipes=require(process.argv[2]);
var transformedRecipes=require(process.argv[3]);
var newRecipes=transformedRecipes;

for(var i in oldRecipes) newRecipes[i]=oldRecipes[i];

print(newRecipes,output_file);