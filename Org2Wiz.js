var objDB = objApp.Database;
// objApp.CurPluginAppPath
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
// var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI"); // CreateWizObject 是内部对象，CreateActiveXObject 是外部对象
// objWindow.ShowMessage(objCommon.toString(), "objCommon",0);
// objCommon.OptionsDlg(0);
var CustomOptionFile = "custom.ini";
var OptionFile = "options.ini";
var CurOptionFile = (objCommon.PathFileExists(org_mode_pluginPath + CustomOptionFile)) ? CustomOptionFile : OptionFile;
var omOptionFileName = org_mode_pluginPath + CurOptionFile;
// var omOptionFileName = org_mode_pluginPath.replace(/\\/g,'\\\\') + "options.ini";
// objWindow.ShowMessage(omOptionFileName.toString(), "omOptionFileName",0);

var MathjaxUrl = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";

var hiddenCmd = org_mode_pluginPath + 'RunHidden.exe';

Date.prototype.orgtime = function() {
  var year = this.getFullYear();
  var mm = trimTime(this.getMonth() + 1); // getMonth() is zero-based
  var day = trimTime(this.getDate());

  var hour = trimTime(this.getHours());
  var min = trimTime(this.getMinutes());
  // var sec = this.getSeconds();

  function trimTime(ret){
    return (ret>9 ? '' : '0')+ret;
  }

  var date = [year, mm, day].join('-');
  var time = [hour, min].join(':');
  return [date, time].join(' ');
  // return [[this.getFullYear(),this.getMonth()+1,this.getDate()].join('-'), [this.getHours(), this.getMinutes()].join(':')].join(' ');
};

//-------------Init button complete-----------------------
InitOMButton();

//--------------- check attachment complete---------------

function OnOMButtonClicked(){
  var objDocument = objWindow.CurrentDocument;
  //判断当前 Document 的后缀转换成纯小写是不是 .org
  if(MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase() != '.org')
    return;

  var omEncodingOption = otw_getEncodingOption();
  var omCopyDate = otw_getCopyDate();
  var templateFilename = "Default-UTF8.org";

  if(omEncodingOption === 'utf8'){
    templateFilename = "Default-UTF8.org";
  }else if(omEncodingOption === 'utf8bom'){
    templateFilename = "Default-UTF8-BOM.org";
  }else if(omEncodingOption === 'unicode'){
    templateFilename = "Default-UTF16LE.org";
  }else if(omEncodingOption === 'gbk'){
    templateFilename = "Default-GBK.org";
  }else{
    templateFilename = "Default-UTF8.org";
  }

  var orgAttach = GetOrg(objWindow.CurrentDocument);
  if(orgAttach !== null){
    orgAttach = orgAttach + '.org';
  }else{
    AddOrgAttach(objWindow.CurrentDocument,templateFilename);
    if(omCopyDate === 'nop'){
    }else if(omCopyDate === 'copyall' || omCopyDate === 'created'){
      objCommon.CopyTextToClipboard(objDocument.DateCreated.orgtime());
    }else if(omCopyDate === 'updated'){
      objCommon.CopyTextToClipboard(objDocument.DateModified.orgtime());
    }else{
    }
    return;
  }

  //-----------------------------------------------------------------------------------------------
  //export org to html with emacs
  //-----------------------------------------------------------------------------------------------

  var offlineMJpath = org_mode_pluginPath.replace(/\\/g,'/') + "MathJax/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML";

  // emacs --batch -q --no-site-file --visit "test.org" --eval="(setq org-html-mathjax-template \"\")(setq org-html-mathjax-options '((path \"https://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML\")(scale \"100\")(align \"center\")(indent \"2em\")(mathml nil)))" --funcall org-html-export-to-html
  // 终于解决了 emacs -q 生成 html 时候 MathJax 的 Online 路径替换问题。还需要解决生成的 html 被导入到为知的文档中时替换为本地临时路径的问题
  // 这个字符串是在 cmd 里面直接执行的时候需要的字符串，再下面那一行是对这一行进行了一次转义。
  // cmd 中对左右尖括号的转义用上三角 ^ ，而不是用反斜杠 \ 。问号在 cmd 中需要转义，在 shell 中不需要转义
  // 作为新手写这些真的好累。 What The Fuck String and Escape
  // strMJpath = "(setq org-html-mathjax-options '((path \"https://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML\")(scale \"100\")(align \"center\")(indent \"2em\")(mathml nil)))(setq org-html-mathjax-template \"^<script type=\\\"text/javascript\\\" src=\\\"%PATH\\\"^>^</script^>\")";
  // var strOnlinePath = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  RegExp.emacsescape= function(s) {
    return s.replace(/\?/g, '\\\\$&');
  };
  var MathjaxUrlEmacs = RegExp.emacsescape(MathjaxUrl);
  // MathjaxUrlEmacs = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js\\?config=TeX-MML-AM_CHTML";
  var strOnlinePath = "(setq org-html-mathjax-options '((path \\\"" + MathjaxUrlEmacs + "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  // "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js\\?config=TeX-MML-AM_CHTML"
  var strOfflinePath = "(setq org-html-mathjax-options '((path \\\"" + offlineMJpath +  "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  var strMJTpl = "(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";
  var strNoMJTpl = "(setq org-html-mathjax-template \\\"\\\")";

  // 不知道为什么这三个 emacs 参数的路径和模板顺序设置还不太一样，没有 mathjax 的模板要放在路径设置前面，其他的反之
  var strOnlineMJ = strOnlinePath + strMJTpl;
  var strOfflineMJ = strOfflinePath + strMJTpl;
  var strNoMJ = strNoMJTpl + strOnlinePath;
  var strMJSetting = strNoMJ;
  // strOnlineMJ = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";
  // strNoMJ = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\\\")";
  // strOfflineMJ = "(setq org-html-mathjax-options '((path \\\"" + offlineMJpath +  "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";

  
  strMJSetting = strOnlineMJ;

  // var strCodingSetting = '(set-language-environment \\\"UTF-8\\\") (setq-default make-backup-files nil)';
  var strCodingSetting = '(set-language-environment \\\"UTF-8\\\")';
  var strBackupSetting = '(setq make-backup-files nil)';
  
  var strCmd = hiddenCmd;
  var strParam = 'emacs --batch -q --no-site-file --eval=\"' + strCodingSetting + '\" --eval=\"' + strBackupSetting + '\" --visit \"' + orgAttach + '\" --eval=\"' + strMJSetting + '\" --funcall org-html-export-to-html';

  objCommon.RunExe(strCmd, strParam, true);

  var HtmlFile = orgAttach.replace(/\.org$/i,'.html');
  if(!objCommon.PathFileExists(HtmlFile)){
    objWindow.ShowMessage("Cannot find html file exported by emacs.", "Org2Wiz Error",0);
    return;
  }

  //-----------------------------------------------------------------------------------------------
  // update html into Wiznote note(remove online Mathjax first)
  //-----------------------------------------------------------------------------------------------
  
  // objWindow 的对象类型就是为知笔记主窗口对象 (IWizExplorerWindow)
  // objWindow.CurrentDocument 的对象类型是 WizDocument
  // 获得/设置文档的类型，例如document，note，journal，contact等等

  // 更改文档数据，通过一个HTML文件名和对应的URL来更新。
  // nFlags 的值设置为 0x0006，表示“显示进度”和“包含 html 中的脚本”
  // 可以使用 UpdateDocument、UpdateDocument5 和 UpdateDocument6 来更新文档数据，但是更新的时候资源管理器不要打开为知的 temp 文件夹

  var omMJOption = otw_getScriptOption();
  var otw_ScriptOption = 0x0006;

  if(omMJOption === 'no'){
    otw_ScriptOption = 0x0004;
  }else if(omMJOption === 'yes'){
    otw_ScriptOption = 0x0006;
  }else{
    otw_ScriptOption = 0x0004;
  }

  if((otw_ScriptOption & 0x0002) !== 0){
    // alert(otw_ScriptOption);
    var doc = objApp.Window.CurrentDocumentBrowserObject;
    // alert(typeof doc);
    var html_str = objCommon.LoadTextFromFile(HtmlFile);
    // alert(html_str);
    var html_str_new = html_str;
    doc.ExecuteScript(otw_removeScript.toString(),function(){
      doc.ExecuteFunction2("otw_removeScript", html_str, MathjaxUrl, function(ret){
        if(ret!=null){
          html_str_new = ret;
          // objCommon.SaveTextToFile(HtmlFile.concat(".txt"),html_str_new,"utf-8-bom");
        }
        else{
          // objCommon.SaveTextToFile(HtmlFile.concat(".txt"),"function \"otw_removeScript\" return value is null.","utf-8-bom");
        }
        objWindow.CurrentDocument.UpdateDocument3(html_str_new, otw_ScriptOption); // 包含脚本，显示进度
      });
    });
  }
  else
    objWindow.CurrentDocument.UpdateDocument(HtmlFile, otw_ScriptOption); // 不包含脚本，只显示进度

  // objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0006); //包含脚本，显示进度
  // objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0000);
  // objWindow.CurrentDocument.UpdateDocument6(HtmlFile, HtmlFile, 0x0006);
  // objWindow.CurrentDocument.UpdateDocument5(HtmlFile);

  var omHtmlOption = otw_getHtmlOption();
  if(omHtmlOption === 'yes'){
  }else if(omHtmlOption === 'no'){
    // 删除 emacs 导出的 html 文件
    objCommon.RunExe(hiddenCmd, "cmd /c del /f /q \"" + HtmlFile + "\"", true);
  }else{
  }

  //-----------------------------------------------------------------------------------------------
  // add default tags or update tags from org into note
  //-----------------------------------------------------------------------------------------------
  // objApp.AddGlobalScript(org_mode_pluginPath + "lib/read-info.js");
  // objApp.RunScriptFile(org_mode_pluginPath + "lib/read-info.js", 'javascript');
  var omTagOption = otw_getTagOption();
  if(omTagOption === 'nop'){
  }else if(omTagOption === 'adddefault'){
    var omDefaultTag = otw_getDefaultTag();
    if(omDefaultTag !== "" && omDefaultTag !== "noTag"){
      otw_addTags(objDocument,omDefaultTag);
    }
  }else if(omTagOption === 'updatefromorg'){
    var data = new Object();
    // data.source = orgAttach.replace(/\\/g, '/');
    data.source = orgAttach;
    data.tmpsource = data.source + '~';

    var checkCmd = hiddenCmd;
    var checkParam = 'python \"' + org_mode_pluginPath.replace(/\\/g, '/') + 'addbom.py' + '\" ' + '\"' + data.source.replace(/\\/g, '/') + '\"' + ' \"' + data.tmpsource.replace(/\\/g, '/') + '\"';

    // 这里现在还是没办法获取到返回值，所以暂时只能对所有情况都把文件重新拷贝一份，其实不太合适
    var BOMmsg = objCommon.RunExe(checkCmd, checkParam, true);
    
    data.content = objCommon.LoadTextFromFile(data.tmpsource);

    objCommon.RunExe(hiddenCmd, 'cmd /c del /f /q \"' + data.tmpsource + '\"', true);
    
    // Objcommon.SaveTextToFile(data.source+'.txt', data.content, 'unicode');
    // objCommon.SaveTextToFile(data.source+'.txt', data.content, 'gbk');
    // alert(data.content);
    data.tags = '';
    data.setTags = function(tagsStr){
      this.tags = otw_stringTrim(tagsStr, ',');
    };

    data = read_info(data);

    objDocument.TagsText = data.tags;
  }else{
  }

  //-----------------------------------------------------------------------------------------------
  // mark this doc to be rendered with Mathjax in future
  //-----------------------------------------------------------------------------------------------
  otw_MarkAsMathjax();

  //-----------------------------------------------------------------------------------------------
  // copy created time of note into clipboard
  //-----------------------------------------------------------------------------------------------
  if(omCopyDate === 'nop' || omCopyDate === 'created'){
  }else if(omCopyDate === 'copyall' || omCopyDate === 'updated'){
    objCommon.CopyTextToClipboard(objDocument.DateModified.orgtime());
  }else{
  }
}

//-------------- Add Org2Wiz button and function OnOMButtonClicked-----------------------
function InitOMButton(){
  objWindow.AddToolButton("document", "OMButton", "Org2Wiz", "", "OnOMButtonClicked");

  var omAttachmentsOption = otw_getAttachOption();
  if((omAttachmentsOption === 'addtex') || (omAttachmentsOption === 'addpdf') || (omAttachmentsOption === 'addtexpdf')){
    objWindow.AddToolButton("document", "OMAttach", "AddAttach", "", "OnOMAttachClicked");
  }
}

function OnOMAttachClicked(){
  var omAttachmentsOption = otw_getAttachOption();
  
  var curDoc = objWindow.CurrentDocument;

  var orgName = GetOrg(curDoc);
  if(orgName === null){
    return;
  }
  var attachPath = curDoc.AttachmentsFilePath;

  if(orgName !== ""){
    if((omAttachmentsOption === 'addtex') || (omAttachmentsOption == 'addtexpdf')){
      var texFile = curDoc.AddAttachment(orgName + ".tex");
    }
    if((omAttachmentsOption === 'addpdf') || (omAttachmentsOption == 'addtexpdf')){
      var pdfFile = curDoc.AddAttachment(orgName + ".pdf");
    }
  }

  return;
}

//---------------------- get all options ------------------------
//---------------------------------------------------------------
function otw_getDefaultTag(){
  return otw_stringTrim(objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag"));
}

function otw_getTagOption(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "TagOption");
}

function otw_getAttachOption(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
}

function otw_getEncodingOption(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "OrgEncodingOption");
}

function otw_getScriptOption(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "ScriptOption");
}
function otw_getHtmlOption(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "HtmlOption");
}
function otw_getCopyDate(){
  return objCommon.GetValueFromIni(omOptionFileName, "Options", "CopyDate");
}

function otw_stringTrim(str, dlmt_in=';', dlmt_out=';'){
  if(typeof str === 'string'){
    var strArray = str.split(dlmt_in);
    strArray = strArray.filter(el => el.trim() != ''); // for ES2015
    strArray = Array.from(new Set(strArray));  //remove duplicate elements
    str = strArray.join(dlmt_out);
    return str;
  }
  return '';
}

function otw_stringTrimArray(str, dlmt_in=';'){
  if(typeof str === 'string'){
    var strArray = str.split(dlmt_in);
    strArray = strArray.filter(el => el.trim() != ''); // for ES2015
    strArray = Array.from(new Set(strArray));  //remove duplicate elements
    return strArray;
  }
  return [];
}

//---------------------------------------------------------------
function otw_addTags(curdoc, tags){
  var DocTags = otw_stringTrim(curdoc.TagsText);
  tags = otw_stringTrim(tags);
  var DocTagsNew = otw_stringTrim(DocTags + ';' + tags); // concat, trim and remove duplicate items
  curdoc.TagsText = DocTagsNew;
}


//---------------------Get org file from the document attachments-------------
function GetOrg(curDoc){
  // 后续还需要检查附件是否下载到本地 Downloaded API
  // 已经修改为找到 org 文件才可以，还需要修改来让插件自动找到合适的 org 附件，或者找到多个的情况提示选择
  var AttachCount = curDoc.Attachments.Count;
  if(AttachCount === 0){
    return null;
  }

  var OrgName = 0;
  var OrgFilename = 0;

  for (var AttachNum = 0; AttachNum < AttachCount; AttachNum++ ) {
    OrgFilename =  curDoc.Attachments.Item(AttachNum).FileName;
    if(MFGetFileExtension(OrgFilename).toLowerCase() === '.org'){
      OrgName =  OrgFilename.replace(/.org$/, '');
      break;
    }
  }

  if(MFGetFileExtension(OrgFilename).toLowerCase() === '.org'){
    return OrgName;
  }else{
    // objWindow.ShowMessage("There is no org file in this document!", "Warning",0);
    return null;
  }
}

//---------------------Add .org Attachment for new .org Document----------------
function AddOrgAttach(curDoc,templateFilename){
  var newomOrgAttach = objCommon.InputBox("org 文件名", "请输入需要添加的 org 附件的文件名（可包含或不包含 .org 后缀，但必须为 Windows 文件名允许的字符串）：", "default");
  if(MFGetFileExtension(newomOrgAttach).toLowerCase() !== '.org'){
    newomOrgAttach = newomOrgAttach + ".org";
  }
  else{
    newomOrgAttach = newomOrgAttach;
  }

  var templateFileRelativePath = "Templates/";
  var TemplateFile = org_mode_pluginPath + templateFileRelativePath + templateFilename;
  var attachPath;
  var destinationFile;

  // 确认该 Document 没有包含 org 附件
  if(newomOrgAttach !== "" && newomOrgAttach !== ".org"){
    // 先添加一个附件到 Document，防止没有创建附件文件夹
    var localTemplateFileHdl = curDoc.AddAttachment(TemplateFile);
    attachPath = curDoc.AttachmentsFilePath;
    var localTemplateFile = attachPath + templateFilename;
    destinationFile = attachPath + newomOrgAttach;
    // 附件文件夹下，复制模板附件文件到org附件文件
    objCommon.CopyFile(localTemplateFile,destinationFile);
    // 重命名附件文件名
    // objCommon.RunExe("cmd", "/c ren \"" + localTemplateFile + "\" \"" + newomOrgAttach + "\"", true);
    //添加新附件
    var localOrgFileHdl = curDoc.AddAttachment(destinationFile);
    //删除原附件
    localTemplateFileHdl.Delete();
  }
  else{
    objWindow.ShowMessage("输入的文件名 "+ newomOrgAttach + "错误", "Error-org-attach-filename",0);
  }
  return;
}


//-------------------Add Mathjax to Document-----------------------
//-----------------------------------------------------------------
function otw_MarkAsMathjax(){
  var objDocument = objWindow.CurrentDocument;
  if (objDocument) {
    objDocument.Type = "Mathjax";
    objApp.AddGlobalScript(org_mode_pluginPath + "MathjaxCurrentDocument.js");
  }
}

function insertScript(mj_url){
  var elem = document.createElement("script");
  elem.src = mj_url;
  document.head.appendChild(elem);
}

function insertBeforeScript(mj_url){
  var elem = document.createElement("script");
  elem.src = mj_url;

  var src_list = document.querySelectorAll("script");
  var div_list = document.querySelectorAll("div#MathJax_Message");
  for(var i=0;i<src_list.length;i++){
    var src_str = src_list[i].getAttribute("src");
    var str_match_cdn = (src_str!=null) ? src_str.match(/^index_files\/MathJax_\d+\.js$/) : null;
    if(str_match_cdn!=null){
      document.head.insertBefore(elem,src_list[i]);
      return 1;
    }
  }
  return null;
}

function otw_removeScript(html_str,mj_url){
  var div = document.createElement("div");
  if(typeof html_str == "string")
    div.innerHTML = html_str;
  var src_list = div.querySelectorAll("script[src]");
  for(var i=0;i<src_list.length;i++){
    var src_str = src_list[i].getAttribute("src");
    RegExp.escape= function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    var str_match_cdn = (src_str!=null) ? src_str.match(RegExp.escape(mj_url)) : null;
    if(str_match_cdn!=null){
      var tmp = document.createElement("div");
      tmp.appendChild(src_list[i]);
      var html_re = new RegExp(RegExp.escape(tmp.innerHTML),"gi");
      html_str = html_str.replace(html_re,"");
      return html_str;
    }
  }
  return null;
}

function replaceScript(mj_url){
  var new_elem = document.createElement("script");
  new_elem.src = mj_url;

  var src_list = document.querySelectorAll("script");
  var div_list = document.querySelectorAll("div#MathJax_Message");
  for(var i=0;i<src_list.length;i++){
    var src_str = src_list[i].getAttribute("src");
    var text_str = src_list[i].textContent;
    var str_match_cdn = (src_str!=null) ? src_str.match(/^index_files\/MathJax_\d+\.js$/) : null;
    var str_match_hub = (text_str!=null) ? text_str.match(/MathJax\.Hub\.Config/) : null;
    if(str_match_cdn!=null){
      // document.head.replaceChild(new_elem,src_list[i]);
      document.head.removeChild(src_list[i]);
    }
  }

  document.body.appendChild(new_elem);
}


function otw_addMathjaxScript() {
  var doc = objApp.Window.CurrentDocumentBrowserObject;
  doc.ExecuteScript(insertScript.toString(),function(){
    doc.ExecuteFunction1("insertScript", MathjaxUrl, null);
  });
}

function otw_addMathjaxScriptToCurrentDocument() {
  otw_addMathjaxScript();
}

function otw_onHtmlDocumentCompleted(doc) {
  var objDocument = objApp.Window.CurrentDocument;

  if (objDocument) {
    if (objDocument.Type == "Mathjax") {
      // alert(objDocument.Type);
      otw_addMathjaxScript();
    }
  }
}



//-----------------------------------------------------------------
//-----------------------------------------------------------------
// 这个地方似乎没有考虑没有后缀名的文件
function MFGetFileExtension(Fstr){
  pos = Fstr.lastIndexOf('.');
  if(pos == -1)
    return "";
  else
    return Fstr.substr(pos);
}

//-----------------------------------------------
// read info from org file
//-----------------------------------------------
function read_info(data) {
  var _items = {};
  read_in();
  read_all();
  return data;

  function split2(str, delim) {
    var parts = str.split(delim);
    return [parts[0], parts.splice(1, parts.length).join(delim)];
  }

  function read_in() {
    var r = data.content.match(/#\+[a-zA-Z]*:.*\n/g);
    if (r) {
      for (var i = 0; i < r.length; i++) {
        var parts = split2(r[i], ':');
        var key = parts[0].substring(2).trim();
        if(!_items[key])
          _items[key] = parts[1].trim();
      }
    }
  }

  function read_title() {
    if (_items.TITLE) {
      data.title = _items.TITLE;
    }
  }

  // function convert_org_time(org_time) {
  //   return moment(Date.parse(org_time.replace(/[^0-9:-]/g, ' ')));
  // }

  // function read_date() {
  //   if (_items.DATE) {
  //     data.date = convert_org_time(_items.DATE);
  //   }
  // }

  function read_tags(){
    if(_items.TAGS){
      // data.setTags(_items.TAGS.split(',').filter((item) => item.trim() != ''));
      data.setTags(_items.TAGS);
    }
  }

  // function read_categories(){
  //   if(_items.CATEGORIES){
  //     data.setCategories(_items.CATEGORIES.split(',').map((item) => item.trim()));
  //   }
  // }

  function read_layout(){
    if(_items.LAYOUT){
      data.layout = _items.LAYOUT;
    }
  }

  function read_comments(){
    if(_items.COMMENTS == "no"){
      data.comments = false;
    }
  }

  function read_all() {
    if (!/.*\.org/.test(data.source)) {
      // skip if is not a org file
      return data;
    }
    read_in();
    read_title();
    // read_date();
    read_tags();
    // read_categories();
    read_layout();
    read_comments();
    return data;
  }
}

