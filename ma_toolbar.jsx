/*
    ma_toolbar
    Michael Auerswald <michael@flipswitchingmonkey.com>
*/

// Global object
// encapsulates all other variables "global" to this script 
var ma_toolbar = {};

// this should be the path to the folder containing the script and icons folder
ma_toolbar.scriptPath = (new File($.fileName)).path;
ma_toolbar.resourcePath = (ma_toolbar.scriptPath + "/");
ma_toolbar.iconPath = (ma_toolbar.resourcePath);
ma_toolbar.settingsPath = (ma_toolbar.scriptPath + "/ma_toolbar.xml");
ma_toolbar.iconSize = 32;
ma_toolbar.iconMargin = 0;
ma_toolbar.tools = new Array();
ma_toolbar.xml = new XML();

ma_toolbar.isWin = false;
if ( ($.os).search(/windows/i) != -1) ma_toolbar.isWin = true; // a few events are triggered differently on windows vs osx

ma_toolbar.newLine = '\r';
if (ma_toolbar.isWin) ma_toolbar.newLine = '\r\n';

// since Javascript does not offer a full replaceAll function for String, this is a replacement
String.prototype.replaceAll = function(search, replace)
{
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if(!replace) 
        return this;

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

// object type to contain a Tool definition for each button to appear on the toolbar
ma_toolbar.Tool = function() {
    this.label = "";
    this.path = "";
    this.icon = "";
    this.iconlabel = "";
    this.id = 0;
    this.script = ""
    this.width = 32;
}

ma_toolbar.Tool.prototype.fromXML = function(xml, id) {
    this.label = ma_toolbar.xml.tool[i].@label;
    this.path = ma_toolbar.scriptPath + "/../" + ma_toolbar.xml.tool[i].@path;
    if (!(new File(this.path)).exists)
    {
        alert("Script " +  this.label + " not found");
    }
    this.script = ma_toolbar.xml.tool[i].text();
    var iconname = ma_toolbar.xml.tool[i].@icon;
    this.icon = ma_toolbar.iconPath + iconname;
    if (!(new File(this.icon)).exists || iconname=="")
    {
        this.icon = undefined;
        this.iconlabel = iconname.toString();
    }
    this.width = ma_toolbar.xml.tool[i].@width;
    if(id) this.id = id;
}

function readSettingsFromXML() {
    var xmlFile = new File(ma_toolbar.settingsPath);
    var result = undefined;
    var xml;
    if (!xmlFile.exists)
    {
        alert("Can not find settings file - please make sure you installed the script correctly.");
        quit();
    }
    else
    {
        result = xmlFile.open("r");
        if (result)
        {
            var xmlFileContent = xmlFile.read();
            xmlFile.close();
            xml = new XML(xmlFileContent);
        }
        else
        {
            alert("Can not open preset file - please make sure you installed the script correctly.");
            quit();    
        }
    }
    return xml;
}

function runCommand(cmdId)
{
    try{
        if(ma_toolbar.tools[cmdId].script == "")
        {
            $.evalFile(ma_toolbar.tools[cmdId].path);
        }
        else
        {
            aftereffects.executeScript(ma_toolbar.tools[cmdId].script);
        }
    } catch(err) {
        alert(err.message + "\nCould not launch " + ma_toolbar.tools[cmdId].label + " from path " + ma_toolbar.tools[cmdId].path);
    }
}

function createUI(thisObj)
{
    var dlg = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ma-toolbar", undefined, {resizeable:true});
    dlg.orientation = "column";
            
    for (var i=0; i < ma_toolbar.xml.tool.length(); i++)
    {
        var scriptBtn;
        var width = (ma_toolbar.tools[i].width=="") ? ma_toolbar.iconSize : ma_toolbar.tools[i].width; 
        if(ma_toolbar.tools[i].icon)
            scriptBtn = dlg.add("iconbutton", "x:"+ma_toolbar.iconMargin+",y:"+ma_toolbar.iconMargin+"+,width:"+width+",height:"+ma_toolbar.iconSize, ma_toolbar.tools[i].icon, {style: 'toolbutton'});
        else
            scriptBtn = dlg.add("button", "x:"+ma_toolbar.iconMargin+",y:"+ma_toolbar.iconMargin+"+,width:"+width+",height:"+ma_toolbar.iconSize, ma_toolbar.tools[i].iconlabel, {style: 'toolbutton'});
        scriptBtn.ID = i;
        scriptBtn.helpTip = ma_toolbar.tools[i].label;
        scriptBtn.onClick = function(){
            runCommand(this.ID);
        }
    }
    dlg.onResizing = dlg.onResize = function () {
        this.layout.resize();
            if (this.size[0] < this.size[1])
            {
                dlg.orientation = "column";
            }
            else
            {
                dlg.orientation = "row";
            }
        }            
   
    return dlg;
}

ma_toolbar.xml = readSettingsFromXML();
ma_toolbar.tools = new Array(ma_toolbar.xml.tool.length());
for (var i=0; i < ma_toolbar.xml.tool.length(); i++)
{
    ma_toolbar.tools[i] = new ma_toolbar.Tool();
    ma_toolbar.tools[i].fromXML(ma_toolbar.xml.tool[i], i);
}    

ma_toolbar.dlg = createUI(this);
if (ma_toolbar.dlg instanceof Window) ma_toolbar.dlg.show();
