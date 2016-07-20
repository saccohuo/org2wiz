var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var omOptionFileName = org_mode_pluginPath + "options.ini";
var omDefaultTag = objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag");
// objWindow.ShowMessage(omOptionFileName.toString(), "omOptionFileName",0);

var newomDefaultTag = objCommon.InputBox("默认标签", "添加 Org2Wiz 默认添加的标签，例如 “原创”。对大小写敏感。", omDefaultTag);
if(newomDefaultTag != ""){
  objCommon.SetValueToIni(omOptionFileName, "Options", "DefaultTag", newomDefaultTag.toLowerCase());
}
