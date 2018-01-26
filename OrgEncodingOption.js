var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var omOptionFileName = org_mode_pluginPath + "options.ini";
var omEncodingOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "OrgEncodingOption");
// objWindow.ShowMessage(omEncodingOption.toString(), "omOptionFileName",0);
var tempConfirm = 0;

var newomEncodingOption = objCommon.GetIntValue2("Org编码选项", "值为0，使用 UTF-8 编码；值为1，使用 UTF-8-BOM 编码；值为2，使用 GBK 编码。", parseInt(omEncodingOption,10), 0, 2, tempConfirm);
// objWindow.ShowMessage(tempConfirm.toString(), "omOptionFileName",0);
// objWindow.ShowMessage(newomEncodingOption.toString(), "omOptionFileName",0);
// objWindow.ShowMessage(typeof newomEncodingOption, "omOptionFType",0);
if(newomEncodingOption == 0 || newomEncodingOption == 1 || newomEncodingOption == 2){
// if((tempConfirm == true) && (newomEncodingOption == 0 || newomEncodingOption == 1 || newomEncodingOption == 2)){
  objCommon.SetValueToIni(omOptionFileName, "Options", "OrgEncodingOption", newomEncodingOption);
}
