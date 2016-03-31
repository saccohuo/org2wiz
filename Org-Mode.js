var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org-Mode.js");

function InitOMButton(){
  var languangeFileName = org_mode_pluginPath + "plugin.ini";
  objWindow.AddToolButton("document", "OMButton", "Org2Wiz", "", "OnOMButtonClicked");
}
function InitmdExportButton(){
  var languangeFileName = org_mode_pluginPath + "plugin.ini";
  objWindow.AddToolButton("document", "mdExportButton", "mdExport", "", "OnmdExportButtonClicked");
}

InitOMButton();
InitmdExportButton();
//-------------Init button complete

//--------------- check attachment complete
function OnOMButtonClicked(){ 
  if(MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase() != '.org')
    return;
    
  if(objWindow.CurrentDocument.AttachmentCount==0)
    return;

  var OrgFile =  objWindow.CurrentDocument.Attachments.Item(0).FileName; 

  if(MFGetFileExtension(OrgFile).toLowerCase() != '.org')
    return;

  strCmd = "emacs.exe";
  strParam = " --batch -q --no-site-file --visit \""+OrgFile+"\" --funcall org-html-export-to-html"; 

  objCommon.RunExe(strCmd, strParam, true);

  var HtmlFile = OrgFile.replace(/\.org$/i,'.html'); 
  if(!objCommon.PathFileExists(HtmlFile))
    return;
    
  objWindow.CurrentDocument.Type = "wholewebpage";
  objWindow.CurrentDocument.UpdateDocument6(HtmlFile, HtmlFile, 0x0204); //may be 0x0008

  objCommon.RunExe("cmd ", "/c del /f /q \""+HtmlFile+"\"", true);
}

function OnmdExportButtonClicked(){
//  var ext = MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase();
//  if (ext != '.mdp' && ext !='.org')
//    return;
    
  var exportfilename = objWindow.CurrentDocument.Title.replace(MFGetFileExtension(objWindow.CurrentDocument.Title), ".export");
  objWindow.CurrentDocument.Type = "wholewebpage";
  
  var objFolder = objDatabase.GetFolderByLocation("/Export/", true);
  var objDoc = objFolder.CreateDocument2(exportfilename, "");
  objDoc.ChangeTitleAndFileName(exportfilename);
  objDoc.Type = "wholewebpage";
  
  
///////////////////////// convert outer css file into embeded style
  var csstxt_all="";
  for ( var i = 0; i < objWindow.CurrentDocumentHtmlDocument.styleSheets.length; i++ ){
    try{
    	for(var j=0; j<objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssRules.length; j++)
        csstxt_all+= objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssRules[j].cssText;
    }catch(ex){
    	csstxt_all+= objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssText;
    }
  }
  oLinks=objWindow.CurrentDocumentHtmlDocument.getElementsByTagName('link');
  for(var i=0; i< oLinks.length; i++){
    if(oLinks.item(i).rel=='stylesheet')
      try{oLinks.item(i).parentNode.removeChild(oLinks.item(i));} catch(ex){oLinks.item(i).removeNode(true);}
  }
  oStyles=objWindow.CurrentDocumentHtmlDocument.getElementsByTagName('style');
  for(var i=0; i< oStyles.length; i++){
    try{oStyles.item(i).parentNode.removeChild(oStyles.item(i));} catch(ex){oStyles.item(i).removeNode(true);}
  }
  MFAppendStyleInnerHtml(objWindow.CurrentDocumentHtmlDocument, csstxt_all);
////////////////////////  

  //objDoc.UpdateDocument2(objWindow.CurrentDocumentHtmlDocument, 0x24);
  objDoc.UpdateDocument4('<html>'+objWindow.CurrentDocumentHtmlDocument.documentElement.innerHTML+'</html>',"", 0x4);
  
  WizAlert("Export Ok!");
}

//---------------------------------------------------------------
eventsHtmlDocumentComplete.add(OnOrgHtmlDocumentComplete);
function OnOrgHtmlDocumentComplete(doc){
  var file_ext = MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase()
  if(objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "EnableMarkdown") == '1' && 
    file_ext == '.mdp')
    MFInitMarkdown(doc);

  if(objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "EnableMathJax") == '1' &&
     ( file_ext == '.mdp' || file_ext == '.mjp' || file_ext == '.org')){
      if(MFIsIE())
        MFInitMathJax(doc);
      else          
        setTimeout(function(){MFInitMathJax(doc);},500);
  }
}
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//--------------------------------------------
function MFGetFileExtension(Fstr){ 
  pos = Fstr.lastIndexOf('.');
  if(pos == -1)
    return "";
  else
    return Fstr.substr(pos);
}
function MFIsIE(){
  if(navigator.userAgent.indexOf("MSIE")>0)
    return true;
  else
    return false;
}
function MFins_elem(doc, part, elem_type, callbackfunc){
  var oPart = doc.getElementsByTagName(part).item(0); 
  var oElem = doc.createElement(elem_type); 
  callbackfunc(oElem);
  //oHead.appendChild(oElem); 
  oPart.insertBefore(oElem,null); //because IE bug, use insertBefore;
  return oElem;
}

function MFAppendScriptSrc(doc, part, script_type, str){

  MFins_elem(doc, part, "script", function(oScript) {
                                  oScript.type = script_type; 
                                  oScript.defer = true;
                                  oScript.src = ("file:///" +  str).replace(/\\/g,'/'); 
                                  }
  );
}

function MFAppendCssSrc(doc, str){
  MFins_elem(doc, 'HEAD', "link", function(oCss) {
                                  oCss.rel = "stylesheet"; 
                                  oCss.href = ("file:///" +  str).replace(/\\/g,'/'); 
                                  }
  );
}

function MFAppendInnerHtml_IE6(doc, part, innerHtmlStr){
  MFins_elem(doc, part, "div",  function(oDiv) {
                                oDiv.id= "TmpIdForAppendScriptInnerHtml1";
                                oDiv.innerHTML =  "<input type=\"hidden\" id=TmpIdForAppendScriptInnerHtml2>"+innerHtmlStr; 
                                }
  );
  var oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml1');
  oElem.removeNode(false);
  oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml2');
  oElem.removeNode(true);
}

function MFAppendInnerHtml_IE6WithW3CAPI(doc, part, innerHtmlStr)
{ //The implementation seems strange, because it need to compatible with IE6 and above and wibkit
  MFins_elem(doc, part, "div",  function(oDiv) {
                                oDiv.id= "TmpIdForAppendScriptInnerHtml1";
                                oDiv.innerHTML =  "<input type=\"hidden\" id=TmpIdForAppendScriptInnerHtml2>"+innerHtmlStr; 
                                }
  );
  var oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml1');
  while(oElem.firstChild)  {
    oElem.parentNode.insertBefore(oElem.firstChild,oElem);  
  }
  oElem.parentNode.removeChild(oElem);//oElem.removeNode(false);
  oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml2');
  oElem.parentNode.removeChild(oElem);//oElem.removeNode(true);
}

function MFAppendStyleInnerHtml(doc, str){
  try{
    MFins_elem(doc, 'HEAD', "style", function(oCss) {
                                    oCss.type = "text/css"; 
                                    oCss.innerHTML = str; 
                                    }
    );
  }catch(ex){
    MFAppendInnerHtml_IE6(doc, 'head', '<style type="text/css">'+str+'</style>');
  }
}

function MFAppendScriptInnerHtml(doc, part, script_type,innerHtmlStr)
{ 
  try{
    MFins_elem(doc, part, "script", function(oCss) {
                                    oCss.type = script_type; 
                                    oCss.innerHTML = innerHtmlStr; 
                                    }
    );
  }catch(ex){
    MFAppendInnerHtml_IE6(doc, part, "<script defer=\"true\" type=\"" + script_type + "\">" + innerHtmlStr + "</scr" + "ipt>");
  }
}

//----------------------------------------------------------------------
function MFAppendMathJaxConfig(doc){
  var innerHtmlStr = "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}}); \
                      MathJax.Hub.Config({tex2jax: {displayMath: [ ['$$','$$'], [\"\\\\[\",\"\\\\]\"], [\"\\\\begin{displaymath}\",\"\\\\end{displaymath}\"] ]}});\
                      MathJax.Hub.Config({ TeX: { equationNumbers: {autoNumber: \"all\", useLabelIds: true} } });  \
                      MathJax.Hub.Config({ TeX: { extensions: [\"cancel.js\"] } });\
                     "; 
  MFAppendScriptInnerHtml(doc, 'BODY', "text/x-mathjax-config", innerHtmlStr);
}

function MFInitMathJax(doc){
  //http://docs.mathjax.org/en/v1.1-latest/configuration.html
  MFAppendMathJaxConfig(doc); // A simple MathJax configuration for test 
  
  //the 1st method to load mathjax, can speed up the processing
  //AppendScriptSrc('HEAD', "text/javascript", "MathJax\\MathJax.js?config=Accessible&delayStartupUntil=configured");
  //AppendScriptInnerHtml('BODY', "text/javascript", "MathJax.Hub.Configured();");
  
  //the 2nd method
  MFAppendScriptSrc(doc, 'BODY', "text/javascript", org_mode_pluginPath+"MathJax\\MathJax.js?config=Accessible");
}
//------------------------------------------------------------------------
//------------------------------------------------------------
/* Choose Which version of Markdown*/

function MFParseMarkdownContent(objHtmDoc,MarkdownFunction){
  var title = objHtmDoc.title; 
  if (MFGetFileExtension(title).toLowerCase() == '.mdp'){
    //var a=objHtmDoc.getElementById('WizHtmlContentId'); 

    var objImgs = objHtmDoc.getElementsByTagName('img'); 
    for(var i=0; i<objImgs.length; i++)    {
      var oImg = objImgs.item(i);
      var oElem= objHtmDoc.createElement("div"); 
      oElem.innerHTML = "<input type=\"hidden\">!["+ oImg.src + "](" + oImg.src + ")"; 
      oImg.parentNode.insertBefore( oElem, oImg);
    }    
    
    var a=objHtmDoc.getElementsByTagName('BODY').item(0); 
    var innerText=a.innerText;
    innerText=innerText.replace(/ \\\\ /ig,' \\\\\\\\ ');

    var md_reg_DoItalicsAndBold_31 = new RegExp(
          '(((?!\\w)[\\s\\S]|^)\\${1,2})'
        + '(?=\\S)'
        + '(?!_\\$)'
        +  '([^\\$]+?)'
        +  '_'
        +  '([^\\$]+?)'
        +  '_'
        +  '([^\\$]+?)'
        + '\\${1,2}'
        + '(?!\\w)'
        , "g" );
    innerText=innerText.replace(md_reg_DoItalicsAndBold_31, "$1$3\\_$4\\_$5$1").replace(/(\r\n){2}/g, "\r\n");
    
    a.innerHTML=(MarkdownFunction(innerText));
    var codeBlocks = objHtmDoc.getElementsByTagName("code");
    for (var i = 0; i < codeBlocks.length; i++){
      hljs.highlightBlock(codeBlocks[i], '    ');
    }
  }
}

function MFInitMarkdown(doc){
  MarkdownImplementation="MFInit_" + objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "MarkdownImplementation")+"(doc);";
  eval(MarkdownImplementation);
}
//-----------------------------------------------------------------

function MFInit_js_markdown_extra(doc){
  MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\js_markdown_extra\\js-markdown-extra.js"); 
  MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\js_markdown_extra\\highlight.pack.js");
  MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\js_markdown_extra\\GitHub2.css");
  MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\js_markdown_extra\\md.css");
  
  if(MFIsIE())
    MFAppendScriptInnerHtml(doc, 'BODY', "text/javascript", 
                          MFGetFileExtension.toString()+
                          MFParseMarkdownContent.toString()+
                          "MFParseMarkdownContent(document,Markdown);"
    );
  else
    MFAppendScriptInnerHtml(doc, 'BODY', "text/javascript", 
                          MFGetFileExtension.toString()+
                          MFParseMarkdownContent.toString()+
                          "setTimeout(function(){MFParseMarkdownContent(document,Markdown);}, 200);"
    );
}

function MFInit_marked(doc){
  MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\marked\\marked.js"); 
  MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\marked\\highlight.pack.js");
  MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\marked\\GitHub2.css");

  if(MFIsIE())
	  MFAppendScriptInnerHtml(doc, 'HEAD', "text/javascript", 
	                        MFGetFileExtension.toString()+
	                        MFParseMarkdownContent.toString()+
	                        "MFParseMarkdownContent(document, marked);"
	  );
	else
	  MFAppendScriptInnerHtml(doc, 'HEAD', "text/javascript", 
	                        MFGetFileExtension.toString()+
	                        MFParseMarkdownContent.toString()+
	                        "setTimeout(function(){MFParseMarkdownContent(document, marked);}, 200);"
	  );
}
