var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var CustomOptionFile = "custom.ini";
var OptionFile = "options.ini";
var CurOptionFile = (objCommon.PathFileExists(org_mode_pluginPath + CustomOptionFile)) ? CustomOptionFile : OptionFile;
var omOptionFileName = org_mode_pluginPath + CurOptionFile;
var omDefaultTag = objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag");

var newomDefaultTag = objCommon.InputBox("默认标签", "添加 Org2Wiz 默认添加的标签，使用半角分号分隔。\n若不添加任何标签，请输入“noTag”。\n 对大小写敏感。", omDefaultTag);
if(newomDefaultTag != ""){
  objCommon.SetValueToIni(omOptionFileName, "Options", "DefaultTag", newomDefaultTag);
}
