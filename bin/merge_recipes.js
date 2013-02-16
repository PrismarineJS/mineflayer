#!/usr/bin/env node
if(process.argv.length!=4)
{
	console.log("Usage : ./merge_recipes.js <oldRecipes.json> <recipes2.json> > <newRecipes.json>");
	process.exit(1);
}

function print(o)
{
	console.log(JSON.stringify(o,null,2));
}

var oldRecipes=require("./"+process.argv[2]);
var transformedRecipes=require("./"+process.argv[3]);
var newRecipes=transformedRecipes;

for(var i in oldRecipes) newRecipes[i]=oldRecipes[i];

print(newRecipes);