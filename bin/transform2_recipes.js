#!/usr/bin/env node
if(process.argv.length!=6)
{
	console.log("Usage : ./transform2_recipes.js <recipes.json> <blocks.json> <items.json> <recipes2.json>");
	process.exit(1);
}


var fs=require('fs');

var recipes=require(process.argv[2]);
var blocks=require(process.argv[3]);
var items=require(process.argv[4]);
var output_file=process.argv[5];


var ids={};
for(var i in blocks) ids[blocks[i].displayName]=i;
for(var i in items) ids[items[i].displayName]=i;
ids["Oak Wood Planks"]="5";

var nrecipes={}
for(var i in recipes) if(ids[i]!==undefined)
{
	var arecipe=recipes[i];
	var anrecipe=[];
	for(var j in arecipe)
	{
		var recipe=arecipe[j];
		var nrecipe={};
		var id=ids[i];
		nrecipe["count"]=recipe["output"];
		nrecipe["metadata"]=0;
		var r=recipe["recipe"];
		if(recipe["shapeless"]===1)
		{
			var ingr=[];
			var notAdded=0;
			for(var k in r)
			{
				if(r[k]!=null)
				{
					if(ids[r[k]]===undefined)
					{
						notAdded=1;
						break;
					}
					ingr.push({"id":parseInt(ids[r[k]])});
				}
			}
			nrecipe["ingredients"]=ingr;
		}
		else
		{
			var nr=[[],[],[]];
			var notAdded=0;
			for(var k in r)
			{
				if(r[k]!=null)
				{
					if(ids[r[k]]===undefined)
					{
						notAdded=1;
						break;
					}
					nr[Math.floor(k/3)].push(parseInt(ids[r[k]]));
				}
				else nr[Math.floor(k/3)].push(null);
			}
			nrecipe["inShape"]=nr;
		}
		nrecipe["type"]=parseInt(id);
		if(!notAdded) anrecipe.push(nrecipe);
	}
	if(anrecipe.length>0) nrecipes[id]=anrecipe;
}

var recipes=nrecipes;

// final transformation : remove the useless null
var nrecipes={};
for(var i in recipes)
{
	var arecipe=recipes[i];
	var anrecipe=[];
	for(var j in arecipe)
	{
		var recipe=arecipe[j];
		var nrecipe={};
		nrecipe["count"]=recipe["count"];
		nrecipe["metadata"]=recipe["metadata"];
		if(recipe["inShape"]!==undefined)
		{
			var r=recipe["inShape"];
			var nr=[];
			var uselessLines=[];
			var uselessColumns=[];
			var remove;
			//remove useless lines
			remove=1;
			for(var k=0;k<3;k++)
			{
				for(var l=0;l<3;l++)
				{
					if(r[k][l]!=null)
					{
						remove=0;
						break;
					}
				}
				if(remove) uselessLines.push(k);
				else break;
			}
			remove=1
			for(var k=2;k>=0;k--)
			{
				for(var l=0;l<3;l++)
				{
					if(r[k][l]!=null)
					{
						remove=0;
						break;
					}
				}
				if(remove) uselessLines.push(k);
				else break;
			}
			//remove useless columns
			remove=1;
			for(var k=0;k<3;k++)
			{
				for(var l=0;l<3;l++)
				{
					if(r[l][k]!=null)
					{
						remove=0;
						break;
					}
				}
				if(remove) uselessColumns.push(k);
				else break;
			}
			remove=1
			for(var k=2;k>=0;k--)
			{
				for(var l=0;l<3;l++)
				{
					if(r[l][k]!=null)
					{
						remove=0;
						break;
					}
				}
				if(remove) uselessColumns.push(k);
				else break;
			}
			var m=0;
			for(var k=0;k<3;k++)
			{
				if(uselessLines.indexOf(k)===-1)
				{
					nr.push([]);
					for(var l=0;l<3;l++)
					{
						if(uselessColumns.indexOf(l)===-1)
						{
							nr[m].push(r[k][l]);
						}
					}
					m++;
				}
			}
			nrecipe["inShape"]=nr;
		}
		else nrecipe["ingredients"]=recipe["ingredients"];
		nrecipe["type"]=recipe["type"];
		anrecipe.push(nrecipe);
	}
	nrecipes[i]=anrecipe;
}


function print(o,file)
{
  fs.writeFile(file, JSON.stringify(o,null,2), function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

print(nrecipes,output_file);