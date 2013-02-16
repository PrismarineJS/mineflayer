#!/usr/bin/env node
if(process.argv.length!=3)
{
	console.log("Usage : ./transform1_recipes.js <recipes.html> > <recipes.json>");
	process.exit(1);
}
// recipes.html should be http://www.minecraftwiki.net/wiki/Crafting/CompleteList

var fs=require('fs');

//open the file
var file=fs.readFileSync(process.argv[2],"utf-8");
//parser
var v;
var items={};
if((v=file.match(new RegExp("(<tr>\\s+<th><a href=\"http://www.minecraftwiki.net/wiki/[\\s\\S]+?</table>\\s+</td>\\s+<td>[\\s\\S]+?</td>\\s+</tr>)","g")))!=null)
{
	for(var i in v)
	{
		var w;
		if((w=v[i].match(new RegExp("^<tr>\\s+<th><a [\\s\\S]+?>([\\s\\S]+?)</a>[\\s\\S]*?</th>\\s+[\\s\\S]+?<table class=\"grid-Crafting_Table\" cellpadding=\"0\" cellspacing=\"0\">([\\S\\s]+?)</table>[\\S\\s]+?</tr>$")))!=null)
		{
			var displayName=w[1];
			var shapeResult=w[2];
			var shapeLess;
			var x,y,z;
			var recipe=[];
			if((x=shapeResult.match(new RegExp("<td><span class=\"grid\"><span class=\"border\"><span>[\\s\\S]+?</span></span></span></td>","g")))!=null)
			{
				for(var j in x)
				{
					var c;
					if((c=x[j].match(new RegExp("^<td><span class=\"grid\"><span class=\"border\"><span>([\\s\\S]+?)</span></span></span></td>$")))!=null)
					{
						var d;
						if(c[1]==="<span class=\"image\">&nbsp;</span>") recipe.push(null);
						else if((d=c[1].match(new RegExp("^<span class=\"image\"><a href=\".+?\" title=\"(.+?)\">")))!=null)
						{
							recipe.push(d[1]);
						}
						else if((d=c[1].match(new RegExp("^<span class=\"animated\" data-imgs=\"(.+?)\">")))!=null)
						{
							recipe.push(d[1]);
						}
						else { console.log("Error 8"); break;}
					}
					else { console.log("Error 7"); break;}
				}
			}
			else { console.log("Error 6"); console.log(shapeResult); break;}
			if((y=shapeResult.match(new RegExp("<td class=\"shapeless\">([\\S\\s]*?)</td>")))!=null)
			{
				shapeLess=(y[1]!=="");
			}
			else { console.log("Error 5"); break;}
			var result,output;
			if((z=shapeResult.match(new RegExp("<td rowspan=\"3\"><span class=\"grid output\"><span class=\"border\"><span>([\\S\\s]+?)</span></span></span></td>")))!=null)
			{
				var a;
				if((a=z[1].match(new RegExp("^<span class=\"image\"><a href=\".+?\" title=\"(.+?)\">")))!=null)
				{
					result=a[1];
					if((a=z[1].match(new RegExp("^<span class=\"number\"><a .+?>([0-9]+)</a></span>")))!=null)
					{
						output=a[1];
					}
					else output=1;
				}
				else if((a=z[1].match(new RegExp("^<span class=\"animated\" data-imgs=\"(.+?)\">")))!=null)
				{
					var result=a[1];
				}
				else { console.log("Error 4"); break;}
			}
			else { console.log("Error 3"); break;}
			var item={"result":result,"output":output,"recipe":recipe,"shapeless":shapeLess};
			items[result]=item;
		}
		else { console.log("Error 2"); console.log(v[i]); break;}
	}
}
else console.log("Error 1");


function trim(s) {return s.replace(/^\s+/g,"").replace(/\s+$/g,"")}
function separate(s)
{
	var a=s.split(";");
	var na=[];
	for(var i in a)
	{
		na.push(trim(a[i]));
	}
	return na;
}


var nitems={};
for(var i in items)
{
	var results=separate(i);
	var recipes=[];
	var n=results.length;
	for(var j in items[i]["recipe"])
	{
		if(items[i]["recipe"][j]===null) recipes.push(null);
		else
		{
			var sepa=separate(items[i]["recipe"][j]);
			if(sepa.length>n) n=sepa.length;
			recipes.push(sepa);
		}
	}
	for(var j=0;j<n;j++)
	{
		var nresult;
		var noutput;
		if(results.length>1)
		{
			var nresultOutput=results[j].split(",");
			nresult=nresultOutput[0];
			noutput=nresultOutput.length===1 ? 1 : nresultOutput[1];
		}
		else
		{
			nresult=results[0];
			noutput=items[i]["output"];
		}
		var nshapeless=items[i]["shapeless"];
		var nrecipe=[];
		for(var k in recipes)
		{
			if(recipes[k]===null) nrecipe.push(null);
			else if(recipes[k].length===1) nrecipe.push(recipes[k][0]);
			else nrecipe.push(recipes[k][j]);
		}
		var nitem={"output":parseInt(noutput),"recipe":nrecipe,"shapeless":nshapeless ? 1 : 0};
		if(nitems[nresult]!==undefined) nitems[nresult].push(nitem);
		else nitems[nresult]=[nitem];
	}
}
function print(o)
{
	console.log(JSON.stringify(o,null,2));
}
print(nitems);