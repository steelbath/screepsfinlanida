var curroom = Game.spawns['Spawn1'].room;
var islands=[];

/*main lines required
  if(Memory.scanflag==0){ scan.getWallMap(); ; Memory.scanflag=1;}
  scan.colorize();
 * */

function getWallMap() {
    if (!Memory.scan) Memory.scan={};
    let results = curroom.lookAtArea(0, 0, 49, 49, false);
    for (var i = -1; i<=51; i++) islands[i]=[];
    let highest=1;
    for(var y in results){
        for(var x in results[y]){
            let terrainobj = results[y][x].find(atr => atr.type==='terrain');
			let current=0;
            if (terrainobj.terrain === 'wall'){
				if (islands[y][x-1]) {current=islands[y][x-1];}
				if (islands[y-1][x-1] && (current == 0)){current=islands[y-1][x-1];}
		    	if (islands[y-1][x] && (current == 0)){current=islands[y-1][x];}
    			if (islands[y-1][parseInt(x)+1]){
					if(islands[y-1][parseInt(x)+1] != current && current!=0) ASSIMILATE(current,islands[y-1][parseInt(x)+1]);
					current=islands[y-1][parseInt(x)+1];
				}
				if(current==0){islands[y][x]=highest; highest+=1;}
				else islands[y][x]=current;
                if(!Memory.scan[islands[y][x]]) {Memory.scan[islands[y][x]]=[];}
				Memory.scan[islands[y][x]].push({y,x});
            } 
        } 
    }
    refineEdge();
    tidyup();
}


function ASSIMILATE(source,target){
	let currenttar=0;
	while(Memory.scan[source].length > 0){
	if (Memory.scan[target][currenttar] == undefined || Memory.scan[source][0].y <= Memory.scan[target][currenttar].y || (Memory.scan[source][0].y == Memory.scan[target][currenttar].y 
		&& Memory.scan[source][0].x <= Memory.scan[target][currenttar].x)){
		islands[Memory.scan[source][0].y][Memory.scan[source][0].x] = target;
        Memory.scan[target].splice(currenttar,0,Memory.scan[source].shift());
    } currenttar+=1;
	}
}

function refineEdge(){
	if (!Memory.edges) Memory.edges = {}; 
	let keys = Object.keys(Memory.scan);
    let loopamount=Object.keys(Memory.scan).length;
    for(i=1;i<=loopamount;i++){
		if(!Memory.edges[i]) Memory.edges[i]=[];
		let lastfilled =0;
		for (var c in Memory.scan[i]){
		    let y = parseInt(Memory.scan[i][c].y);
		    let x = parseInt(Memory.scan[i][c].x);
			if(!(islands[y][x-1]) && x != 0  || !(islands[y-1][x]) && y !=0 || !(islands[y][x+1]) && x != 49 || !(islands[y+1][x]) && y !=49){
				Memory.edges[i][lastfilled] = {y,x};
				lastfilled+=1;
			}		
		    
		}

}
}
				

function tidyup(){
    let lastfilled=-1;
    let keys = Object.keys(Memory.scan);
    let loopamount=Object.keys(Memory.scan).length;
    for(i=0;i<loopamount+1;i++){
		if (Memory.scan[i]!=undefined && Memory.scan[i].length != 0){	
			Memory.scan[lastfilled+1]=Memory.scan[i];
			Memory.edges[lastfilled+1]=Memory.edges[i];
			lastfilled+=1;			
			if(i!=lastfilled) {delete Memory.scan[i]; delete Memory.edges[i]}
		} else {delete Memory.scan[i]; delete Memory.edges[i]}
    }
}


var COLOR_NAMES = ["AliceBlue","Aqua","Aquamarine","Azure","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGreen","DarkKhaki","DarkMagenta",
"DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey",
"DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen",
"Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo",
"Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow",
"LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue",
"LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen",
"MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite",
"Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip",
"PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell",
"Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise",
"Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

function colorize(){
    let z=0
    for (var island in Memory.edges){
        if (z==COLOR_NAMES.length)z=0;
        let color1=COLOR_NAMES[z];
        z++;
        for(var c in Memory.edges[island]){
            if(Memory.edges[island][c]){
            let x=parseInt(Memory.edges[island][c].x); let y = parseInt(Memory.edges[island][c].y);
            curroom.visual.circle(x, y, {fill: color1});}
    }
        
}
}
  
  
module.exports ={
    getWallMap,
    colorize,
    tidyup
};