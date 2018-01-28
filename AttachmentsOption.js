var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var CustomOptionFile = "custom.ini";
var OptionFile = "options.ini";
var CurOptionFile = (objCommon.PathFileExists(org_mode_pluginPath + CustomOptionFile)) ? CustomOptionFile : OptionFile;
var omOptionFileName = org_mode_pluginPath + CurOptionFile;
var omAttachmentsOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
var tempConfirm = 0;

var newomAttachmentsOption = objCommon.GetIntValue2("附件选项", "值为0，不显示 AddAttach；值为1或2，显示 AddAttach。值为1，点击添加同名 tex 文件到附件；值为2，点击添加同名 tex、pdf 文件到附件。修改需重启为知生效。", parseInt(omAttachmentsOption,10), 0, 2, tempConfirm);
if(newomAttachmentsOption == 0 || newomAttachmentsOption == 1 || newomAttachmentsOption == 2){
// if((tempConfirm == true) && (newomAttachmentsOption == 0 || newomAttachmentsOption == 1 || newomAttachmentsOption == 2)){
  objCommon.SetValueToIni(omOptionFileName, "Options", "AttachmentsOption", newomAttachmentsOption);
}
