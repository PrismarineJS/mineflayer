#!/usr/bin/env node
if(process.argv.length!=4)
{
	console.log("Usage : node transform1_recipes.js <recipes.html> <recipes.json>");
	process.exit(1);
}
// recipes.html should be http://minecraft.gamepedia.com/Craft with all the recipes showed
// (in the browser : click on all the "show" then ctrl+s the page)

var fs=require('fs');

var input_file=process.argv[2];
var output_file=process.argv[3];

//open the file
var file=fs.readFileSync(input_file,"utf-8");
//parser
var v;
var items={};
// get all the grids
if((v=file.match(new RegExp("(<tr>\\s+<th>\\s+<p><a href=\"http://minecraft.gamepedia.com/" +
  "[\\s\\S]+?</table>\\s+</td>\\s+<td>[\\s\\S]*?</td>\\s+</tr>)","g")))!=null)
{
	for(var i in v)
	{
		var w;
        // parse a grid
		if((w=v[i].match(new RegExp("^<tr>\\s+<th>\\s+<p><a [\\s\\S]+?>([\\s\\S]+?)</a>(?:[\\s\\S]+?)?</p>[\\s\\S]*?</th>\\s+[\\s\\S]+?" +
          "<table class=\"grid-Crafting_Table\" cellpadding=\"0\" cellspacing=\"0\">([\\S\\s]+?)</table>[\\S\\s]+?</tr>$")))!=null)
		{
			var displayName=w[1];
			var shapeResult=w[2];
			var shapeLess;
			var x,y,z;
			var recipe=[];
			if((x=shapeResult.match(new RegExp("<td><span class=\"grid(?: animated)?\">[\\s\\S]+?</span></td>","g")))!=null)
			{
				for(var j in x)
				{
					var c;
					if((c=x[j].match(new RegExp("^<td><span class=\"grid(?: animated)?\">([\\s\\S]+?)</span></td>$")))!=null)
					{
						var d;
						if(c[1]==="<br>") recipe.push(null);
						else if((d=c[1].match(new RegExp("^(?:<span class=\"item\"><br></span>)*(?:<span class=\"item active\"><br></span>)?(?:<span class=\"item\"><br></span>)*" +
                    "<span class=\"item(?: active)?\"(?: title=\".+?\")?><a href=\".+?\"><img alt=\"(.+?)\"")))!=null)
						{
							recipe.push(d[1]);
						}
						else if((d=c[1].match(new RegExp("^<span class=\"animated\" data-imgs=\"(.+?)\">")))!=null)
						{
							recipe.push(d[1]);
						}
						else { console.log("Error 8"); console.log(c[1]); break;}
					}
					else { console.log("Error 7"); break;}
				}
              if(recipe.length!=9) { console.log("Error 9"); console.log(shapeResult); break;}
			}
			else { console.log("Error 6"); console.log(shapeResult); break;}
			if((y=shapeResult.match(new RegExp("<td class=\"shapeless\">([\\S\\s]*?)</td>")))!=null)
			{
				shapeLess=(y[1]!=="");
			}
			else { console.log("Error 5"); break;}
			var result,output;
			if((z=shapeResult.match(new RegExp("<td rowspan=\"3\"><span class=\"grid(?: animated)? output(?: animated)?\"><span class=\"item(?: active)?\"(?: title=\".+?\")?>([\\S\\s]+?)</span></span></td>")))!=null)
			{
				var a;
				if((a=z[1].match(new RegExp("^<a href=\".+?\"><img alt=\"(.+?)\"")))!=null)
				{
					result=a[1];
					if((a=z[1].match(new RegExp("<span class=\"number\"><a .+?>([0-9]+)</a></span>")))!=null)
					{
                      output=a[1];
					}
					else output=1;
				}
				else if((a=z[1].match(new RegExp("^<span class=\"animated\" data-imgs=\"(.+?)\">")))!=null)
				{
					result=a[1];
				}
				else { console.log("Error 4"); console.log(z[1]); break;}
              if((output===null || output==="") && (result==="" || result===null))  { console.log("Error 10"); console.log(z[1]); break;}
			}
			else { console.log("Error 3"); console.log(shapeResult); break;}
			var item={"result":result,"output":output,"recipe":recipe,"shapeless":shapeLess};
            //TODO: handles multiple recipes for one output item
            if(!items[result])
              items[result]=[];
			items[result].push(item);
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
  for(var l in items[i])
  {
    var results = separate(i);
    var recipes = [];
    var n = results.length;
    for (var j in items[i][l]["recipe"]) {
      if (items[i][l]["recipe"][j] === null) recipes.push(null);
      else {
        var sepa = separate(items[i][l]["recipe"][j]);
        if (sepa.length > n) n = sepa.length;
        recipes.push(sepa);
      }
    }
    for (var j = 0; j < n; j++) {
      var nresult;
      var noutput;
      if (results.length > 1) {
        var nresultOutput = results[j].split(",");
        nresult = nresultOutput[0];
        noutput = nresultOutput.length === 1 ? 1 : nresultOutput[1];
      }
      else {
        nresult = results[0];
        noutput = items[i][l]["output"];
      }
      var nshapeless = items[i][l]["shapeless"];
      var nrecipe = [];
      for (var k in recipes) {
        if (recipes[k] === null) nrecipe.push(null);
        else if (recipes[k].length === 1) nrecipe.push(recipes[k][0]);
        else nrecipe.push(recipes[k][j]);
      }
      var nitem = {"output": parseInt(noutput), "recipe": nrecipe, "shapeless": nshapeless ? 1 : 0};
      if (nitems[nresult] !== undefined) nitems[nresult].push(nitem);
      else nitems[nresult] = [nitem];
    }
  }
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

print(nitems,output_file);