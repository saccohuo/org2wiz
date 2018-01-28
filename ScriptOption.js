var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var CustomOptionFile = "custom.ini";
var OptionFile = "options.ini";
var CurOptionFile = (objCommon.PathFileExists(org_mode_pluginPath + CustomOptionFile)) ? CustomOptionFile : OptionFile;
var omOptionFileName = org_mode_pluginPath + CurOptionFile;
var omMJOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "ScriptOption");
var tempConfirm = 0;

var newomMJOption = objCommon.GetIntValue2("笔记是否保留脚本", "0 不保留\n1 保留", parseInt(omMJOption,10), 0, 1, tempConfirm);
// var newomMJOption = objCommon.GetIntValue2("笔记是否保留脚本", "0 不保留\n1 保留", parseInt(omMJOption,10), 0, 1, function(ret){
//   alert(ret);
//   tempConfirm = ret;
// });
var newomMJOpt = parseInt(newomMJOption,10);
if(newomMJOpt == 0 || newomMJOpt == 1){
// if((tempConfirm == true) && (newomMJOpt == 0 || newomMJOpt == 1)){
  objCommon.SetValueToIni(omOptionFileName, "Options", "ScriptOption", newomMJOpt);
}
